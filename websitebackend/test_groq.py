import os
from dotenv import load_dotenv
from groq import Groq
import time

# Load the local .env file
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("❌ ERROR: No GROQ_API_KEY found in .env file.")
    exit(1)

print(f"✅ Found Groq API Key: {api_key[:10]}...")
print("🔄 Testing connection to Llama 3 on Groq LPUs...\n")

try:
    client = Groq(api_key=api_key)
    
    start_time = time.time()
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": "Respond with exactly one word: Success.",
            }
        ],
        model="llama3-8b-8192",
    )
    end_time = time.time()
    
    print("🟢 GROQ CONNECTION SUCCESSFUL!")
    print(f"🤖 Llama replied: '{chat_completion.choices[0].message.content.strip()}'")
    print(f"⏱️ Generation took: {(end_time - start_time):.4f} seconds (Incredible speed!)")

except Exception as e:
    print("🔴 GROQ CONNECTION FAILED.")
    print("Error details:")
    print(e)
