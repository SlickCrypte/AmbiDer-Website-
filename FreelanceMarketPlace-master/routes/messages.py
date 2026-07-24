from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from database import supabase
from typing import List, Dict

router = APIRouter()

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_message(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

manager = ConnectionManager()

# WebSocket endpoint — real time chat
@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Wait for message from this user
            data = await websocket.receive_json()
            
            # Save message to Supabase
            message = {
                "sender_id": user_id,
                "receiver_id": data["receiver_id"],
                "message": data["message"],
                "is_read": False
            }
            result = supabase.table("messages").insert(message).execute()
            saved_message = result.data[0]

            # Send to sender (confirmation)
            await manager.send_message(user_id, saved_message)

            # Send to receiver if online
            await manager.send_message(
                data["receiver_id"], 
                saved_message
            )

    except WebSocketDisconnect:
        manager.disconnect(user_id)

# GET all messages between two users
@router.get("/{sender_id}/{receiver_id}")
def get_messages(sender_id: str, receiver_id: str):
    result = supabase.table("messages")\
        .select("*")\
        .or_(
            f"and(sender_id.eq.{sender_id},receiver_id.eq.{receiver_id}),"
            f"and(sender_id.eq.{receiver_id},receiver_id.eq.{sender_id})"
        )\
        .order("created_at")\
        .execute()
    return result.data

# GET all conversations for a user
@router.get("/{user_id}")
def get_conversations(user_id: str):
    result = supabase.table("messages")\
        .select("*")\
        .or_(f"sender_id.eq.{user_id},receiver_id.eq.{user_id}")\
        .order("created_at", desc=True)\
        .execute()
    return result.data

# POST insert new message
@router.post("/")
def create_message(msg: dict):
    result = supabase.table("messages").insert(msg).execute()
    return result.data[0]

# Mark messages as read
@router.put("/read/{sender_id}/{receiver_id}")
def mark_as_read(sender_id: str, receiver_id: str):
    result = supabase.table("messages")\
        .update({"is_read": True})\
        .eq("sender_id", sender_id)\
        .eq("receiver_id", receiver_id)\
        .execute()
    return result.data