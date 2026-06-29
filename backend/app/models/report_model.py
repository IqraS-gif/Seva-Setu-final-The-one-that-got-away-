from pydantic import BaseModel # type: ignore
from typing import Optional, List, Any

class ReportCreate(BaseModel):
    # Metadata
    citizen_id: Optional[str] = None
    citizen_name: Optional[str] = None
    phone: Optional[str] = None
    precise_location: Optional[str] = None
    gps_coordinates: Optional[str] = None
    demographic_tally: Optional[int] = None
    
    # Problem
    executive_summary: Optional[Any] = None
    primary_category: Optional[Any] = None
    sub_category: Optional[Any] = None
    problem_status: Optional[Any] = None
    duration_of_problem: Optional[Any] = None
    urgency_level: Optional[Any] = None
    service_status: Optional[Any] = None

    # Impact
    severity_score: Optional[int] = None
    severity_reason: Optional[Any] = None
    population_affected: Optional[int] = None
    vulnerable_group: Optional[Any] = None
    vulnerability_flag: Optional[Any] = None
    secondary_impact: Optional[Any] = None

    # Action & Follow-up
    expected_resolution_timeline: Optional[List[Any]] = None
    detailed_resolution_steps: Optional[List[Any]] = None
    follow_up_date: Optional[str] = None
    status: Optional[str] = "Open"
    govt_scheme_applicable: Optional[Any] = None
    ai_recommended_actions: Optional[Any] = None

    # Insights
    previous_complaints_insights: Optional[Any] = None

    # Qualitative
    key_complaints: Optional[List[Any]] = None
    sentiment: Optional[Any] = None
    key_quote: Optional[Any] = None
    description: Optional[Any] = None
    
    # System Data
    auto_category: Optional[Any] = None
    volunteer_id: Optional[str] = None
    report_source: Optional[str] = None
    assigned_ngo_id: Optional[str] = None
    assigned_ngo_name: Optional[str] = None
    photo_url: Optional[str] = None
    photo_public_id: Optional[str] = None
    audio_url: Optional[str] = None
    audio_public_id: Optional[str] = None
    media_attachments: Optional[List[dict]] = []
    
    # Legacy fields (for backward compatibility)
    location: Optional[str] = None
    issue_type: Optional[str] = None
