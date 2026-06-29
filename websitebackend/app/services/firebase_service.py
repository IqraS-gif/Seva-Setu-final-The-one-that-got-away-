import firebase_admin  # type: ignore
from firebase_admin import credentials, firestore  # type: ignore
from google.cloud.firestore_v1.base_query import FieldFilter  # type: ignore
from app.config.settings import FIREBASE_CREDENTIALS_PATH, FIREBASE_STORAGE_BUCKET, PROJECT_ID
import datetime
import os

# Initialize Firebase Admin
if not firebase_admin._apps:
    try:
        # 1. Try environment variable or default path
        if FIREBASE_CREDENTIALS_PATH and os.path.exists(FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            print(f"[FIREBASE] Initialized with certificate: {FIREBASE_CREDENTIALS_PATH}", flush=True)
        else:
            # 2. Fallback to Application Default Credentials (ideal for GCP Environment)
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, {
                'projectId': PROJECT_ID,
            })
            print(f"[FIREBASE] Initialized with Application Default Credentials (GCP)", flush=True)
    except Exception as e:
        print(f"[FIREBASE ERROR] Failed to initialize: {e}", flush=True)
        # 3. Last resort fallback (unauthenticated/readonly if supported by service account)
        firebase_admin.initialize_app()
        print("[FIREBASE] Initialized with default settings", flush=True)

db = firestore.client()


def get_or_create_user(user_data: dict) -> dict:
    """
    Creates or updates a user document in Firestore.
    """
    user_ref = db.collection("website_users").document(user_data["uid"])
    doc = user_ref.get()

    if doc.exists:
        user_ref.update({
            "last_login": datetime.datetime.utcnow().isoformat(),
            "role": user_data.get("role", doc.to_dict().get("role", "citizen")),
        })
        return user_ref.get().to_dict()
    else:
        new_user = {
            "uid": user_data["uid"],
            "email": user_data["email"],
            "display_name": user_data.get("display_name", ""),
            "photo_url": user_data.get("photo_url", ""),
            "role": user_data.get("role", "citizen"),
            "created_at": datetime.datetime.utcnow().isoformat(),
            "last_login": datetime.datetime.utcnow().isoformat(),
        }
        user_ref.set(new_user)
        return new_user


def _strip_attachment_data(obj):
    """
    Recursively removes the 'data' field from all attachments 
    before saving to Firestore to prevent document size limit errors.
    """
    if isinstance(obj, list):
        return [_strip_attachment_data(i) for i in obj]
    if isinstance(obj, dict):
        new_obj = {k: v for k, v in obj.items() if k != 'data'}
        return {k: _strip_attachment_data(v) for k, v in new_obj.items()}
    return obj


# ── Global Session Cache ──────────────────────────────
# Prevents 429 'Quota Exceeded' by remembering reports in memory for the process lifetime.
REPORT_CACHE = {}
ISSUE_CACHE = {}

def get_user_reports_cached(user_email: str) -> list:
    """
    Fetches reports from memory if available, otherwise from Firestore.
    """
    user_email = user_email.lower().strip()
    if user_email in REPORT_CACHE:
        print(f"[CACHE HIT] Serving {len(REPORT_CACHE[user_email])} reports from memory for {user_email}.", flush=True)
        return REPORT_CACHE[user_email]
    
    print(f"[CACHE MISS] Fetching reports from Firestore for {user_email}...", flush=True)
    reports = get_user_reports(user_email)
    REPORT_CACHE[user_email] = reports
    return reports

def clear_report_cache(user_email: str):
    """Manually clear cache for a user (e.g. after a new scan)."""
    email = user_email.lower().strip()
    if email in REPORT_CACHE:
        del REPORT_CACHE[email]

def get_issue_cached(issue_id: str) -> dict | None:
    """
    Fetches an issue from memory if available, otherwise from Firestore.
    """
    if issue_id in ISSUE_CACHE:
        print(f"[CACHE HIT] Serving issue {issue_id} from memory.", flush=True)
        return ISSUE_CACHE[issue_id]
    
    print(f"[CACHE MISS] Fetching issue {issue_id} from Firestore...", flush=True)
    doc = db.collection("issues").document(issue_id).get()
    if doc.exists:
        data = doc.to_dict()
        data["id"] = doc.id
        ISSUE_CACHE[issue_id] = data
        return data
    return None

def clear_issue_cache(issue_id: str):
    """Manually clear cache for an issue."""
    if issue_id in ISSUE_CACHE:
        del ISSUE_CACHE[issue_id]

def save_report(user_email: str, report_data: dict, email_subject: str = "", embedding: list[float] = None) -> str:
    # Clear cache before saving to ensure next fetch is fresh
    clear_report_cache(user_email)
    
    clean_report = _strip_attachment_data(report_data)
    report_doc = {
        "user_email": user_email,
        "email_subject": email_subject,
        "report": clean_report,
        "created_at": datetime.datetime.utcnow().isoformat(),
        "embedding": embedding, # Vector for Hybrid Memory
    }
    doc_ref = db.collection("survey_reports").add(report_doc)
    return doc_ref[1].id


def get_user_reports(user_email: str) -> list:
    """
    Fetches all reports for a given user email.
    Uses simple query without ordering to avoid needing a composite index.
    """
    docs = (
        db.collection("survey_reports")
        .where(filter=FieldFilter("user_email", "==", user_email.lower().strip()))
        .limit(20)
        .stream()
    )

    reports = []
    for doc in docs:
        data = doc.to_dict()
        report = data.get("report", {})
        report["id"] = doc.id
        report["created_at"] = data.get("created_at", "")
        report["email_subject"] = data.get("email_subject", "")
        report["embedding"] = data.get("embedding")
        reports.append(report)

    # Sort in Python instead of Firestore to avoid composite index requirement
    reports.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)
    return reports


def get_report_by_id(report_id: str) -> dict | None:
    """
    Fetches a specific report by its document ID.
    """
    doc = db.collection("survey_reports").document(report_id).get()
    if doc.exists:
        data = doc.to_dict()
        report = data.get("report", {})
        report["id"] = doc.id
        report["created_at"] = data.get("created_at", "")
        return report
    return None


def get_user_settings(user_email: str) -> dict:
    """
    Fetches user settings (allowed senders, etc.) from Firestore.
    """
    doc = db.collection("user_settings").document(user_email).get()
    if doc.exists:
        return doc.to_dict()
    return {"allowed_senders": []}


def save_user_settings(user_email: str, settings: dict) -> None:
    """
    Saves user settings to Firestore.
    """
    db.collection("user_settings").document(user_email).set(
        settings, merge=True
    )


# ── Issue Tracking Functions ─────────────────────────

def get_user_issues(user_email: str) -> list:
    """Fetch all open issues for a user."""
    docs = (
        db.collection("issues")
        .where(filter=FieldFilter("user_email", "==", user_email))
        .where(filter=FieldFilter("status", "==", "open"))
        .stream()
    )
    issues = []
    for doc in docs:
        i_data = doc.to_dict()
        i_data["id"] = doc.id
        issues.append(i_data)
    issues.sort(key=lambda x: x.get("last_updated", ""), reverse=True)
    return issues


def save_new_issue(user_email: str, label: str, category: str, email_data: dict) -> str:
    """Creates a new issue and returns its ID."""
    now = datetime.datetime.utcnow().isoformat()
    clean_email = _strip_attachment_data(email_data)
    issue_doc = {
        "user_email": user_email,
        "label": label,
        "category": category,
        "status": "open",
        "created_at": now,
        "last_updated": now,
        "emails": [clean_email],
    }
    doc_ref = db.collection("issues").add(issue_doc)
    issue_id = doc_ref[1].id
    
    # Update cache if it exists
    ISSUE_CACHE[issue_id] = {**issue_doc, "id": issue_id}
    
    db.collection("processed_emails").document(email_data["id"]).set({
        "issue_id": issue_id,
        "processed_at": now
    })
    
    return issue_id


def append_email_to_issue(issue_id: str, email_data: dict) -> None:
    """Appends an email to an existing issue."""
    now = datetime.datetime.utcnow().isoformat()
    doc_ref = db.collection("issues").document(issue_id)
    doc = doc_ref.get()
    
    if doc.exists:
        existing_emails = doc.to_dict().get("emails", [])
        if any(e.get("id") == email_data["id"] for e in existing_emails):
            return
            
        clean_email = _strip_attachment_data(email_data)
        doc_ref.update({
            "emails": firestore.ArrayUnion([clean_email]),
            "last_updated": now
        })
        
        # Invalidate cache to force reload on next read
        clear_issue_cache(issue_id)
        
        db.collection("processed_emails").document(email_data["id"]).set({
            "issue_id": issue_id,
            "processed_at": now
        })


def mark_email_as_processed(email_id: str) -> None:
    """Returns a set of email IDs that have already been mapped to an issue."""
    now = datetime.datetime.utcnow().isoformat()
    db.collection("processed_emails").document(email_id).set({
        "processed_at": now,
        "status": "ignored"
    })

def get_processed_email_ids(email_id_list: list[str]) -> set:
    """Returns a set of email IDs that have already been mapped to an issue."""
    if not email_id_list:
        return set()
        
    processed = set()
    chunks = [email_id_list[i:i + 30] for i in range(0, len(email_id_list), 30)]
    for chunk in chunks:
        doc_refs = [db.collection("processed_emails").document(eid) for eid in chunk]
        snapshots = db.get_all(doc_refs)
        for snap in snapshots:
            if snap.exists:
                processed.add(snap.id)
            
    return processed

def get_unindexed_reports() -> list:
    """Fetches reports that don't have a valid vector embedding yet."""
    # Use server-side filter to only read relevant docs
    docs = (
        db.collection("survey_reports")
        .where(filter=FieldFilter("embedding", "==", None))
        .limit(20)
        .stream()
    )
    reports = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        reports.append(d)
    return reports

def update_report_embedding(report_id: str, embedding: list[float]) -> None:
    """Updates an existing report document with its vector embedding."""
    db.collection("survey_reports").document(report_id).update({
        "embedding": embedding
    })

