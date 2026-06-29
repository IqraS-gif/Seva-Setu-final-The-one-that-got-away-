from app.config.firebase_config import db # type: ignore
from firebase_admin import firestore # type: ignore
from google.cloud.firestore_v1.base_query import FieldFilter # type: ignore
from typing import Any

def get_previous_complaints_insights(primary_category: Any, sub_category: Any) -> str:
    """
    Queries Firestore to find historical data on similar complaints.
    Provides a text-based insight for the AI to include in the structured report.
    """
    try:
        # Resolve bilingual objects to strings for the database query with null safety
        p_cat_str = ""
        if primary_category:
            p_cat_str = primary_category.get("en") if isinstance(primary_category, dict) else primary_category
            
        s_cat_str = ""
        if sub_category:
            s_cat_str = sub_category.get("en") if isinstance(sub_category, dict) else sub_category

        if not p_cat_str or not s_cat_str:
            return "Not enough data for historical comparison."

        # Query Firestore for reports within the same primary/sub category
        collection_ref = db.collection("community_reports")
        
        # Simple query for exact matches on category and subcategory using FieldFilter to avoid warnings
        query_ref = collection_ref.where(filter=FieldFilter("primary_category", "==", p_cat_str)) \
                             .where(filter=FieldFilter("sub_category", "==", s_cat_str)) \
                             .limit(20)
        
        docs = query_ref.stream()
        
        count = 0
        total_severity = 0
        resolved_count = 0
        
        for doc in docs:
            data = doc.to_dict()
            count += 1
            severity = data.get("severity_score")
            if isinstance(severity, (int, float)):
                total_severity += severity
            
            if data.get("problem_status") == "Resolved":
                resolved_count += 1
        
        if count == 0:
            return f"No previous records for '{s_cat_str}' under '{p_cat_str}' were found in the system yet."
        
        avg_severity = total_severity / count if count > 0 else 0
        insight = f"There have been {count} similar reports of '{s_cat_str}' recorded."
        
        if resolved_count > 0:
            insight += f" Notably, {resolved_count} of these have been successfully resolved."
        else:
            insight += " None of these similar reports have been marked as resolved yet."
            
        if avg_severity > 0:
            insight += f" The average severity level of these incidents is {avg_severity:.1f}/10."
            
        return insight
        
    except Exception as e:
        print(f"Error in get_previous_complaints_insights: {e}")
        # Return a fallback message so the app doesn't crash
        return "Historical data comparison is currently unavailable."
