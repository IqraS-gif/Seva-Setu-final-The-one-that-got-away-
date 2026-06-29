from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import jwt
import datetime

from app.config.firebase_config import db  # type: ignore

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class GoogleAuthRequest(BaseModel):
    google_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_role: str
    user_id: str
    is_new_user: bool


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_JWT_SECRET = os.getenv("JWT_SECRET")
if not _JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is not set. Add it to your .env file.")
_JWT_ALGORITHM = "HS256"
_JWT_EXPIRY_DAYS = 7


def _make_jwt(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=_JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, _JWT_SECRET, algorithm=_JWT_ALGORITHM)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/google", response_model=AuthResponse)
async def google_auth(body: GoogleAuthRequest):
    """
    Called by the mobile app after a successful Google OAuth flow.
    Looks up the user in Firestore by email:
    - If found   → updates name & picture, returns existing role.
    - If not found → creates new account with the requested role.
    Returns a signed JWT plus role/id so the app can navigate correctly.
    """
    try:
        # ── 1. Look up existing user by email ──────────────────────────────
        users_ref = db.collection("users")
        query = users_ref.where("email", "==", body.email).limit(1).stream()
        existing_docs = list(query)

        is_new_user = len(existing_docs) == 0

        if is_new_user:
            # ── 2a. Create new user with requested role (defaulting to citizen) ──
            requested_role = (body.role or "citizen").lower()
            new_user_data = {
                "google_id": body.google_id,
                "email": body.email,
                "name": body.name,
                "picture": body.picture,
                "role": requested_role,
                "created_at": datetime.datetime.utcnow().isoformat(),
            }
            _, new_doc_ref = users_ref.add(new_user_data)
            user_id = new_doc_ref.id
            user_role = requested_role

        else:
            # ── 2b. Update existing user's name & picture ───────────────────
            doc = existing_docs[0]
            user_id = doc.id
            user_data = doc.to_dict()
            user_role = user_data.get("role", "citizen")

            users_ref.document(user_id).update({
                "name": body.name,
                "picture": body.picture,
                "google_id": body.google_id,  # keep in sync in case it rotated
            })

        # ── 3. Generate JWT ────────────────────────────────────────────────
        token = _make_jwt(user_id, body.email, user_role)

        return AuthResponse(
            access_token=token,
            user_role=user_role,
            user_id=user_id,
            is_new_user=is_new_user,
        )

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
