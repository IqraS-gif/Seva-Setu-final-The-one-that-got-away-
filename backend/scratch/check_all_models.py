from groq import Groq
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

print("--- Checking Groq Models ---")
groq_key = os.getenv("GROQ_API_KEY")
if groq_key:
    client = Groq(api_key=groq_key)
    try:
        models = client.models.list()
        print("Available Groq Models:")
        for m in models.data:
            print(f"- {m.id}")
    except Exception as e:
        print(f"Groq Error: {e}")
else:
    print("No Groq Key found.")

print("\n--- Checking Gemini Models ---")
gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    client = genai.Client(api_key=gemini_key)
    try:
        models = client.models.list()
        print("Available Gemini Models:")
        for m in models:
            print(f"- {m.name}")
    except Exception as e:
        print(f"Gemini Error: {e}")
else:
    print("No Gemini Key found.")
