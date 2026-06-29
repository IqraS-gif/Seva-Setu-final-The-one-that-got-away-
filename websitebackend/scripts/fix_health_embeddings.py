"""
Fix missing embeddings for Health-category reports (or any category).
Run: python scripts/fix_health_embeddings.py
"""
import sys, os, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.firebase_service import db
from app.services.gemini_service import generate_embedding, get_report_context_string

print("\n=== FIXING MISSING EMBEDDINGS ===\n")

docs = list(db.collection("survey_reports").stream())
fixed = 0
skipped = 0
failed = 0

for doc in docs:
    data = doc.to_dict()
    
    # Skip if already has embedding
    if data.get("embedding"):
        skipped += 1
        continue
    
    report = data.get("report", {})
    category = report.get("primary_category", "?")
    subject = (data.get("email_subject") or "No subject")[:50]
    user_email = data.get("user_email", "?")
    
    print(f"  Fixing [{category}]: {subject}")
    
    try:
        context_str = get_report_context_string(report)
        embedding = generate_embedding(context_str)
        
        if embedding:
            db.collection("survey_reports").document(doc.id).update({
                "embedding": embedding
            })
            print(f"    ✅ Saved embedding ({len(embedding)} dims)")
            fixed += 1
        else:
            print(f"    ❌ Embedding generation returned None")
            failed += 1
            
        # Avoid Gemini rate limits (free tier: 15/min)
        time.sleep(4)
        
    except Exception as e:
        print(f"    ❌ Error: {e}")
        failed += 1

print(f"\n=== DONE: {fixed} fixed, {skipped} skipped (already had embedding), {failed} failed ===\n")
print("Restart your backend to clear the report cache and pick up new embeddings!")
