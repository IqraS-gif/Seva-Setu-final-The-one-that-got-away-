"""
Debug script: Dump all reports from Firestore so we can see what emails/categories are stored.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.firebase_service import db
from collections import defaultdict

docs = list(db.collection("survey_reports").stream())

report_list = []
for doc in docs:
    data = doc.to_dict()
    report = data.get("report", {})
    email = data.get("user_email", "MISSING")
    has_embedding = bool(data.get("embedding"))
    category = report.get("primary_category", "N/A")
    summary = (report.get("executive_summary") or "")[:70]
    subject = (data.get("email_subject") or "N/A")[:60]
    created = (data.get("created_at") or "N/A")[:10]
    report_list.append({
        "id": doc.id, "email": email, "category": category,
        "has_embedding": has_embedding, "subject": subject,
        "summary": summary, "created": created,
    })

by_email = defaultdict(list)
for r in report_list:
    by_email[r["email"]].append(r)

output = ["\n=== FIRESTORE DEBUG ===\n"]
for email, reports in by_email.items():
    output.append(f"USER: {email} | {len(reports)} reports")
    for r in reports:
        embed = "EMBED:YES" if r["has_embedding"] else "EMBED:NO"
        output.append(f"  {r['created']} | {r['category']:15s} | {embed} | {r['summary'][:60]}")
    output.append("")

output.append(f"TOTAL: {len(report_list)} reports across {len(by_email)} users")
print("\n".join(output))
