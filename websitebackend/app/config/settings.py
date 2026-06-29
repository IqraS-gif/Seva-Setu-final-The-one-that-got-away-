import os
from dotenv import load_dotenv

load_dotenv()

raw_gemini = os.getenv("GEMINI_API_KEYS", "") or os.getenv("GEMINI_API_KEY", "")
GEMINI_API_KEYS = [k.strip() for k in raw_gemini.split(";") if k.strip()]
GEMINI_API_KEY = GEMINI_API_KEYS[0] if GEMINI_API_KEYS else ""
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "credentials/firebase-credentials.json")
PROJECT_ID = os.getenv("PROJECT_ID", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "")
CLOUDINARY_URL = os.getenv("CLOUDINARY_URL")
GROQ_API_KEYS = [k.strip() for k in os.getenv("GROQ_API_KEYS", "").split(";") if k.strip()]
# Fallback for single key if still present
if not GROQ_API_KEYS and os.getenv("GROQ_API_KEY"):
    GROQ_API_KEYS = [os.getenv("GROQ_API_KEY").strip()]

