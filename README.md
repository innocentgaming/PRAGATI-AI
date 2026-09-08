# PRAGATI-AI 🏛️

**Predictive Risk Analytics & Government Infrastructure Intelligence**  
*"From Project Monitoring to Project Prediction"*

> **Ministry:** Ministry of Statistics and Programme Implementation (**MoSPI**)  
> **Division:** Data Informatics & Innovation Division (**DIID**) / Infrastructure & Project Monitoring Division (**IPMD**)  
> **Problem Statement ID:** 26103  
> **Theme:** Smart Automation | **Category:** Software  

---

## 🌟 Executive Summary
**PRAGATI-AI** transforms traditional descriptive project monitoring into an intelligent predictive and prescriptive decision-support layer on top of **PAIMANA** and **OCMS**. It identifies projects likely to suffer cost overruns, schedule delays, and abnormal progress patterns before issues escalate.

```
PREDICT ➔ EXPLAIN ➔ RECOMMEND ➔ ACT ➔ TRACK
```

---

## 🚀 Key Features

1. **Executive Dashboard:** Live KPIs across 1,981 central sector projects, forecasted cost exposure (₹44.1k Cr), average delay (11.4 months), and sector risk distribution.
2. **Project Explorer:** Multi-facet filtering by sector, ministry, state, and 0-100 risk score tiers.
3. **Project 360 Screen:** Comprehensive dossier featuring cost growth, physical vs financial divergence, milestone pipelines, monthly time-series trajectories, and 1-click intervention dispatching.
4. **Transparent SHAP Explainability:** TreeSHAP feature attribution explaining exact positive and negative drivers behind every prediction.
5. **Early Warning Center:** Automated predictive alert triggers with actionable triage workflows.
6. **India Infrastructure GIS Map:** Map visualization with risk-coded markers and state-level drilldowns.
7. **PRAGATI AI Assistant (RAG Engine):** Grounded decision-support assistant with hybrid SQL + dense vector search and strict source citations.
8. **Prescriptive Recommendation Engine:** Grounded action directives tailored to project bottlenecks.
9. **Closed-Loop Intervention Tracking:** Tracks officer assignments, execution status, and resolution outcomes.
10. **MoSPI CUF Experiment Showcase:** Out-of-time evaluation proving Model B (Augmented) delivers +30.4% precision uplift and -58.8% cost error reduction over Model A (Baseline CUF).
11. **Automated 10-Rule Data Quality Audit:** Real-time sanitization enforcing non-negative costs, chronological integrity, and provenance tags (`DEMO`, `USER_UPLOAD`, `OFFICIAL_API`).

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Recharts, Zustand, Lucide Icons.
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy, Pydantic v2, JWT Auth & RBAC.
- **Machine Learning:** XGBoost, LightGBM, Scikit-learn, SHAP, Optuna.
- **Database:** PostgreSQL + PostGIS + pgvector (with SQLite zero-dependency standalone fallback).
- **RAG & NLP:** Hybrid SQL + Dense Vector Cosine Similarity (384-dim BGE standard) with Citation Provenance.
- **DevOps:** Docker, Docker Compose, Pytest test suite.

---

## ⚡ Quick Start (Local Standalone Mode)

### 1. Backend Setup & Seeding
```bash
# Activate virtual environment
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt email-validator

# Seed database with realistic demonstration projects
python database/seed_data.py

# Start FastAPI backend server (Port 8000)
uvicorn apps.api.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000`  
Swagger API Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd apps/web
npm install
npm run dev
```
Frontend Web Console will be live at `http://localhost:3000`

---

## 🐳 Docker Deployment
Run the complete stack (Postgres + pgvector + FastAPI + Next.js):
```bash
docker compose up --build
```

---

## 🧪 Running Tests
Execute the full test suite covering ML feature extraction, risk scoring, SHAP explainability, data quality, and FastAPI endpoints:
```bash
pytest tests/
```

---

## 👥 Demonstration User Accounts (RBAC)
| Role | Email | Password | Access Level |
|---|---|---|---|
| **Monitoring Officer** | `officer@mospi.gov.in` | `Officer@123` | Full IPMD Officer View & Interventions |
| **Admin** | `admin@mospi.gov.in` | `Admin@123` | System Administrator / Joint Secretary |
| **Ministry User** | `ministry@railways.gov.in` | `Ministry@123` | Sector Specific Access |
| **Data Analyst** | `analyst@mospi.gov.in` | `Analyst@123` | Model Governance & Analytics |
| **SIH Judge / Viewer** | `judge@sih.gov.in` | `Judge@123` | Read-only Evaluation Console |

---

## ⏱️ 3-Minute SIH Evaluation Demo Walkthrough
1. **Executive Dashboard:** Open `http://localhost:3000/dashboard` to inspect live national KPIs, risk distribution, and top priority projects.
2. **Project Explorer:** Filter by "Critical Risk" or search `PRJ-001`.
3. **Project 360:** Open `PRJ-001` (Delhi-Mumbai Expressway Phase-2) to inspect Risk Score (84/100), Delay Probability (84%), SHAP risk driver breakdown, and monthly progress trends.
4. **Early Warning Center:** Review active triggers and inspect recommended actions.
5. **PRAGATI AI Assistant:** Ask *"Why is Project PRJ-001 high risk?"* and verify cited DPR and IPMD report evidence.
6. **Intervention Dispatcher:** Click *"Dispatch Intervention"*, assign to Director IPMD, and track live in the Intervention Ledger.
7. **Model Performance:** Navigate to the CUF Experiment tab to verify Model A vs Model B statistical uplift.
