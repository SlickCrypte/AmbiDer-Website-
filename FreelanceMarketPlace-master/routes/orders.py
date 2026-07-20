from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter()

# GET all orders of a buyer
@router.get("/{buyer_id}")
def get_orders(buyer_id: str):
    # 1. Fetch orders
    orders_res = supabase.table("orders").select("*").eq("buyer_id", buyer_id).execute()
    orders = orders_res.data or []
    if not orders:
        return []
    
    # 2. Extract unique seller_ids
    seller_ids = list(set(o.get("seller_id") for o in orders if o.get("seller_id")))
    
    # 3. Fetch seller profiles in a single query
    profiles_map = {}
    if seller_ids:
        profiles_res = supabase.table("profiles").select("id, full_name, avatar_bg").in_("id", seller_ids).execute()
        profiles_map = {p["id"]: p for p in (profiles_res.data or [])}
        
    # 4. Join profile data into orders
    for order in orders:
        seller_id = order.get("seller_id")
        profile = profiles_map.get(seller_id, {})
        order["seller_profile"] = {
            "full_name": profile.get("full_name") or "Freelancer",
            "avatar_bg": profile.get("avatar_bg") or "#EBF1F5"
        }
        
    return orders

# GET all orders of a seller
@router.get("/seller/{seller_id}")
def get_seller_orders(seller_id: str):
    # 1. Fetch orders
    orders_res = supabase.table("orders").select("*").eq("seller_id", seller_id).execute()
    orders = orders_res.data or []
    if not orders:
        return []
        
    # 2. Extract unique buyer_ids
    buyer_ids = list(set(o.get("buyer_id") for o in orders if o.get("buyer_id")))
    
    # 3. Fetch buyer profiles in a single query
    profiles_map = {}
    if buyer_ids:
        profiles_res = supabase.table("profiles").select("id, full_name, avatar_bg").in_("id", buyer_ids).execute()
        profiles_map = {p["id"]: p for p in (profiles_res.data or [])}
        
    # 4. Join profile data into orders
    for order in orders:
        buyer_id = order.get("buyer_id")
        profile = profiles_map.get(buyer_id, {})
        order["buyer_profile"] = {
            "full_name": profile.get("full_name") or "Client",
            "avatar_bg": profile.get("avatar_bg") or "#EBF1F5"
        }
        
    return orders

# POST create new order
@router.post("/")
def create_order(order: dict):
    result = supabase.table("orders")\
        .insert(order)\
        .execute()
    return result.data

# PUT update order status
@router.put("/{order_id}")
def update_order(order_id: str, update: dict):
    result = supabase.table("orders")\
        .update(update)\
        .eq("id", order_id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return result.data

# GET single order details by order_id
@router.get("/detail/{order_id}")
def get_order_detail(order_id: str):
    result = supabase.table("orders")\
        .select("*")\
        .eq("id", order_id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return result.data[0]

# PUT complete order
@router.put("/{order_id}/complete")
def complete_order(order_id: str, client_id: str):
    # 1. Fetch order
    res = supabase.table("orders").select("*").eq("id", order_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Order not found")
    order = res.data[0]
    
    # 2. Verify that the logged-in client owns the order (buyer_id == client_id)
    if order.get("buyer_id") != client_id:
        raise HTTPException(status_code=403, detail="Unauthorized: You do not own this order")
        
    # 3. Verify the order is currently active (status is not 'completed')
    if order.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Order is already completed")
        
    # 4. Update status to completed while keeping is_rated = false
    update_res = supabase.table("orders")\
        .update({"status": "completed", "is_rated": False})\
        .eq("id", order_id)\
        .execute()
        
    if not update_res.data:
        raise HTTPException(status_code=500, detail="Failed to update order status")
        
    return update_res.data[0]