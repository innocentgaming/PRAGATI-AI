import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure sys.path includes apps/api
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "apps", "api")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "PRAGATI-AI"
    assert data["status"] == "OPERATIONAL"

def test_auth_login():
    response = client.post("/api/auth/login", json={
        "email": "officer@mospi.gov.in",
        "password": "Officer@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "officer@mospi.gov.in"

def test_dashboard_overview():
    response = client.get("/api/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_projects" in data
    assert "total_investment_cr" in data
    assert "projects_on_track" in data
    assert "projects_delayed" in data
    assert "high_risk_projects" in data
    assert data["total_projects"] > 50

def test_projects_list_and_filters():
    # Base list
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert isinstance(projects, list)
    assert len(projects) > 50
    first = projects[0]
    assert "project_code" in first
    assert "overall_risk_score" in first

    # Filter by risk_level
    resp_risk = client.get("/api/projects?risk_level=CRITICAL")
    assert resp_risk.status_code == 200
    crit_projs = resp_risk.json()
    for p in crit_projs:
        assert p["risk_level"] == "CRITICAL"

def test_project_detail_and_subroutes():
    # Pick first project
    proj_list = client.get("/api/projects").json()
    proj_id = proj_list[0]["id"]
    proj_code = proj_list[0]["project_code"]

    # 1. Project Detail
    resp_detail = client.get(f"/api/projects/{proj_id}")
    assert resp_detail.status_code == 200
    detail = resp_detail.json()
    assert detail["project_code"] == proj_code
    assert "physical_progress" in detail
    assert "financial_progress" in detail
    assert "cost_growth_percentage" in detail

    # 2. Progress history
    resp_prog = client.get(f"/api/projects/{proj_id}/progress")
    assert resp_prog.status_code == 200
    assert isinstance(resp_prog.json(), list)

    # 3. Milestones
    resp_miles = client.get(f"/api/projects/{proj_id}/milestones")
    assert resp_miles.status_code == 200
    assert isinstance(resp_miles.json(), list)

    # 4. Risks
    resp_risks = client.get(f"/api/projects/{proj_id}/risks")
    assert resp_risks.status_code == 200
    risk_data = resp_risks.json()
    assert "overall_risk_score" in risk_data

def test_alerts_endpoint():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)
    if len(alerts) > 0:
        assert "severity" in alerts[0]
        assert "recommended_action" in alerts[0]

def test_map_projects():
    response = client.get("/api/map/projects")
    assert response.status_code == 200
    map_pins = response.json()
    assert len(map_pins) > 50
    assert "latitude" in map_pins[0]
    assert "longitude" in map_pins[0]
    assert "risk_level" in map_pins[0]

def test_ai_project_summary():
    proj_list = client.get("/api/projects").json()
    proj_id = proj_list[0]["id"]

    response = client.post("/api/ai/project-summary", json={"project_id": proj_id})
    assert response.status_code == 200
    ai_summary = response.json()
    assert "current_situation" in ai_summary
    assert len(ai_summary["key_issues"]) > 0
    assert len(ai_summary["recommended_actions"]) > 0
    assert "AI-generated" in ai_summary["disclaimer"]

def test_analytics_sectors_and_states():
    resp_sec = client.get("/api/analytics/sectors")
    assert resp_sec.status_code == 200
    sectors = resp_sec.json()
    assert len(sectors) > 0
    assert "sector_name" in sectors[0]

    resp_state = client.get("/api/analytics/states")
    assert resp_state.status_code == 200
    states = resp_state.json()
    assert len(states) > 0
    assert "state_name" in states[0]

