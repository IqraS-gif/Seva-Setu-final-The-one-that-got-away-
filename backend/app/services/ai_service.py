import os
import json
import logging
from google import genai
from typing import List, Optional, Union, Dict, Any
from app.services.gemini_service import retry_with_backoff, api_keys, current_key_index, model_name

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIManager:
    def __init__(self):
        # Configuration is now centralized in gemini_service
        self.model_name = model_name

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Generates text using centralized retry logic (includes Gemini rotation and Groq fallback).
        """
        try:
            full_prompt = prompt
            if system_instruction:
                full_prompt = f"{system_instruction}\n\n{prompt}"
            
            # retry_with_backoff handles both Gemini rotation and Groq fallback automatically
            # We pass None as the first argument as it's now handled internally in gemini_service
            response = retry_with_backoff(None, full_prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"[AIManager] Final Error: {e}")
            return ""

# Singleton instance
ai_manager = AIManager()

