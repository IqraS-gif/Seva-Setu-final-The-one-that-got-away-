from groq import Groq # type: ignore
from google import genai  # type: ignore
from google.genai import types # type: ignore
import os
import json
import base64
import time
import re
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv  # type: ignore

load_dotenv()

# --- API Keys Rotation Logic ---
def get_all_gemini_keys() -> List[str]:
    keys = []
    # Check comma separated
    raw = os.getenv("GEMINI_API_KEYS", "")
    if raw:
        keys.extend([k.strip() for k in re.split(r'[;,]', raw) if k.strip()])
    # Check primary
    primary = os.getenv("GEMINI_API_KEY", "")
    if primary and primary not in keys:
        keys.append(primary.strip())
    # Check numbered
    pattern = re.compile(r"^GEMINI_API_KEY_(\d+)$")
    sorted_envs = sorted(
        [k for k in os.environ.keys() if pattern.match(k)],
        key=lambda x: int(pattern.match(x).group(1))
    )
    for k in sorted_envs:
        val = os.getenv(k, "").strip()
        if val and val not in keys:
            keys.append(val)
    return keys

api_keys = get_all_gemini_keys()

def get_keys(env_var: str) -> List[str]:
    raw = os.getenv(env_var, "")
    # Support both comma and semicolon separators
    return [k.strip() for k in re.split(r'[;,]', raw) if k.strip()]

groq_keys = get_keys("GROQ_API_KEYS") or get_keys("GROQ_API_KEY")

current_key_index = 0
current_groq_index = 0

if not api_keys and not groq_keys:
    raise ValueError("No GEMINI or GROQ API keys found in environment variables")

# Initial configuration with the first Gemini key if available
if api_keys:
    # Use the new Client object
    client = genai.Client(api_key=api_keys[0])
    # Initialize model name - gemini-2.5-flash
    model_name = 'gemini-2.5-flash' 
else:
    client = None
    model_name = 'gemini-2.5-flash'

def call_groq_fallback(prompt_data: Any) -> Any:
    """
    Fallback mechanism to use Groq if Gemini fails.
    Handles both text and multimodal (image) inputs.
    """
    global current_groq_index
    if not groq_keys:
        raise Exception("No Groq keys available for fallback.")
    
    key = groq_keys[current_groq_index % len(groq_keys)]
    client = Groq(api_key=key)
    
    # Process inputs: prompt_data could be a string or a list [prompt, file_part]
    prompt_text = ""
    image_data = None
    mime_type = "image/jpeg"
    
    if isinstance(prompt_data, list):
        for part in prompt_data:
            if isinstance(part, str):
                prompt_text = part
            elif hasattr(part, "data") and hasattr(part, "mime_type"):
                # Handle Google types.Part objects
                image_data = base64.b64encode(part.data).decode('utf-8')
                mime_type = part.mime_type
            elif isinstance(part, dict) and "data" in part:
                image_data = part["data"]
                mime_type = part.get("mime_type", "image/jpeg")
    else:
        prompt_text = str(prompt_data)
        
    try:
        print(f"🔀 [Fallback] Attempting Groq (Key {current_groq_index})...")
        messages = []
        if image_data:
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_text},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{image_data}"}
                    }
                ]
            })
            # Vision fallback is currently unavailable on Groq (Llama 3.2 Vision models are decommissioned).
            # Falling back to the best available text model.
            model_name = "llama-3.3-70b-versatile"
        else:
            messages.append({"role": "user", "content": prompt_text})
            model_name = "llama-3.3-70b-versatile"
            
        completion = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.1
        )
        
        # Mocking the Gemini response object structure enough for .text
        class MockResponse:
            def __init__(self, text):
                self.text = text
        
        return MockResponse(completion.choices[0].message.content)
    except Exception as e:
        print(f"!!! [Groq Fallback ERROR] {e}")
        current_groq_index += 1
        raise e

def retry_with_backoff(func, *args, max_retries=12, initial_delay=2, **kwargs):
    """
    Executes a function with exponential backoff, Gemini key rotation, 
    and eventual fallback to Groq.
    """
    global current_key_index
    retries = 0
    delay = initial_delay
    
    # Try all Gemini keys first
    gemini_key_count = len(api_keys) if api_keys else 0
    gemini_attempts = gemini_key_count * 2 # Allow 2 tries per key
    
    while retries < max_retries:
        try:
            # If we've exhausted Gemini or Gemini isn't configured, use Groq
            if (gemini_key_count > 0 and retries >= gemini_attempts) or not api_keys:
                return call_groq_fallback(args[0] if args else kwargs.get('contents'))
            
            if api_keys:
                 # Create a new client with the current rotated key
                 rotated_client = genai.Client(api_key=api_keys[current_key_index % len(api_keys)])
            
            # Using the new Client.models.generate_content
            contents = args[0] if args else kwargs.get('contents') or kwargs.get('content')
            
            # Use the global model_name or override from kwargs if present
            target_model = kwargs.get('model', model_name)
            
            return rotated_client.models.generate_content(
                model=target_model,
                contents=contents
            )
                
        except Exception as e:
            err_str = str(e).lower()
            
            # Common failure modes: 403 (Permission), 429 (Rate Limit), 503 (Overloaded)
            failed_but_rotatable = any(code in err_str for code in ["403", "401", "429", "resource exhausted", "denied", "permission"])
            
            if failed_but_rotatable:
                if len(api_keys) > 1:
                    current_key_index = (current_key_index + 1) % len(api_keys)
                    print(f"🔄 [Gemini Rotator] Key hit an issue. Rotating to Key Index {current_key_index}...")
                    retries += 1
                    continue 
                else:
                    print(f"!!! [Gemini API] Issue hit with no more keys. Falling back...")
                    retries = max_retries # Force fallback
                    continue
            elif "503" in err_str or "overloaded" in err_str or "500" in err_str:
                print(f"!!! [Gemini API] Server issue. Retrying in {delay}s...")
                time.sleep(delay)
                retries += 1
                delay *= 2
            else:
                # For unknown errors, try rotating once just in case
                if len(api_keys) > 1:
                    current_key_index = (current_key_index + 1) % len(api_keys)
                    retries += 1
                    continue
                raise e
    
    # Absolute final fallback if it somehow escapes the loop
    return call_groq_fallback(args[0] if args else kwargs.get('contents'))


# ─── Bilingual Instruction ────────────────────────────────────────────────────
# Injected into all prompts so text fields return {"en": "...", "hi": "..."}
BILINGUAL_INSTRUCTION = """
BILINGUAL OUTPUT INSTRUCTION (MANDATORY):
For EVERY text field in the JSON response (string values only — NOT numbers or booleans),
you MUST return a bilingual object instead of a plain string.
Format: {"en": "English text here", "hi": "हिंदी अनुवाद यहाँ"}

For arrays of text strings, each ELEMENT must be a bilingual object:
[{"en": "First point", "hi": "पहला बिंदु"}, ...]

Exception: citizen_name, phone, gps_coordinates, precise_location stay as plain strings.
Exception: All numeric fields (severity_score, population_affected, etc.) stay as numbers.

IMPORTANT: The Hindi must be accurate, natural, and use proper civic/NGO terminology.
"""

def process_document_and_extract(file_bytes: bytes, mime_type: str) -> dict:
    """
    Uses Google Gemini Vision to read a document (Image or PDF) and extract 
    highly structured 20+ parameter fields.
    """
    prompt = """
You are an intelligent social infrastructure surveyor. Analyze the provided document (which could be a handwritten form, a typed report, or an image of an issue) and extract comprehensive structured data.

CRITICAL INSTRUCTION: Do NOT leave text fields blank or null. If a field is not explicitly mentioned in the document, use your intelligence and the surrounding context to infer, generate, or provide a highly probable and helpful value.

NUMERIC INSTRUCTION: For numeric fields like 'population_affected' or 'demographic_tally', do NOT guess. Only provide a number if there is direct evidence. If no direct evidence is found, return 0 or null.

""" + BILINGUAL_INSTRUCTION + """

Metadata (plain strings — do NOT wrap in bilingual objects):
- citizen_name (string)
- phone (string)
- precise_location (string)
- gps_coordinates (string)
- demographic_tally (number)

All other text fields MUST be bilingual {"en": ..., "hi": ...} objects:
- executive_summary (2-3 sentences, be extremely specific about the problem, location, and impact. Avoid generic filler like "The citizen reported...").
- primary_category, sub_category, problem_status,
  duration_of_problem, urgency_level, service_status,
  severity_reason, vulnerable_group, vulnerability_flag, secondary_impact,
  govt_scheme_applicable, ai_recommended_actions, sentiment, key_quote,
  description, auto_category, previous_complaints_insights

Array fields where EACH element is a bilingual object:
- expected_resolution_timeline, detailed_resolution_steps, key_complaints

Numeric fields (stay as numbers): severity_score, population_affected

Return ONLY valid JSON:
{
  "citizen_name": "",
  "phone": "",
  "precise_location": "",
  "gps_coordinates": "",
  "demographic_tally": null,
  "executive_summary": {"en": "", "hi": ""},
  "primary_category": {"en": "", "hi": ""},
  "sub_category": {"en": "", "hi": ""},
  "problem_status": {"en": "", "hi": ""},
  "duration_of_problem": {"en": "", "hi": ""},
  "urgency_level": {"en": "", "hi": ""},
  "service_status": {"en": "", "hi": ""},
  "severity_score": null,
  "severity_reason": {"en": "", "hi": ""},
  "population_affected": null,
  "vulnerable_group": {"en": "", "hi": ""},
  "vulnerability_flag": {"en": "", "hi": ""},
  "secondary_impact": {"en": "", "hi": ""},
  "expected_resolution_timeline": [{"en": "", "hi": ""}],
  "detailed_resolution_steps": [{"en": "", "hi": ""}],
  "govt_scheme_applicable": {"en": "", "hi": ""},
  "ai_recommended_actions": {"en": "", "hi": ""},
  "key_complaints": [{"en": "", "hi": ""}],
  "previous_complaints_insights": {"en": "", "hi": ""},
  "sentiment": {"en": "", "hi": ""},
  "key_quote": {"en": "", "hi": ""},
  "description": {"en": "", "hi": ""},
  "auto_category": {"en": "", "hi": ""}
}
"""
    file_part = types.Part.from_bytes(
        data=file_bytes,
        mime_type=mime_type
    )

    try:
        print("\n--- [Gemini Vision Engine] Processing document extraction ---")
        print(f"[Gemini Vision Engine] MIME Type: {mime_type}, Bytes: {len(file_bytes)}")
        
        response = retry_with_backoff(None, [prompt, file_part])
        text_content = response.text.strip()
        
        print("\n--- [Gemini Vision Engine] SUCCESS. Raw Response preview: ---")
        print(text_content[:300] + "..." if len(text_content) > 300 else text_content)

        # Improved JSON cleaning
        json_match = re.search(r'\{.*\}', text_content, re.DOTALL)
        if json_match:
            text_content = json_match.group(0)
        else:
            # Fallback cleaning if regex fails
            if text_content.startswith("```json"):
                text_content = text_content[7:]
                text_content = text_content.rsplit("```", 1)[0]
            elif text_content.startswith("```"):
                text_content = text_content[3:]
                text_content = text_content.rsplit("```", 1)[0]

        try:
            data = json.loads(text_content.strip())
        except json.JSONDecodeError as je:
            print(f"[Gemini Vision Engine] JSON Decode Error: {je}")
            # If it's not JSON, return as description
            return {"description": text_content.strip(), "error": f"JSON Decode Error: {str(je)}"}
        print(f"[Gemini Vision Engine] Parsed JSON successfully. Category: {data.get('primary_category')}")
        return data
    except Exception as e:
        print(f"\n!!! [Gemini Vision ERROR] !!!")
        print(f"Error Detail: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"description": "Could not parse document correctly.", "error": str(e)}

def analyze_ocr_content(ocr_text: str, mission_name: str, file_name: str) -> dict:
    """
    Strategic reasoning over OCR-extracted text.
    Determines relevance and provides mission-aligned summaries.
    """
    def _call_gemini():
        prompt = f"""
        You are a strategic NGO Mission Auditor for SevaSetu.
        You are analyzing the TEXT EXTRACTED (via OCR) from an attachment: '{file_name}'.
        The discussion context is the mission: '{mission_name}'.

        EXTRACTED TEXT:
        \"\"\"
        {ocr_text}
        \"\"\"

        YOUR TASK:
        1. Identify the document type (e.g., 'Participant List', 'Legal Notice', 'Memo').
        2. Provide a 3-sentence executive summary.
        3. Extract top 3 core keywords or subject-matter topics.
        4. Analyze historical relevance to '{mission_name}' based on potential prior incidents.
        5. Evaluate strategic impact.

        Return ONLY valid JSON in this exact structure:
        {{
          "file_summary": "Deep summary of extracted content",
          "extracted_keywords": ["Topic 1", "Topic 2", "Topic 3"],
          "historical_insights": "Analysis of relevance to past SevaSetu records",
          "relevance_score": 1-10,
          "relevance_explanation": "Strategic connection to '{mission_name}'",
          "action_recommended": "Specific recommendation for the supervisor"
        }}
        """

        print(f"\n--- [Gemini Reasoning Engine] Processing OCR for '{file_name}' ---")
        response = retry_with_backoff(None, prompt)
        text_content = response.text.strip()
        
        if text_content.startswith("```json"):
            text_content = text_content[7:]
            text_content = text_content.rsplit("```", 1)[0]
        elif text_content.startswith("```"):
            text_content = text_content[3:]
            text_content = text_content.rsplit("```", 1)[0]

        return json.loads(text_content.strip())

    try:
        return retry_with_backoff(_call_gemini)
    except Exception as e:
        print(f"!!! [Gemini Reasoning ERROR] {file_name}: {e}")
        return {
            "file_summary": "Extracted text was received but AI analysis failed.",
            "relevance_score": 5,
            "relevance_explanation": "AI could not determine relevance due to a processing error.",
            "action_recommended": "Manual audit required."
        }

def analyze_multimodal_attachment(file_bytes: bytes, mime_type: str, mission_name: str, file_name: str) -> dict:
    """
    Direct multimodal analysis of PDFs and Images using Gemini 2.0 Flash with retry logic.
    (Kept for fallback if needed, but primary is now OCR-based).
    """
    def _call_gemini():
        prompt = f"""
        You are a strategic NGO Mission Auditor for SevaSetu.
        You are analyzing an attachment (PDF or Image) named '{file_name}' for the mission '{mission_name}'.

        YOUR TASK:
        1. READ the entire document/image content (even tables, names, and dates).
        2. Identify exactly what this is (e.g., 'Ground report', 'Participant list', 'Notice').
        3. Summarize the key data in 2-3 specific sentences.
        4. Evaluate its RELEVANCE specifically to the mission '{mission_name}'.
        5. If relevant, explain the impact. If irrelevant, provide a professional explanation.

        Return ONLY valid JSON in this exact structure:
        {{
          "file_summary": "Deep summary of extracted content",
          "relevance_score": 1-10,
          "relevance_explanation": "Strategic connection to '{mission_name}'",
          "action_recommended": "Specific recommendation for the supervisor"
        }}
        """
        
        file_part = types.Part.from_bytes(
            data=file_bytes,
            mime_type=mime_type
        )

        print(f"\n--- [Gemini Multimodal Engine] Directly analyzing '{file_name}' ---")
        # Use client directly for direct calls if retry not needed, or update to use retry_with_backoff
        response = client.models.generate_content(model=model_name, contents=[prompt, file_part])
        text_content = response.text.strip()
        
        if text_content.startswith("```json"):
            text_content = text_content[7:]
            text_content = text_content.rsplit("```", 1)[0]
        elif text_content.startswith("```"):
            text_content = text_content[3:]
            text_content = text_content.rsplit("```", 1)[0]

        return json.loads(text_content.strip())

    try:
        # Import retry locally if needed or use the one from chat_analysis_service
        return retry_with_backoff(_call_gemini)
    except Exception as e:
        print(f"!!! [Gemini Multimodal ERROR] {file_name}: {e}")
        return {
            "file_summary": "Multimodal analysis failed or rate limited.",
            "relevance_score": 5,
            "relevance_explanation": "AI could not process this file due to an error.",
            "action_recommended": "Manual audit required."
        }

def generate_field_report_from_multimedia(photo_bytes: bytes, audio_transcript: str, location: str) -> dict:
    """
    Synthesizes a field report from a photo, a voice transcript, and GPS coordinates.
    """
    prompt = f"""
You are an expert civic analyst recording a field report from an NGO worker. 
You are given a photo of the incident, a text transcript of the worker's voice note, and GPS coordinates.

Voice Transcript: "{audio_transcript}"
GPS/Location String: "{location}"

Analyze the photo alongside the transcript to generate a highly structured report.

CRITICAL INSTRUCTION: Do NOT leave text fields blank or null. Use your intelligence and the surrounding context (visual evidence + transcript) to infer, generate, or provide a highly probable and helpful value.

NUMERIC INSTRUCTION: For numeric fields like 'population_affected' or 'severity_score', do NOT guess large numbers. Only provide a number if there is direct evidence in the image or audio. If no direct evidence for population exists, return 0 or null.

""" + BILINGUAL_INSTRUCTION + f"""

Metadata (plain strings — do NOT wrap in bilingual):
  citizen_name = "Field Worker", precise_location = "{location}"

All other text fields MUST be bilingual objects: {{\"en\": \"...\", \"hi\": \"...\"}}
Array fields (each element is a bilingual object): expected_resolution_timeline, detailed_resolution_steps, key_complaints

Return ONLY valid JSON:
{{
  "citizen_name": "Field Worker",
  "precise_location": "{location}",
  "executive_summary": {{"en": "", "hi": ""}},
  "primary_category": {{"en": "", "hi": ""}},
  "sub_category": {{"en": "", "hi": ""}},
  "problem_status": {{"en": "", "hi": ""}},
  "urgency_level": {{"en": "", "hi": ""}},
  "duration_of_problem": {{"en": "", "hi": ""}},
  "severity_score": null,
  "severity_reason": {{"en": "", "hi": ""}},
  "population_affected": null,
  "vulnerable_group": {{"en": "", "hi": ""}},
  "vulnerability_flag": {{"en": "", "hi": ""}},
  "expected_resolution_timeline": [{{"en": "", "hi": ""}}],
  "detailed_resolution_steps": [{{"en": "", "hi": ""}}],
  "govt_scheme_applicable": {{"en": "", "hi": ""}},
  "ai_recommended_actions": {{"en": "", "hi": ""}},
  "key_complaints": [{{"en": "", "hi": ""}}],
  "sentiment": {{"en": "", "hi": ""}},
  "description": {{"en": "", "hi": ""}},
  "auto_category": {{"en": "", "hi": ""}}
}}
"""
    file_part = types.Part.from_bytes(
        data=photo_bytes,
        mime_type="image/jpeg"
    )

    try:
        print("\n--- [Gemini Field Report Engine] Synthesizing multimedia report ---")
        print(f"[Gemini Field Report Engine] Transcript Length: {len(audio_transcript)}")
        
        response = retry_with_backoff(None, [prompt, file_part])
        text_content = response.text.strip()
        
        print("\n--- [Gemini Field Report Engine] SUCCESS ---")

        if text_content.startswith("```json"):
            text_content = text_content[7:]
            text_content = text_content.rsplit("```", 1)[0]
        elif text_content.startswith("```"):
            text_content = text_content[3:]
            text_content = text_content.rsplit("```", 1)[0]

        data = json.loads(text_content.strip())
        return data
    except Exception as e:
        print(f"\n!!! [Gemini Field Report ERROR] !!!")
        print(f"Error Detail: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"description": audio_transcript, "precise_location": location, "error": str(e)}

def generate_final_session_report(session_details: dict, feed_items: list, community_inputs: list, media_parts: list = None, text_notes: list = None) -> dict:
    """
    Synthesizes a master NGO report from a multi-item field session in a single multimodal call.
    Takes session metadata, community texts, and an array of RAW audio/image components.
    """
    notes_section = json.dumps(text_notes, indent=2) if text_notes else "[]"
    
    prompt = f"""
You are the Lead Field Auditor for SevaSetu NGO. Your task is to compile a highly professional, factual, and analytical report based directly on the attached raw field evidence (audio recordings, images, and notes).

SESSION METADATA:
{json.dumps(session_details, indent=2)}

WRITTEN NOTES / COMMUNITY TEXT INPUTS:
{notes_section}
{json.dumps(community_inputs, indent=2)}

YOUR TASK:
I have attached the raw audio files and images from this session. Cross-reference what people say in the audio with what you see in the images, and synthesize ALL evidence into a detailed, professional field report.

STRICT CONTENT AUDIT RULES (FAILURE TO FOLLOW REDUCES REPORT USEFULNESS):
1. **IGNORE THE PROCESS**: DO NOT say "Audio input was recorded", "Video captured", "A photo was taken", or "Summary is pending". 
2. **REPORT THE FACTS**: If a voice note says "The well is broken", you MUST write "A broken well was identified as a critical infrastructure failure."
3. **VISUAL DETAIL**: For images/videos, use the 'ai_extraction' field to report on what is VISUALLY happening (e.g. "Volunteers distributing 50 food packets to families").
4. **INTEGRATE COMMUNITY VOICE**: Read the 'community_voice' analysis. If a female aged 30 expressed concern about water, it MUST be listed as a specific finding.
5. **BE SPECIFIC**: Use numbers, locations, and direct observations from the evidence analysis.

""" + BILINGUAL_INSTRUCTION + f"""

STRICT JSON OUTPUT FORMAT (ALL TEXT FIELDS MUST BE BILINGUAL OBJECTS):
{{
  "executive_summary": [
    {{"en": "Bullet point 1: ...", "hi": "Bullet point 1 Hindi: ..."}},
    {{"en": "Bullet point 2: ...", "hi": "Bullet point 2 Hindi: ..."}}
  ],
  "report_type": {{"en": "{session_details.get('type')}", "hi": "Report Type Hindi"}},
  "location_summary": {{"en": "{session_details.get('location')}", "hi": "Location Hindi"}},
  
  "evidence_breakdown": [
    {{
      "evidence_type": {{"en": "Audio / Image / PDF", "hi": "Type Hindi"}},
      "evidence_label": {{"en": "Short label", "hi": "Label Hindi"}},
      "three_line_extraction": [
        {{"en": "Line 1", "hi": "Line 1 Hindi"}},
        {{"en": "Line 2", "hi": "Line 2 Hindi"}},
        {{"en": "Line 3", "hi": "Line 3 Hindi"}}
      ],
      "url": "URL stays as string"
    }}
  ],
  
  "key_findings": [
    {{
      "category": {{"en": "Infrastructure", "hi": "Category Hindi"}},
      "observation": {{"en": "detailed observation", "hi": "Observation Hindi"}}
    }}
  ],
  
  "needs_assessment": [
    {{
      "need": {{"en": "The specific requirement", "hi": "Need Hindi"}},
      "severity": "Low/Moderate/High/Critical (stays as English string for backend logic)",
      "rationale": {{"en": "Directly linked to evidence", "hi": "Rationale Hindi"}}
    }}
  ],
  
  "community_voice": [
    {{
      "member": {{"en": "Member 1 (age, gender)", "hi": "Member 1 Hindi"}},
      "summary": {{"en": "What they expressed", "hi": "Summary Hindi"}},
      "notable_quote": {{"en": "A powerful quote", "hi": "Quote Hindi"}}
    }}
  ],
  
  "evidence_conclusion": [
    {{"en": "Bullet 1: ...", "hi": "Bullet 1 Hindi"}},
    {{"en": "Bullet 2: ...", "hi": "Bullet 2 Hindi"}},
    {{"en": "Bullet 3: ...", "hi": "Bullet 3 Hindi"}}
  ],
  
  "recommended_follow_up": [
    {{"en": "Specific actionable step 1", "hi": "Step 1 Hindi"}},
    {{"en": "Specific actionable step 2", "hi": "Step 2 Hindi"}}
  ],
  
  "metadata": {{
    "duration": "",
    "worker_id": "{session_details.get('workerId')}",
    "timestamp": "{session_details.get('dateTime')}",
    "total_evidence_pieces": {len(feed_items)},
    "community_members_surveyed": {len(community_inputs)}
  }}
}}

Return ONLY valid JSON.
"""
    try:
        print("\n--- [Gemini Final Aggregator] Compiling entire session report (SINGLE MULTIMODAL CALL) ---")
        parts_count = len(media_parts) if media_parts else 0
        print(f"[Gemini Final Aggregator] Sending prompt + {parts_count} raw media components to Gemini 2.5 Flash")
        
        contents = [prompt]
        if media_parts:
            contents.extend(media_parts)

        response = retry_with_backoff(None, contents)
        text_content = response.text.strip()
        
        if text_content.startswith("```json"):
            text_content = text_content[7:]
            text_content = text_content.rsplit("```", 1)[0]
        elif text_content.startswith("```"):
            text_content = text_content[3:]
            text_content = text_content.rsplit("```", 1)[0]

        return json.loads(text_content.strip())
    except Exception as e:
        print(f"!!! [Gemini Final Aggregator ERROR] !!!: {e}")
        import traceback
        traceback.print_exc()
        return {"error": "Final synthesis failed.", "details": str(e)}

def verify_task_proof(image_url: str, task_description: str) -> dict:
    """
    Gemini Guard: Verifies if the uploaded image proof matches the task description.
    Returns structured JSON with confidence and analysis.
    """
    prompt = f"""
    You are 'Gemini Guard', an AI verification agent for SevaSetu NGO.
    A volunteer has submitted a photo as proof for the following task:
    TASK: "{task_description}"
    
    YOUR TASK:
    1. Analyze the image to see if it realistically shows the task being completed or the result of the task.
    2. Provide a 'confidence_score' from 0-100.
    3. Identify if the photo is 'irrelevant' (e.g., a selfie, a random object, or a dark/blurry image that shows nothing).
    4. Provide a 'summary' explaining what you see and how it relates to the task.
    
    Return ONLY valid JSON in this structure:
    {{
      "is_verified": true/false,
      "confidence_score": 0-100,
      "is_irrelevant": true/false,
      "summary": "Short 1-2 sentence explanation of findings."
    }}
    """
    
    import requests # type: ignore
    try:
        print(f"\n--- [Gemini Guard] Verifying proof for: {task_description} ---")
        response = requests.get(image_url)
        if response.status_code != 200:
            return {"error": "Could not download image for verification."}
        
        image_bytes = response.content
        file_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type="image/jpeg"
        )

        gemini_response = retry_with_backoff(None, [prompt, file_part])
        text_content = gemini_response.text.strip()
        
        if text_content.startswith("```json"):
            text_content = text_content[7:]
            text_content = text_content.rsplit("```", 1)[0]
        elif text_content.startswith("```"):
            text_content = text_content[3:]
            text_content = text_content.rsplit("```", 1)[0]

        data = json.loads(text_content.strip())
        print(f"[Gemini Guard] Verification Result: Confidence {data.get('confidence_score')}%")
        return data
    except Exception as e:
        print(f"!!! [Gemini Guard ERROR] !!!: {e}")
        return {
            "is_verified": False,
            "confidence_score": 0,
            "summary": "AI verification failed due to a processing error."
        }

def enrich_bot_report(description: str, category: str, photo_url: Optional[str] = None, location: Optional[str] = None) -> dict:
    """
    Uses Gemini to transform a simple bot report (description + category + photo)
    into a full structured report matching the Scan & Survey schema.
    """
    prompt = f"""
You are an expert civic analyst processed data from a Telegram reporting bot.
The user reported the following:
Description: "{description}"
Category (User Selected): "{category}"
Location: "{location or 'Unknown'}"

YOUR TASK:
Use your intelligence to expand this input into a full structured report.
Even if details like 'vulnerable groups' or 'resolution timeline' aren't explicitly mentioned, 
use the context of the issue to provide highly probable, professional, and helpful values.

NUMERIC INSTRUCTION:
- severity_score: Assign a score from 1-10 based on the description (e.g. Health Emergency = 9/10, Garbage = 3/10).
- population_affected: Estimate a likely number based on the issue type if not specified.

""" + BILINGUAL_INSTRUCTION + f"""

Metadata (plain strings):
  citizen_name = "Bot User", precise_location = "{location or 'Unknown'}"
  primary_category = "{category}", auto_category = "{category}"

Return ONLY valid JSON:
{{
  "citizen_name": "Bot User",
  "precise_location": "{location or 'Unknown'}",
  "executive_summary": {{"en": "", "hi": ""}},
  "primary_category": {{"en": "{category}", "hi": ""}},
  "sub_category": {{"en": "", "hi": ""}},
  "problem_status": {{"en": "Open", "hi": "खुला है"}},
  "urgency_level": {{"en": "", "hi": ""}},
  "duration_of_problem": {{"en": "Not specified", "hi": "निर्दिष्ट नहीं है"}},
  "severity_score": null,
  "severity_reason": {{"en": "", "hi": ""}},
  "population_affected": null,
  "vulnerable_group": {{"en": "General Population", "hi": "सामान्य आबादी"}},
  "vulnerability_flag": {{"en": "No", "hi": "नहीं"}},
  "expected_resolution_timeline": [{{"en": "", "hi": ""}}],
  "detailed_resolution_steps": [{{"en": "", "hi": ""}}],
  "govt_scheme_applicable": {{"en": "Local Municipal Services", "hi": "स्थानीय नगर सेवाएँ"}},
  "ai_recommended_actions": {{"en": "", "hi": ""}},
  "key_complaints": [{{"en": "{description}", "hi": ""}}],
  "sentiment": {{"en": "Concerned", "hi": "चिंतित"}},
  "description": {{"en": "{description}", "hi": ""}},
  "auto_category": {{"en": "{category}", "hi": ""}}
}}
"""
    contents = [prompt]
    
    if photo_url:
        import requests
        try:
            resp = requests.get(photo_url, timeout=10)
            if resp.status_code == 200:
                contents.append(types.Part.from_bytes(
                    data=resp.content,
                    mime_type="image/jpeg"
                ))
                print(f"[Gemini Bot Enricher] Photo attached for analysis: {photo_url}")
        except Exception as e:
            print(f"[Gemini Bot Enricher] (WARN) Could not download photo for AI analysis: {e}")

    try:
        print("\n--- [Gemini Bot Enricher] Enriching bot report data ---")
        response = retry_with_backoff(None, contents)
        text_content = response.text.strip()
        
        if text_content.startswith("```json"):
            text_content = text_content[7:]
            text_content = text_content.rsplit("```", 1)[0]
        elif text_content.startswith("```"):
            text_content = text_content[3:]
            text_content = text_content.rsplit("```", 1)[0]

        return json.loads(text_content.strip())
    except Exception as e:
        print(f"!!! [Gemini Bot Enricher ERROR] !!!: {e}")
        return {
            "description": {"en": description, "hi": ""},
            "primary_category": {"en": category, "hi": ""},
            "severity_score": 5
        }

