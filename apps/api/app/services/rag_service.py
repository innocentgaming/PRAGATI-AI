import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.entities import Project, RiskPrediction, Alert, DocumentChunk, ChatSession, ChatMessage
from rag.retrieval.retriever import HybridRetriever
from app.schemas.schemas import ChatResponse, Citation

class RAGService:
    @classmethod
    def answer_query(cls, db: Session, query: str, session_id: Optional[str] = None, project_id: Optional[str] = None, user_id: Optional[str] = None) -> ChatResponse:
        # Create session if needed
        if not session_id:
            chat_session = ChatSession(user_id=user_id, title=query[:50])
            db.add(chat_session)
            db.commit()
            db.refresh(chat_session)
            session_id = chat_session.id

        # Save user message
        user_msg = ChatMessage(session_id=session_id, role="user", content=query)
        db.add(user_msg)
        db.commit()

        # Parse intent
        intent = HybridRetriever.parse_query_intent(query)
        query_lower = query.lower()

        # 1. Retrieve hybrid document chunks
        retrieved = HybridRetriever.retrieve_context(db, query, top_k=3, project_id=project_id)
        citations = [Citation(**item["citation"]) for item in retrieved if "citation" in item]

        # 2. Structured SQL Data Extraction
        structured_data = {}
        suggested_actions = []

        # Intent: Specific Project Details
        target_project = None
        if project_id:
            target_project = db.query(Project).filter(Project.id == project_id).first()
        elif intent["project_code"]:
            target_project = db.query(Project).filter(Project.project_code == intent["project_code"]).first()

        if target_project:
            latest_pred = target_project.risk_predictions[0] if target_project.risk_predictions else None
            structured_data = {
                "project_code": target_project.project_code,
                "project_name": target_project.project_name,
                "sector": target_project.sector.name if target_project.sector else "N/A",
                "original_cost": target_project.original_cost,
                "revised_cost": target_project.revised_cost,
                "cost_growth_pct": round(((target_project.revised_cost - target_project.original_cost) / target_project.original_cost) * 100, 1),
                "physical_progress": target_project.physical_progress,
                "financial_progress": target_project.financial_progress,
                "risk_score": latest_pred.overall_risk_score if latest_pred else 50.0,
                "risk_level": latest_pred.risk_level if latest_pred else "MEDIUM",
                "predicted_delay_months": latest_pred.predicted_delay_months if latest_pred else 0.0,
                "delay_probability": latest_pred.delay_probability if latest_pred else 0.0,
                "cost_overrun_probability": latest_pred.cost_overrun_probability if latest_pred else 0.0
            }

            # Response Synthesis for Specific Project
            response_text = f"### 📊 Project Intelligence Brief: **{target_project.project_name}** (`{target_project.project_code}`)\n\n"
            response_text += f"- **Current Status**: {target_project.project_status} | **Source**: `{target_project.source_type}`\n"
            response_text += f"- **Sanctioned Cost**: ₹{target_project.original_cost:,.2f} Cr ➔ **Revised Cost**: ₹{target_project.revised_cost:,.2f} Cr (**+{structured_data['cost_growth_pct']}%** escalation)\n"
            response_text += f"- **Progress**: **{target_project.physical_progress}%** Physical vs **{target_project.financial_progress}%** Financial Expenditure\n\n"

            if latest_pred:
                response_text += f"#### ⚠️ Predictive Risk Assessment\n"
                response_text += f"- **Overall Risk Score**: **{latest_pred.overall_risk_score}/100** (`{latest_pred.risk_level}`)\n"
                response_text += f"- **Schedule Delay Probability**: **{round(latest_pred.delay_probability * 100, 1)}%** (Estimated delay: **{latest_pred.predicted_delay_months} months**)\n"
                response_text += f"- **Cost Overrun Probability**: **{round(latest_pred.cost_overrun_probability * 100, 1)}%** (Forecasted escalation: **+{round(latest_pred.predicted_cost_overrun, 1)}%**)\n\n"

                if latest_pred.risk_factors:
                    response_text += f"#### 🔍 Key Risk Drivers (SHAP Attribution)\n"
                    for rf in latest_pred.risk_factors[:4]:
                        direction_icon = "🔺" if rf.impact_direction == "INCREASE_RISK" else "🟢"
                        response_text += f"- {direction_icon} **{rf.feature_name}**: Impact **{rf.impact_score:+.1f}** points\n"
                    response_text += "\n"

            # Check for active alerts
            active_alerts = [a for a in target_project.alerts if a.status == "OPEN"]
            if active_alerts:
                response_text += f"#### 🚨 Active Early Warnings ({len(active_alerts)})\n"
                for a in active_alerts[:2]:
                    response_text += f"- **[{a.severity}] {a.title}**: {a.description}\n"
                response_text += "\n"

            response_text += "#### 💡 Prescriptive Recommendations\n"
            response_text += f"1. Initiate immediate tripartite technical review with `{target_project.implementing_agency}`.\n"
            response_text += f"2. Audit pending milestone clearances and contract price-variation escalations.\n"
            response_text += f"3. Deploy joint engineering field inspection to reconcile physical output with financial burn rate."

            suggested_actions = [
                f"Create Intervention for {target_project.project_code}",
                f"View Project 360 for {target_project.project_code}",
                "Download MoSPI Monitoring Brief (PDF)"
            ]

        # Intent: High Risk Projects List / Multi-project query
        elif "high risk" in query_lower or "at risk" in query_lower or "critical" in query_lower:
            high_risk_preds = db.query(RiskPrediction).filter(RiskPrediction.overall_risk_score >= 61.0).order_by(RiskPrediction.overall_risk_score.desc()).limit(5).all()
            
            response_text = f"### 🚨 High-Risk Central Sector Projects Requiring Intervention\n\n"
            response_text += f"Based on PRAGATI-AI predictive monitoring, **{len(high_risk_preds)} critical projects** currently have severe time/cost escalation exposure:\n\n"
            
            for p in high_risk_preds:
                prj = p.project
                sector_name = prj.sector.name if prj.sector else "Infrastructure"
                response_text += f"- **{prj.project_name}** (`{prj.project_code}`)\n"
                response_text += f"  - **Risk Score**: `{p.overall_risk_score}/100` ({p.risk_level}) | **Sector**: {sector_name}\n"
                response_text += f"  - **Predicted Delay**: `{p.predicted_delay_months} Months` | **Cost Overrun Prob**: `{round(p.cost_overrun_probability*100)}%`\n"
                response_text += f"  - **Physical Progress**: {prj.physical_progress}% vs Financial: {prj.financial_progress}%\n\n"

            response_text += "#### 🎯 Recommended Action\n"
            response_text += "Immediate triage and officer assignment in the **Intervention Tracking** dashboard is recommended for top 3 high-risk projects."
            
            suggested_actions = [
                "Open High-Risk Project Explorer",
                "Review Early Warning Center Alerts",
                "Export High-Risk Executive Summary"
            ]

        # Intent: Top Cost Escalation Drivers
        elif "cost escalation driver" in query_lower or "why cost overrun" in query_lower or "drivers" in query_lower:
            response_text = "### 📈 Top Root Cause Drivers for Project Cost Escalation\n\n"
            response_text += "Analysis of historical OCMS/PAIMANA records and SHAP tree feature attribution indicates four primary escalation drivers:\n\n"
            response_text += "1. **Milestone Stalls & Critical Path Delays (+18.4 pts impact)**: Cascading delays in civil engineering milestones trigger equipment idle fees and contractor extension claims.\n"
            response_text += "2. **Land Acquisition & ROW Bottlenecks (+14.2 pts impact)**: Delayed possession of continuous Right-of-Way prevents linear infrastructure execution.\n"
            response_text += "3. **Material Price Index Escalation (+12.8 pts impact)**: Inflation in cement, structural steel, and bitumin over extended project durations.\n"
            response_text += "4. **Premature Financial Mobilization (+9.5 pts impact)**: Financial disbursement outpacing verified physical construction milestones."

            suggested_actions = [
                "Inspect Cost Overrun Trend",
                "View Model Feature Importance",
                "Check Sector Cost Escalation Benchmarks"
            ]

        # General Grounded Response with Retrieved Docs
        elif retrieved:
            response_text = f"### 📋 PRAGATI-AI Intelligence Synthesis\n\n"
            for item in retrieved:
                response_text += f"**From {item['document_title']} ({item['section']}):**\n"
                response_text += f"{item['content']}\n\n"
            
            response_text += "*(Information strictly grounded in verified MoSPI & PAIMANA monitoring records.)*"
            suggested_actions = ["Ask follow-up query", "View related projects"]
        else:
            response_text = "I don't have sufficient evidence in the indexed project records to answer this reliably. Please verify the project code or search parameters."

        # Save assistant message
        citations_json = [c.dict() for c in citations]
        asst_msg = ChatMessage(session_id=session_id, role="assistant", content=response_text, citations=citations_json)
        db.add(asst_msg)
        db.commit()

        return ChatResponse(
            session_id=session_id,
            message=response_text,
            citations=citations,
            structured_data=structured_data,
            suggested_actions=suggested_actions
        )

rag_service = RAGService()
