import os
from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
print("🚀 Starting SevaSetu Backend...", flush=True)

try:
    print("📦 Loading auth search...", flush=True)
    from app.api.routes import auth_routes
    print("📦 Loading email engine...", flush=True)
    from app.api.routes import email_routes
    print("📦 Loading report analytics...", flush=True)
    from app.api.routes import report_routes
    print("📦 Loading risk intelligence...", flush=True)
    from app.api.routes import risk_routes
except Exception as e:
    print(f"🔥 CRITICAL IMPORT ERROR: {e}", flush=True)
    import traceback
    traceback.print_exc()
    raise e

app = FastAPI(
    title="SevaSetu Website Backend",
    description="Backend API for SevaSetu Community Service Platform — Email-to-Survey pipeline with Gemini AI",
    version="1.0.0",
    redirect_slashes=False,
)

# Enable CORS for frontend
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
_allowed_origins = [_frontend_url, "http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router)
app.include_router(email_routes.router)
app.include_router(report_routes.router)
app.include_router(risk_routes.router)


@app.get("/")
async def health_check():
    """Health check endpoint."""
    return {
        "message": "SevaSetu Website Backend Running",
        "status": "healthy",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/auth/google",
            "scan_emails": "/emails/scan",
            "generate_report": "/emails/report",
            "list_reports": "/reports",
        },
    }
