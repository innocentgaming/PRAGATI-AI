import os
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

# Ensure sys.path contains root & apps/api
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.config import settings
from app.api.router import api_router

app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description="Predictive Risk Analytics & Government Infrastructure Intelligence Platform for MoSPI (Ministry of Statistics and Programme Implementation) - SIH Problem Statement 26103",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & Audit Logging Middleware
@app.middleware("http")
async def audit_and_timing_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-Sec"] = f"{process_time:.4f}"
    return response

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred in PRAGATI-AI backend.", "error": str(exc)}
    )

# Include main API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "full_name": "Predictive Risk Analytics & Government Infrastructure Intelligence",
        "ministry": "Ministry of Statistics and Programme Implementation (MoSPI)",
        "division": "Data Informatics & Innovation Division (DIID) / IPMD",
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs": "/docs",
        "endpoints": {
            "projects": "/api/projects",
            "executive_overview": "/api/analytics/overview",
            "map": "/api/map/projects",
            "early_warnings": "/api/alerts",
            "assistant": "/api/chat",
            "interventions": "/api/interventions",
            "model_performance": "/api/models/performance",
            "cuf_experiment": "/api/models/cuf-experiment",
            "data_quality": "/api/data-quality/report"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
