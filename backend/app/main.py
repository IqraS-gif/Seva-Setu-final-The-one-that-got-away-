from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.staticfiles import StaticFiles # type: ignore
import os
from app.api.routes import scan_routes, report_routes, prediction_routes, chat_routes, ngo_routes, bot_routes, task_routes, whatsapp_routes, sms_routes, ivr_routes, auth_routes, translation_routes, certificate_routes  # type: ignore
from app.api.routes import auth  # Google OAuth router

app = FastAPI(title="SevaSetu Backend")

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Mount local uploads folder as static server (Free Media Alternative)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Enable CORS for mobile frontend and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(scan_routes.router, tags=["Scanner"])
app.include_router(report_routes.router, tags=["Reports"])
app.include_router(prediction_routes.router, tags=["Predictions & Assignments"])
app.include_router(chat_routes.router, tags=["Chat Management"])
app.include_router(ngo_routes.router, tags=["NGO & Volunteer Management"])
app.include_router(bot_routes.router, tags=["Bot Reporting"])
app.include_router(task_routes.router, tags=["Mission Tasks"])
app.include_router(whatsapp_routes.router, tags=["WhatsApp Bot"])
app.include_router(sms_routes.router, tags=["SMS Bot"])
app.include_router(ivr_routes.router, tags=["IVR Voice Bot"])
app.include_router(auth_routes.router, prefix="/auth", tags=["Authentication Utilities"])
app.include_router(auth.router)  # Google OAuth — prefix /auth defined in auth.py
app.include_router(translation_routes.router, prefix="/api/ai", tags=["Translation"])
app.include_router(certificate_routes.router, prefix="/certificates", tags=["Volunteer Recognition & Verification"])

from fastapi.responses import HTMLResponse

@app.get("/redirect.html", response_class=HTMLResponse)
async def serve_redirect():
    html_content = """<!DOCTYPE html>
<html>
<head>
  <title>Redirecting to SevaSetu...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #F8F9FA;
      color: #333;
      text-align: center;
      padding: 20px;
    }
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border-left-color: #FF8C00;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 {
      margin: 0 0 10px 0;
      font-size: 20px;
    }
    p {
      color: #666;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h2>Signing you in...</h2>
  <p>Returning you back to the SevaSetu app.</p>

  <script>
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get("state") || "com.rarakra.SevaSetu";

    if (accessToken) {
      const appRedirectUrl = state + "://oauth2redirect?access_token=" + encodeURIComponent(accessToken);
      window.location.href = appRedirectUrl;
      
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = appRedirectUrl;
        link.innerText = "Click here to return to the app if you are not redirected automatically";
        link.style.display = "block";
        link.style.marginTop = "20px";
        link.style.color = "#FF8C00";
        link.style.fontWeight = "bold";
        document.body.appendChild(link);
      }, 1500);
    } else {
      document.body.innerHTML = "<h2>Authentication Failed</h2><p>No access token was received from Google.</p>";
    }
  </script>
</body>
</html>"""
    return HTMLResponse(content=html_content)

@app.get("/")
async def health_check():
    """
    Health check endpoint.
    """
    return {
        "message": "SevaSetu Backend Running",
        "status": "healthy"
    }
