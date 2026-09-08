import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.entities import DocumentChunk, Document, Project
from rag.embeddings.embedder import VectorEmbedder

class HybridRetriever:
    """
    Hybrid retriever combining structured SQL filtering, full-text keyword matching,
    and dense vector semantic search with citation provenance tracking.
    """

    @classmethod
    def parse_query_intent(cls, query: str) -> Dict[str, Any]:
        """
        Extracts structured intent from natural language questions:
        e.g. 'Show high risk railway projects above 5000 crore' ->
        { sector: 'Railways', min_cost: 5000, risk: 'HIGH' }
        """
        intent = {
            "project_code": None,
            "sector": None,
            "min_cost": None,
            "risk_level": None,
            "state": None
        }

        # Project code extraction (e.g. PRJ-001, PRJ-104)
        prj_match = re.search(r'\b(PRJ-\d{3,4})\b', query, re.IGNORECASE)
        if prj_match:
            intent["project_code"] = prj_match.group(1).upper()

        # Sector detection
        query_lower = query.lower()
        if "rail" in query_lower:
            intent["sector"] = "Railways"
        elif "highway" in query_lower or "road" in query_lower:
            intent["sector"] = "Road Transport & Highways"
        elif "power" in query_lower or "solar" in query_lower:
            intent["sector"] = "Power & Renewable Energy"
        elif "petroleum" in query_lower or "gas" in query_lower:
            intent["sector"] = "Petroleum & Natural Gas"
        elif "water" in query_lower or "jal" in query_lower:
            intent["sector"] = "Water Resources"
        elif "health" in query_lower or "aiims" in query_lower:
            intent["sector"] = "Health & Family Welfare"
        elif "metro" in query_lower:
            intent["sector"] = "Urban Metro"

        # Cost thresholds (e.g. "above 5000", "over 1000 cr")
        cost_match = re.search(r'(?:above|over|greater than|>|exceeding)\s*(?:₹|rs\.?)?\s*(\d+)', query, re.IGNORECASE)
        if cost_match:
            intent["min_cost"] = float(cost_match.group(1))

        # Risk level detection
        if "critical" in query_lower:
            intent["risk_level"] = "CRITICAL"
        elif "high risk" in query_lower or "high-risk" in query_lower:
            intent["risk_level"] = "HIGH"
        elif "medium risk" in query_lower:
            intent["risk_level"] = "MEDIUM"
        elif "low risk" in query_lower:
            intent["risk_level"] = "LOW"

        return intent

    @classmethod
    def retrieve_context(cls, db: Session, query: str, top_k: int = 4, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Executes hybrid retrieval:
        1. Identifies targeted projects via SQL if project_code or project_id exists.
        2. Retrieves semantic chunks with cosine similarity.
        3. Returns grounded passages with document metadata & citations.
        """
        intent = cls.parse_query_intent(query)
        query_vec = VectorEmbedder.embed_text(query)

        # Base query on DocumentChunk
        chunk_query = db.query(DocumentChunk).join(Document)

        if project_id:
            chunk_query = chunk_query.filter(Document.project_id == project_id)
        elif intent["project_code"]:
            prj = db.query(Project).filter(Project.project_code == intent["project_code"]).first()
            if prj:
                chunk_query = chunk_query.filter(Document.project_id == prj.id)

        all_chunks = chunk_query.limit(100).all()

        if not all_chunks:
            # Fallback to all document chunks
            all_chunks = db.query(DocumentChunk).join(Document).limit(100).all()

        scored_chunks = []
        for chk in all_chunks:
            emb = chk.embedding or VectorEmbedder.embed_text(chk.content)
            sim = VectorEmbedder.cosine_similarity(query_vec, emb)
            
            # Boost score if keywords appear in content
            content_lower = chk.content.lower()
            keyword_boost = 0.0
            for term in query.lower().split():
                if len(term) > 3 and term in content_lower:
                    keyword_boost += 0.05
            
            final_score = sim + keyword_boost

            doc_title = chk.document.title if chk.document else "MoSPI IPMD Report"
            doc_type = chk.document.document_type if chk.document else "REPORT"
            doc_meta = chk.chunk_metadata or {}

            scored_chunks.append({
                "chunk_id": chk.id,
                "document_id": chk.document_id,
                "document_title": doc_title,
                "document_type": doc_type,
                "section": doc_meta.get("section", "General"),
                "page": doc_meta.get("page", 1),
                "content": chk.content,
                "score": float(final_score),
                "citation": {
                    "document_title": doc_title,
                    "document_type": doc_type,
                    "project_code": doc_meta.get("project_code"),
                    "section": doc_meta.get("section", "Monitoring Summary"),
                    "page": doc_meta.get("page", 1),
                    "excerpt": chk.content[:200] + "..." if len(chk.content) > 200 else chk.content
                }
            })

        # Rank by score descending
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k]
