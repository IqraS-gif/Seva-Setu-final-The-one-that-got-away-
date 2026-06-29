import os
from dotenv import load_dotenv
from google import genai
import time

# Load the local .env file where the API key is stored
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ ERROR: No GEMINI_API_KEY found in .env file.")
    exit(1)

print(f"✅ Found API Key: {api_key[:10]}...{api_key[-4:]}")
print("🔄 Testing connection to Gemini 2.5 Flash...\n")

try:
    # Initialize exactly how the backend does it
    client = genai.Client(api_key=api_key)
    
    start_time = time.time()
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents='Respond with exactly one word: Success.'
    )
    end_time = time.time()
    
    print("🟢 CONNECTION SUCCESSFUL!")
    print(f"🤖 Gemini replied: '{response.text.strip()}'")
    print(f"⏱️ Generation took: {(end_time - start_time):.2f} seconds")

except Exception as e:
    print("🔴 CONNECTION FAILED.")
    print("Error details:")
    print(e)
