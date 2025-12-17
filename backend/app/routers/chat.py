from fastapi import APIRouter
from pydantic import BaseModel
from services.chat_service import process_chat_message

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process chat message and return AI response"""
    response = await process_chat_message(request.message)
    return ChatResponse(response=response)