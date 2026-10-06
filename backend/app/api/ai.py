from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import AIConversation, AIMessage, PatientProfile, UserRole
from app.schemas.schemas import AIChatRequest, AIChatResponse
from app.api.patients import get_current_patient_profile
from app.services.digital_twin import DigitalTwinService
from app.services.rag_service import RAGService
from app.services.llm_provider import get_llm_provider
from app.services.safety_service import SafetyService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/ai", tags=["AI Health Assistant"])

SYSTEM_PROMPT = """
You are Health Sync AI, an AI-powered health information assistant. 
Your role is to help users understand their health information using the authorized patient context provided to you.
You are not a doctor and must not claim to diagnose diseases or replace medical professionals.

Strict Operating Rules:
1. Use only the authorized patient context provided in the current request.
2. Never invent medical history, lab values, medications or diagnoses.
3. Clearly distinguish recorded facts from possible interpretations.
4. Never prescribe medication or change medication dosage.
5. Never tell the user to stop prescribed medication.
6. Explain medical terminology in simple, empathetic language.
7. If information in the profile is insufficient to answer, explicitly say so.
8. For potentially serious symptoms, recommend professional medical evaluation.
9. For emergencies, recommend immediate emergency medical care.
10. Never reveal information belonging to another patient.
11. Always maintain a professional, reassuring, and safety-focused tone.
"""

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_assistant(
    payload: AIChatRequest,
    request: Request,
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    # 1. Safety Pre-check
    safety_eval = SafetyService.evaluate_user_query(payload.message)
    if safety_eval["is_emergency"] or safety_eval["override_response"]:
        # Direct override response for emergency / dosage attempts
        conv = None
        if payload.conversation_id:
            conv = db.query(AIConversation).filter(AIConversation.id == payload.conversation_id, AIConversation.patient_id == profile.id).first()
        if not conv:
            conv = AIConversation(patient_id=profile.id, title=payload.message[:30] + "...")
            db.add(conv)
            db.commit()
            db.refresh(conv)

        # Save user message
        db.add(AIMessage(conversation_id=conv.id, role="user", content=payload.message))
        # Save assistant safety override
        asst_msg = AIMessage(
            conversation_id=conv.id,
            role="assistant",
            content=safety_eval["override_response"],
            context_used=["Safety Intercept System"]
        )
        db.add(asst_msg)
        db.commit()

        return AIChatResponse(
            conversation_id=conv.id,
            message=safety_eval["override_response"],
            context_used=["Safety Intercept System"],
            disclaimer=safety_eval["disclaimer"],
            urgency=safety_eval["urgency"]
        )

    # 2. Digital Twin Context Building & RAG Retrieval
    full_context = DigitalTwinService.build_patient_context(db, profile.id)
    min_context, sources_used = RAGService.get_minimum_necessary_context(payload.message, full_context)

    # 3. Conversation History
    conv = None
    if payload.conversation_id:
        conv = db.query(AIConversation).filter(AIConversation.id == payload.conversation_id, AIConversation.patient_id == profile.id).first()
    
    if not conv:
        conv = AIConversation(patient_id=profile.id, title=payload.message[:30] + "...")
        db.add(conv)
        db.commit()
        db.refresh(conv)

    history_messages = db.query(AIMessage).filter(AIMessage.conversation_id == conv.id).order_by(AIMessage.created_at.asc()).all()
    
    messages_payload = []
    for m in history_messages[-6:]: # Last 6 messages for context economy
        messages_payload.append({"role": m.role, "content": m.content})
    
    messages_payload.append({"role": "user", "content": payload.message})

    # 4. LLM Generation
    llm = get_llm_provider()
    raw_response = await llm.generate(messages_payload, SYSTEM_PROMPT, min_context)

    # 5. Post-generation Safety Sanitize
    final_response = SafetyService.sanitize_ai_response(raw_response, safety_eval)

    # 6. Save Messages
    db.add(AIMessage(conversation_id=conv.id, role="user", content=payload.message))
    asst_msg = AIMessage(
        conversation_id=conv.id,
        role="assistant",
        content=final_response,
        context_used=sources_used
    )
    db.add(asst_msg)
    db.commit()

    AuditService.log(db, action="AI_REQUEST", resource_type="AIConversation", user_id=profile.user_id, resource_id=conv.id)

    return AIChatResponse(
        conversation_id=conv.id,
        message=final_response,
        context_used=sources_used,
        disclaimer=safety_eval["disclaimer"],
        urgency=safety_eval["urgency"]
    )

@router.get("/conversations")
def get_conversations(profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    convs = db.query(AIConversation).filter(AIConversation.patient_id == profile.id).order_by(AIConversation.updated_at.desc()).all()
    return [{"id": c.id, "title": c.title, "created_at": c.created_at} for c in convs]

@router.get("/conversations/{conv_id}")
def get_conversation_messages(conv_id: str, profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    conv = db.query(AIConversation).filter(AIConversation.id == conv_id, AIConversation.patient_id == profile.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = db.query(AIMessage).filter(AIMessage.conversation_id == conv.id).order_by(AIMessage.created_at.asc()).all()
    return {
        "id": conv.id,
        "title": conv.title,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "context_used": m.context_used,
                "created_at": m.created_at
            }
            for m in messages
        ]
    }
