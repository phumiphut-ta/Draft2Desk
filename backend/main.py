from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database import init_db
from backend.routers.templates import router as templates_router
import os

app = FastAPI(
    title="Draft2Desk Backend",
    description="Backend API and Static Server for Draft2Desk Word Add-in",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local add-in loading
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup DB initialization
@app.on_event("startup")
def on_startup():
    init_db()

# Include routers
app.include_router(templates_router)

# Mount frontend static files
# Calculate frontend folder path relative to this file to avoid working dir issues
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_dir = os.path.join(base_dir, "frontend")

# Ensure frontend dir exists so FastAPI doesn't crash on startup
os.makedirs(frontend_dir, exist_ok=True)
os.makedirs(os.path.join(frontend_dir, "css"), exist_ok=True)
os.makedirs(os.path.join(frontend_dir, "js"), exist_ok=True)
os.makedirs(os.path.join(frontend_dir, "assets"), exist_ok=True)

# Mount static files at root
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
