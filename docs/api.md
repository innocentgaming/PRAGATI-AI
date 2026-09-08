# API Reference Specification

## Core Endpoints
- `GET /api/projects` - Filter projects by sector, ministry, state, risk level, status, search.
- `GET /api/projects/{id}` - Complete Project 360 intelligence dossier.
- `POST /api/projects` - Create new project and trigger ML predictions.
- `GET /api/projects/{id}/history` - Historical monthly progress & spend records.
- `GET /api/projects/{id}/milestones` - Milestone pipeline with delay status.
- `GET /api/projects/{id}/risk` - Latest ML predictions and SHAP factors.
- `GET /api/projects/{id}/alerts` - Active early warning alerts for project.
- `GET /api/projects/{id}/interventions` - Deployed officer directives for project.
- `GET /api/projects/{id}/recommendations` - Actionable prescriptive recommendations.
- `GET /api/risks` - All risk predictions.
- `POST /api/risks/predict` - What-if simulation prediction endpoint.
- `GET /api/alerts` - Triage board of all early warning alerts.
- `POST /api/alerts/{id}/acknowledge` - Mark alert acknowledged.
- `POST /api/alerts/{id}/resolve` - Mark alert resolved.
- `GET /api/interventions` - Complete interventions tracking ledger.
- `POST /api/interventions` - Dispatch new prescriptive intervention.
- `PATCH /api/interventions/{id}` - Update intervention status and outcome.
- `GET /api/analytics/overview` - Executive KPI metrics.
- `GET /api/analytics/sectors` - Sector benchmarking analytics.
- `GET /api/analytics/ministries` - Ministry benchmarking analytics.
- `GET /api/analytics/states` - State benchmarking analytics.
- `GET /api/map/projects` - Project coordinates and risk tiers for India GIS map.
- `POST /api/chat` - PRAGATI AI assistant grounded conversational endpoint.
- `GET /api/models/performance` - Model metrics and algorithm comparison.
- `GET /api/models/cuf-experiment` - Model A vs Model B CUF experiment results.
- `GET /api/data-quality/report` - Automated 10-rule data quality audit report.
- `POST /api/data-quality/ingest` - Ingest batch project records with provenance tagging.
