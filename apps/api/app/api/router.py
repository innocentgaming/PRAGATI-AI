from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.ai import router as ai_router
from app.api.projects import router as projects_router
from app.api.risk import router as risk_router
from app.api.alerts import router as alerts_router
from app.api.interventions import router as interventions_router
from app.api.analytics import router as analytics_router
from app.api.map import router as map_router
from app.api.chat import router as chat_router
from app.api.models import router as models_router
from app.api.data_quality import router as data_quality_router
from app.api.contractors import router as contractors_router
from app.api.departments import router as departments_router
from app.api.reports import router as reports_router
from app.api.audit_logs import router as audit_logs_router
from app.api.notifications import router as notifications_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(ai_router)
api_router.include_router(projects_router)
api_router.include_router(risk_router)
api_router.include_router(alerts_router)
api_router.include_router(interventions_router)
api_router.include_router(analytics_router)
api_router.include_router(map_router)
api_router.include_router(chat_router)
api_router.include_router(models_router)
api_router.include_router(data_quality_router)
api_router.include_router(contractors_router)
api_router.include_router(departments_router)
api_router.include_router(reports_router)
api_router.include_router(audit_logs_router)
api_router.include_router(notifications_router)

