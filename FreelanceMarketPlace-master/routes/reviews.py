from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter()

# GET all reviews for a listing
@router.get("/{listing_id}")
def get_reviews(listing_id: str):
    result = supabase.table("reviews")\
        .select("*")\
        .eq("listing_id", listing_id)\
        .execute()
    return result.data

# POST create new review
@router.post("/")
def create_review(review: dict):
    result = supabase.table("reviews")\
        .insert(review)\
        .execute()
    return result.data

# GET all reviews for a seller/freelancer's listings
@router.get("/seller/{seller_id}")
def get_seller_reviews(seller_id: str):
    # Fetch all listings of this seller
    listings_res = supabase.table("listings").select("id").eq("seller_id", seller_id).execute()
    if not listings_res.data:
        return []
    listing_ids = [item["id"] for item in listings_res.data]
    
    # Fetch all reviews for these listings
    reviews_res = supabase.table("reviews")\
        .select("*")\
        .in_("listing_id", listing_ids)\
        .execute()
        
    reviews_data = reviews_res.data or []
    # Attach reviewer full names dynamically in a batch query
    user_ids = list(set(r.get("user_id") for r in reviews_data if r.get("user_id")))
    profiles_map = {}
    if user_ids:
        profiles_res = supabase.table("profiles").select("id, full_name").in_("id", user_ids).execute()
        profiles_map = {p["id"]: p.get("full_name") for p in (profiles_res.data or [])}
        
    for r in reviews_data:
        uid = r.get("user_id")
        if uid and uid in profiles_map:
            r["reviewer_name"] = profiles_map[uid] or "Hiring Client"
        else:
            r["reviewer_name"] = "Hiring Client"
            
    return reviews_data

# POST create a secure review for a completed order
@router.post("/{order_id}")
def create_order_review(order_id: str, review_data: dict):
    client_id = review_data.get("client_id")
    rating = review_data.get("rating")
    review_text = review_data.get("review_text")
    
    if not client_id or rating is None or not review_text:
        raise HTTPException(status_code=400, detail="client_id, rating, and review_text are required")
        
    # 1. Fetch order
    order_res = supabase.table("orders").select("*").eq("id", order_id).execute()
    if not order_res.data:
        raise HTTPException(status_code=404, detail="Order not found")
    order = order_res.data[0]
    
    # 2. Validate order belongs to the logged-in client
    if order.get("buyer_id") != client_id:
        raise HTTPException(status_code=403, detail="Unauthorized: You do not own this order")
        
    # 3. Validate order status is completed
    if order.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Order is not completed yet")
        
    # 4. Validate order has not been rated already
    if order.get("is_rated") is True:
        raise HTTPException(status_code=400, detail="This order has already been rated")
        
    # 5. Make sure freelancers cannot rate themselves (client_id cannot be freelancer_id)
    freelancer_id = order.get("seller_id")
    if client_id == freelancer_id:
        raise HTTPException(status_code=400, detail="You cannot rate yourself")
        
    # 6. Save the review in the reviews table
    review_payload = {
        "order_id": order_id,
        "client_id": client_id,
        "freelancer_id": freelancer_id,
        "rating": rating,
        "review_text": review_text,
        # Compatibility mapping for existing UI
        "user_id": client_id,
        "comment": review_text,
        "listing_id": order.get("listing_id")
    }
    
    review_res = supabase.table("reviews").insert(review_payload).execute()
    if not review_res.data:
        raise HTTPException(status_code=500, detail="Failed to save review")
        
    # 7. Update order to set is_rated = true
    supabase.table("orders").update({"is_rated": True}).eq("id", order_id).execute()
    
    # 8. Sync rating, reviews, and completion rate
    sync_ratings_and_reviews(freelancer_id, order.get("listing_id"))
    
    return review_res.data[0]


def sync_ratings_and_reviews(freelancer_id: str, listing_id: str):
    if listing_id:
        # Check if the listing is a product or service
        listing_res = supabase.table("listings").select("listing_type").eq("id", listing_id).execute()
        if listing_res.data:
            # Fetch all reviews for this listing
            reviews_res = supabase.table("reviews").select("*").eq("listing_id", listing_id).execute()
            reviews_list = reviews_res.data or []
            
            rating_count = len(reviews_list)
            rating_average = 5.0
            if rating_count > 0:
                rating_average = round(sum(r.get("rating", 5) for r in reviews_list) / rating_count, 1)
                
            # Fetch reviewer names in a batch
            rev_ids = list(set(r.get("client_id") or r.get("user_id") for r in reviews_list if r.get("client_id") or r.get("user_id")))
            profiles_map = {}
            if rev_ids:
                profiles_res = supabase.table("profiles").select("id, full_name").in_("id", rev_ids).execute()
                profiles_map = {p["id"]: p.get("full_name") for p in (profiles_res.data or [])}

            embedded_reviews = []
            for r in reviews_list:
                rev_id = r.get("client_id") or r.get("user_id")
                reviewer_name = "Client"
                if rev_id and rev_id in profiles_map:
                    reviewer_name = profiles_map[rev_id] or "Client"
                embedded_reviews.append({
                    "reviewer_id": rev_id,
                    "reviewer_name": reviewer_name,
                    "rating": r.get("rating"),
                    "comment": r.get("comment") or r.get("review_text"),
                    "created_at": r.get("created_at")
                })
                
            try:
                supabase.table("listings").update({
                    "rating_average": rating_average,
                    "rating_count": rating_count,
                    "reviews": embedded_reviews
                }).eq("id", listing_id).execute()
            except Exception as e:
                print(f"Failed to update listing aggregation fields: {e}")

    if freelancer_id:
        # Fetch all reviews for this freelancer
        reviews_res = supabase.table("reviews").select("*").eq("freelancer_id", freelancer_id).execute()
        reviews_list = reviews_res.data or []
        
        reviews_count = len(reviews_list)
        rating_average = 5.0
        if reviews_count > 0:
            rating_average = round(sum(r.get("rating", 5) for r in reviews_list) / reviews_count, 1)
            
        # Fetch reviewer names in a batch
        rev_ids = list(set(r.get("client_id") or r.get("user_id") for r in reviews_list if r.get("client_id") or r.get("user_id")))
        profiles_map = {}
        if rev_ids:
            profiles_res = supabase.table("profiles").select("id, full_name").in_("id", rev_ids).execute()
            profiles_map = {p["id"]: p.get("full_name") for p in (profiles_res.data or [])}

        embedded_reviews = []
        for r in reviews_list:
            rev_id = r.get("client_id") or r.get("user_id")
            reviewer_name = "Client"
            if rev_id and rev_id in profiles_map:
                reviewer_name = profiles_map[rev_id] or "Client"
            embedded_reviews.append({
                "reviewer_id": rev_id,
                "reviewer_name": reviewer_name,
                "rating": r.get("rating"),
                "comment": r.get("comment") or r.get("review_text"),
                "created_at": r.get("created_at")
            })
            
        # Calculate completion rate
        orders_res = supabase.table("orders").select("status").eq("seller_id", freelancer_id).execute()
        orders_list = orders_res.data or []
        
        completed = sum(1 for o in orders_list if o.get("status") == "completed")
        cancelled = sum(1 for o in orders_list if o.get("status") == "cancelled")
        
        total_finished = completed + cancelled
        completion_rate = 100
        if total_finished > 0:
            completion_rate = int((completed / total_finished) * 100)
            
        try:
            supabase.table("profiles").update({
                "rating": rating_average,
                "reviews_count": reviews_count,
                "reviews": embedded_reviews,
                "completion_rate": completion_rate
            }).eq("id", freelancer_id).execute()
        except Exception as e:
            try:
                # Fallback to update just rating and reviews_count (which exist)
                supabase.table("profiles").update({
                    "rating": rating_average,
                    "reviews_count": reviews_count
                }).eq("id", freelancer_id).execute()
            except Exception as e2:
                print(f"Failed to update profile ratings: {e2}")