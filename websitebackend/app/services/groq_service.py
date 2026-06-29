import os
import random
from groq import Groq
from app.config import settings

# Initialize multiple clients
GROQ_CLIENTS = []
for key in settings.GROQ_API_KEYS:
    try:
        GROQ_CLIENTS.append(Groq(api_key=key))
    except Exception as e:
        print(f"WARNING: Failed to initialize Groq client with key ending in {key[-4:]}: {e}")

def get_groq_client():
    """Returns a random available Groq client for load balancing/failover."""
    if not GROQ_CLIENTS:
        return None
    return random.choice(GROQ_CLIENTS)

# Keep MODEL_ID
MODEL_ID = 'llama-3.3-70b-versatile'

# Backward compatibility for single client usage
client = GROQ_CLIENTS[0] if GROQ_CLIENTS else None
