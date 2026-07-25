#!/bin/sh
# docker-entrypoint.sh
# Writes Firebase and Google Cloud credentials from environment variables
# before starting the FastAPI server.
set -e

CRED_DIR="/app/credentials"
mkdir -p "$CRED_DIR"

# Write Firebase service account credentials
if [ -n "$FIREBASE_CREDENTIALS_JSON" ]; then
    echo "$FIREBASE_CREDENTIALS_JSON" > "$CRED_DIR/firebase-credentials.json"
    echo "✅ Firebase credentials written."
else
    echo "⚠️  FIREBASE_CREDENTIALS_JSON not set — Firebase Admin may fail."
fi

# Write Google Cloud / Document AI credentials
if [ -n "$GOOGLE_CREDENTIALS_JSON" ]; then
    echo "$GOOGLE_CREDENTIALS_JSON" > "$CRED_DIR/sevasetudocai.json"
    # Also point the ADC env var to the file
    export GOOGLE_APPLICATION_CREDENTIALS="$CRED_DIR/sevasetudocai.json"
    echo "✅ Google Cloud credentials written."
else
    echo "⚠️  GOOGLE_CREDENTIALS_JSON not set — Google Cloud services may fail."
fi

# Set the Firebase credentials path env var so the app picks it up
export FIREBASE_CREDENTIALS_PATH="$CRED_DIR/firebase-credentials.json"

# Start the FastAPI server on $PORT (Render injects this automatically)
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8080}"
