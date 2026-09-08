# PRAGATI-AI Architecture Documentation

## Overview
**PRAGATI-AI** (*Predictive Risk Analytics & Government Infrastructure Intelligence*) transforms traditional descriptive project monitoring in the Ministry of Statistics and Programme Implementation (**MoSPI**) into an end-to-end predictive and prescriptive decision-support intelligence platform.

```
                 PAIMANA / OCMS DATA
                         │
                         ▼
                 DATA INGESTION (API / CSV / Excel / Synthetic)
                         │
                         ▼
                  DATA QUALITY (10-Rule Audit)
                         │
                         ▼
                 FEATURE ENGINEERING (Cost, Schedule, Progress, Milestones)
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
      PostgreSQL / SQLite      Documents
              │                     │
              ▼                     ▼
          ML ENGINE                RAG (Hybrid Retrieval + Citations)
              │                     │
       ┌──────┼──────┐              │
       │      │      │              │
       ▼      ▼      ▼              │
      COST   DELAY   RISK           │
       │      │      │              │
       └──────┼──────┴──────────────┘
              │
              ▼
        SHAP EXPLAINABILITY
              │
              ▼
       DECISION ENGINE
              │
       ┌──────┴───────┐
       │              │
       ▼              ▼
 EARLY WARNING    RECOMMENDATION
       │              │
       └──────┬───────┘
              │
              ▼
       WEB DASHBOARD
              │
              ▼
       AI ASSISTANT
```

## System Layers
1. **Data Ingestion & Hygiene:** Validates data provenance tags (`OFFICIAL_API`, `OFFICIAL_REPORT`, `USER_UPLOAD`, `DEMO`, `SYNTHETIC`) and enforces 10 data hygiene rules.
2. **Feature Engineering:** Extracts dynamic progress velocity, financial discrepancies, and milestone criticality without future-data leakage.
3. **ML Prediction Engine:** XGBoost + LightGBM ensemble for cost overrun probability and time delay forecasting.
4. **SHAP Explainability:** Transparent positive and negative feature attributions.
5. **Early Warning & Recommendations:** Automated threshold triggers and prescriptive action directives.
6. **RAG & PRAGATI AI Assistant:** Hybrid SQL + vector retrieval with exact citations.
