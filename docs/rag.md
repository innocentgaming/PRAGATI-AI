# RAG & PRAGATI AI Assistant Documentation

## Pipeline Overview
The PRAGATI AI RAG architecture strictly obeys the **Zero-Hallucination** mandate:
- **ML Predicts**: Quantitative risk probabilities, delay months, and cost escalation.
- **RAG Retrieves**: Factual documentation, DPR findings, quarterly audit reports, and milestone details.
- **LLM Explains**: Synthesizes grounded executive briefings with exact provenance citations.

```
USER QUESTION
      │
      ▼
INTENT DETECTION & ENTITY EXTRACTION
      │
      ▼
STRUCTURED SQL FILTER (Sector, Cost, Code)
      │
      ▼
DENSE VECTOR COSINE SEARCH (384-dim BGE standard)
      │
      ▼
CROSS-ENCODER RERANKING
      │
      ▼
GROUNDED PROMPT SYNTHESIS
      │
      ▼
ANSWER + SOURCE CITATIONS
```

## Citation Format
Every response returns a structured citation object:
```json
{
  "document_title": "MoSPI IPMD Monthly Review: PRJ-001",
  "document_type": "MONTHLY_MONITORING_REPORT",
  "project_code": "PRJ-001",
  "section": "Technical Audit",
  "page": 1,
  "excerpt": "Detailed Project Report (DPR) highlighted extensive delays in forest clearances..."
}
```
