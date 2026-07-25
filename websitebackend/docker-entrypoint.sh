#!/bin/sh
# docker-entrypoint.sh
# Decodes base64-encoded credentials from environment variables
# and writes them to files before starting the FastAPI server.
set -e

CRED_DIR="/app/credentials"
mkdir -p "$CRED_DIR"

# Write Firebase service account credentials (base64-encoded JSON)
if [ -n "$FIREBASE_CREDENTIALS_JSON" ]; then
    echo "$FIREBASE_CREDENTIALS_JSON" | base64 -d > "$CRED_DIR/firebase-credentials.json"
    echo "✅ Firebase credentials written."
else
    echo "⚠️  FIREBASE_CREDENTIALS_JSON not set — Firebase Admin may fail."
fi

# Write Google Cloud / Document AI credentials (base64-encoded JSON)
if [ -n "$GOOGLE_CREDENTIALS_JSON" ]; then
    echo "$GOOGLE_CREDENTIALS_JSON" | base64 -d > "$CRED_DIR/sevasetudocai.json"
    export GOOGLE_APPLICATION_CREDENTIALS="$CRED_DIR/sevasetudocai.json"
    echo "✅ Google Cloud credentials written."
else
    echo "⚠️  GOOGLE_CREDENTIALS_JSON not set — Google Cloud services may fail."
fi

# Set the Firebase credentials path env var
export FIREBASE_CREDENTIALS_PATH="$CRED_DIR/firebase-credentials.json"

# Start the FastAPI server
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8080}"
