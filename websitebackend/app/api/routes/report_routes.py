from fastapi import APIRouter, HTTPException, Query, Body # type: ignore
from pydantic import BaseModel # type: ignore
from app.services.firebase_service import get_user_reports_cached, get_report_by_id
from app.services.memory_service import get_hybrid_context, build_qa_prompt
from app.services.gemini_service import _get_client, MODEL_ID

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.delete("/cache/clear")
async def clear_all_caches():
    """Admin: Clear all in-memory report caches to force fresh Firestore reads."""
    from app.services.firebase_service import REPORT_CACHE, ISSUE_CACHE
    report_count = len(REPORT_CACHE)
    issue_count = len(ISSUE_CACHE)
    REPORT_CACHE.clear()
    ISSUE_CACHE.clear()
    return {"message": f"Cache cleared: {report_count} report entries, {issue_count} issue entries removed."}


@router.get("/")
async def list_reports(user_email: str = Query(..., description="User email to fetch reports for")):
    """
    Lists all generated survey reports for a user.
    """
    try:
        reports = get_user_reports_cached(user_email)
        return {"reports": reports, "count": len(reports)}
    except Exception as e:
        print(f"Error fetching reports: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(e)}")


@router.get("/{report_id}")
async def get_report(report_id: str):
    """
    Gets a specific report by its ID.
    """
    report = get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"report": report}

class MemoryQueryRequest(BaseModel):
    query: str
    user_email: str
    group_id: str | None = None
    group_label: str | None = None

@router.post("/memory/chat")
async def chat_with_memory(request: MemoryQueryRequest):
    print(f"\n[HTTP] CHAT REQUEST: '{request.query}' | Mode: {'Individual' if request.group_id else 'Global'}")
    """
    Search reports and chat with AI about the user's community history.
    Supports both Global and Individual (group) modes.
    """
    try:
        # 1. Get relevant context from memory
        memories = get_hybrid_context(
            query=request.query,
            user_email=request.user_email,
            group_id=request.group_id,
            top_k=10
        )
        
        if not memories:
            # Fallback that still preserves the Context of the selected group!
            context_str = f"The user is focused on the issue group: '{request.group_label}'." if request.group_label else "The user is viewing their global community history."
            prompt = f"""
            You are the SevaSetu AI Assistant. {context_str}
            
            USER QUESTION: "{request.query}"
            
            INSTRUCTIONS:
            1. Focus your answer strictly on the context provided ({request.group_label or 'global history'}).
            2. If you don't have specific reports in context, admit it, but stay on the topic of the user's current view.
            3. Do NOT give general essays about community service. Be specific and helpful.
            """
        else:
            # 2. Build the RAG (Retrieval Augmented Generation) prompt
            prompt = build_qa_prompt(
                query=request.query,
                memories=memories,
                group_label=request.group_label
            )

        # 3. Call Gemini
        gemini_client = _get_client()
        if not gemini_client:
            raise HTTPException(status_code=503, detail="AI service unavailable (missing API key)")
        response = gemini_client.models.generate_content(
            model=MODEL_ID,
            contents=prompt
        )
        
        # 4. Extract unique attachments ONLY from category-matched, high-confidence memories
        query_lower = request.query.lower()
        health_kws = {"health", "maternal", "pregnant", "anganwadi", "ambulance", "hospital", "doctor", "medical", "women", "postnatal"}
        infra_kws = {"pothole", "road", "pipe", "water", "infrastructure", "sanitation", "drainage"}
        is_health_query = any(k in query_lower for k in health_kws)
        is_infra_query = any(k in query_lower for k in infra_kws)
        
        attachments = []
        seen_files = set()
        
        for m in memories:
            # High confidence threshold for automatic evidence inclusion
            if m["score"] < 0.6:
                continue
            
            r_cat = (m["report"].get("primary_category") or "").lower()
            
            # Category-matched evidence only:
            # If querying health, only show attachments from Health reports
            # If querying infra, only show attachments from Infra reports
            if is_health_query and r_cat not in {"health"}:
                continue
            if is_infra_query and r_cat in {"health"}:
                continue
                
            report_attachments = m["report"].get("attachments", [])
            if not report_attachments:
                continue
                
            for att in report_attachments:
                name = att.get("name") or att.get("filename") or "Document"
                url = att.get("url")
                if not url: continue
                
                clean_path = url.split('?')[0]
                file_id = clean_path.split('/')[-1].lower()
                dedupe_key = f"{name.lower()}_{file_id}"
                
                if dedupe_key not in seen_files:
                    attachments.append({
                        "name": name,
                        "url": url,
                        "mime": att.get("mime_type", "application/octet-stream"),
                        "report_id": m["report"].get("id")
                    })
                    seen_files.add(dedupe_key)

        # 5. Build clean sources — filter out corrupted/spam reports
        BAD_SOURCE_PHRASES = {"error generating report", "unstop", "talent surve", "quiz", "hackathon", "competition"}
        clean_sources = []
        clean_report_ids = []
        for m in memories:
            summary = (m["report"].get("executive_summary") or "").strip()
            summary_lower = summary.lower()
            # Skip empty, error, or spam summaries
            if not summary or any(phrase in summary_lower for phrase in BAD_SOURCE_PHRASES):
                continue
            clean_sources.append(summary)
            clean_report_ids.append(m["report"].get("id"))
        
        return {
            "answer": response.text.strip(),
            "sources": clean_sources,
            "report_ids": clean_report_ids,
            "attachments": attachments
        }
    except Exception as e:
        print(f"Memory chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
