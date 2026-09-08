# Database Architecture & Schema

## Tables
1. `users`: Authentication & RBAC (`ADMIN`, `MONITORING_OFFICER`, `MINISTRY_USER`, `ANALYST`, `VIEWER`).
2. `ministries`: Central ministries (MoRTH, MoR, MoP, MoPNG, MoJS, MoHFW, MoHUA, MoPSW).
3. `departments`: Line departments & agencies.
4. `sectors`: Infrastructure classification sectors.
5. `states`: Indian states with GIS centroids for geospatial mapping.
6. `projects`: Core infrastructure projects with sanctioned/revised costs, dates, progress, coordinates, and `source_type`.
7. `project_monthly_data`: Historical monthly time series snapshots.
8. `milestones`: Milestone pipeline with delay days and criticality.
9. `risk_predictions`: Multi-dimensional risk outputs with model versions.
10. `risk_factors`: Local SHAP feature attribution factors.
11. `alerts`: Automated early warning triage alerts.
12. `documents`: Ingested DPRs, audit reports, and circulars.
13. `document_chunks`: Semantic chunks with 384-dimensional vector embeddings.
14. `chat_sessions`: Conversational history sessions.
15. `chat_messages`: Assistant messages with citations.
16. `interventions`: Closed-loop prescriptive directive tracking.
17. `model_versions`: Model governance and registry metrics.
