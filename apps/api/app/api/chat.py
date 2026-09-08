from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.rag_service import rag_service
from app.models.entities import ChatSession, ChatMessage

router = APIRouter(prefix="/chat", tags=["PRAGATI AI Assistant"])

@router.post("", response_model=ChatResponse)
def chat_with_assistant(req: ChatRequest, db: Session = Depends(get_db)):
    return rag_service.answer_query(
        db=db,
        query=req.message,
        session_id=req.session_id,
        project_id=req.project_id
    )

@router.get("/sessions")
def get_chat_sessions(db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).order_by(ChatSession.created_at.desc()).limit(20).all()
    return [{"id": s.id, "title": s.title, "created_at": s.created_at} for s in sessions]

@router.get("/sessions/{id}/messages")
def get_session_messages(id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return session.messages
