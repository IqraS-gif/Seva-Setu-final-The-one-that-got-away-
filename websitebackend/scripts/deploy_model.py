import os
import time
from google.cloud import aiplatform
from google.cloud import storage
from dotenv import load_dotenv

# Load env vars
load_dotenv()

PROJECT_ID = os.getenv("PROJECT_ID", "")
REGION = os.getenv("GCP_REGION", "us-central1")
BUCKET_NAME = f"{PROJECT_ID}-model-bucket"
MODEL_NAME = "ngo-risk-model"
LOCAL_MODEL_PATH = "models/ngo_risk_model.joblib"

def deploy_to_vertex():
    print(f"🚀 Initializing Vertex AI Deployment for {PROJECT_ID}...")
    
    # 1. Initialize SDK
    aiplatform.init(project=PROJECT_ID, location=REGION)
    storage_client = storage.Client(project=PROJECT_ID)

    # 2. Create Bucket & Upload Model
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        if not bucket.exists():
            print(f"📦 Creating GCS bucket: {BUCKET_NAME}...")
            bucket.create(location=REGION)
        
        blob = bucket.blob(f"model/{os.path.basename(LOCAL_MODEL_PATH)}")
        print(f"📤 Uploading model to gs://{BUCKET_NAME}/model/...")
        blob.upload_from_filename(LOCAL_MODEL_PATH)
    except Exception as e:
        print(f"❌ Error during GCS upload: {e}")
        return

    # 3. Register Model in Registry
    # Using pre-built scikit-learn container
    # Version 1.0 because the current joblib is likely compatible with 1.0+
    display_name = f"{MODEL_NAME}-managed"
    serving_container_image_uri = "us-docker.pkg.dev/vertex-ai/prediction/sklearn-cpu.1-0:latest"
    
    print("📋 Registering model in Vertex AI Model Registry...")
    model = aiplatform.Model.upload(
        display_name=display_name,
        artifact_uri=f"gs://{BUCKET_NAME}/model/",
        serving_container_image_uri=serving_container_image_uri,
    )

    # 4. Deploy to Endpoint
    print("⚡ Deploying model to Endpoint (This typically takes 10-15 minutes)...")
    endpoint = model.deploy(
        machine_type="n1-standard-2",
        min_replica_count=1,
        max_replica_count=1,
        display_name=f"{display_name}-endpoint"
    )

    print(f"✅ Deployment Complete!")
    print(f"📍 Endpoint ID: {endpoint.resource_name}")
    print(f"✨ You can now use this ID in your risk_service.py")

if __name__ == "__main__":
    if not os.path.exists(LOCAL_MODEL_PATH):
        print(f"❌ Error: Local model not found at {LOCAL_MODEL_PATH}")
    else:
        deploy_to_vertex()
