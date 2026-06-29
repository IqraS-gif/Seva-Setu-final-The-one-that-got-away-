import os
import json
import logging
from google import genai
from groq import Groq

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

STATE_FILE = "translation_state.json"

class TranslationManager:
    def __init__(self):
        # Load keys from environment
        gemini_keys_raw = os.getenv("GEMINI_API_KEY", "")
        groq_keys_raw = os.getenv("GROQ_API_KEY", "")
        
        self.gemini_keys = [k.strip() for k in gemini_keys_raw.split(",") if k.strip()]
        self.groq_keys = [k.strip() for k in groq_keys_raw.split(",") if k.strip()]
        
        # Initial state
        self.current_provider = "gemini" # Default
        self.gemini_index = 0
        self.groq_index = 0
        
        self._load_state()

    def _load_state(self):
        if os.path.exists(STATE_FILE):
            try:
                with open(STATE_FILE, 'r') as f:
                    state = json.load(f)
                    self.current_provider = state.get("current_provider", "gemini")
                    self.gemini_index = state.get("gemini_index", 0)
                    self.groq_index = state.get("groq_index", 0)
                    logger.info(f"[TranslationManager] Loaded state: {self.current_provider} (Gemini:{self.gemini_index}, Groq:{self.groq_index})")
            except Exception as e:
                logger.error(f"[TranslationManager] Failed to load state: {e}")

    def _save_state(self):
        try:
            state = {
                "current_provider": self.current_provider,
                "gemini_index": self.gemini_index,
                "groq_index": self.groq_index
            }
            with open(STATE_FILE, 'w') as f:
                json.dump(state, f)
        except Exception as e:
            logger.error(f"[TranslationManager] Failed to save state: {e}")

    def _get_active_key(self):
        if self.current_provider == "gemini":
            if not self.gemini_keys:
                return None
            return self.gemini_keys[self.gemini_index % len(self.gemini_keys)]
        else:
            if not self.groq_keys:
                return None
            return self.groq_keys[self.groq_index % len(self.groq_keys)]

    async def translate(self, text: str):
        if not text:
            return ""

        prompt = f"""
Translate the following text into accurate, natural Hindi. 
Rules:
1. Provide ONLY the Hindi translation.
2. NO conversational filler, NO quotes, NO markdown blocks.
3. Keep it brief.

Text to translate:
{text}
"""

        # We try Gemini first (if it's the current provider) then Groq
        # Total attempts = sum of all keys
        total_attempts = len(self.gemini_keys) + len(self.groq_keys)
        
        for _ in range(total_attempts):
            api_key = self._get_active_key()
            if not api_key:
                # If current provider has no keys, try switching once
                self._switch_provider()
                continue

            try:
                if self.current_provider == "gemini":
                    logger.info(f"[TranslationManager] Attempting Gemini with key index {self.gemini_index % len(self.gemini_keys)}")
                    client = genai.Client(api_key=api_key)
                    response = client.models.generate_content(
                        model='gemini-2.5-flash', 
                        contents=prompt
                    )
                    translated = response.text.strip()
                else:
                    logger.info(f"[TranslationManager] Attempting Groq with key index {self.groq_index % len(self.groq_keys)}")
                    client = Groq(api_key=api_key)
                    completion = client.chat.completions.create(
                        model="llama-3.3-70b-versatile", # Reliable translation model
                        messages=[{"role": "user", "content": prompt}]
                    )
                    translated = completion.choices[0].message.content.strip()

                # Success logic
                if translated:
                    # Clean up markdown if any
                    if translated.startswith("```"):
                        parts = translated.split("```")
                        if len(parts) > 1:
                            translated = parts[1]
                            if translated.startswith("hindi\n") or translated.startswith("Hindi\n"):
                                translated = translated[6:].strip()
                    
                    self._save_state()
                    return translated

            except Exception as e:
                err_str = str(e).lower()
                logger.warning(f"[TranslationManager] Error using {self.current_provider} (key {api_key[:5]}...): {e}")
                
                # Check for quota errors
                if "429" in err_str or "quota" in err_str or "rate limit" in err_str:
                    logger.info(f"[TranslationManager] Quota exceeded for {self.current_provider}. Rotating key...")
                    self._rotate_key()
                else:
                    # For other errors, we might still want to try next key just in case
                    self._rotate_key()

        logger.error("[TranslationManager] All keys and providers failed. Returning original text.")
        return text

    def _rotate_key(self):
        if self.current_provider == "gemini":
            self.gemini_index += 1
            if self.gemini_index >= len(self.gemini_keys):
                logger.info("[TranslationManager] All Gemini keys exhausted. Switching to Groq.")
                self.current_provider = "groq"
        else:
            self.groq_index += 1
            if self.groq_index >= len(self.groq_keys):
                logger.info("[TranslationManager] All Groq keys exhausted. Retrying Gemini from start.")
                self.current_provider = "gemini"
                self.gemini_index = 0
        self._save_state()

    def _switch_provider(self):
        if self.current_provider == "gemini":
            self.current_provider = "groq"
        else:
            self.current_provider = "gemini"
        self._save_state()

# Singleton instance
translator = TranslationManager()
