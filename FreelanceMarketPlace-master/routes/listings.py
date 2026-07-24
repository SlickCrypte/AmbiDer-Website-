from fastapi import APIRouter, HTTPException
from database import supabase

from typing import Optional

router = APIRouter()

def format_listing(item: dict) -> dict:
    if not item:
        return item
    if item.get("breadcrumb_category") == "job":
        item["listing_type"] = "job"
    item["skills"] = item.get("whats_included") or []
    if item.get("listing_type") == "job":
        days = item.get("delivery_days")
        if days == 30:
            item["duration"] = "1 Month"
        elif days == 180:
            item["duration"] = "6+ Months"
        else:
            item["duration"] = "3 Months"
    return item

# GET all listings
@router.get("/")
def get_all_listings(creator_id: Optional[str] = None):
    query = supabase.table("listings").select("*")
    if creator_id:
        query = query.eq("seller_id", creator_id)
    result = query.order("created_at", desc=True).execute()
    return [format_listing(item) for item in result.data]

# GET listing by ID
@router.get("/{listing_id}")
def get_listing(listing_id: str):
    result = supabase.table("listings")\
        .select("*")\
        .eq("id", listing_id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    return format_listing(result.data[0])

# GET listings by type (product or service)
@router.get("/type/{listing_type}")
def get_by_type(listing_type: str):
    if listing_type == "job":
        result = supabase.table("listings")\
            .select("*")\
            .eq("listing_type", "service")\
            .eq("breadcrumb_category", "job")\
            .order("created_at", desc=True)\
            .execute()
    elif listing_type == "service":
        result = supabase.table("listings")\
            .select("*")\
            .eq("listing_type", "service")\
            .neq("breadcrumb_category", "job")\
            .order("created_at", desc=True)\
            .execute()
    else:
        result = supabase.table("listings")\
            .select("*")\
            .eq("listing_type", listing_type)\
            .order("created_at", desc=True)\
            .execute()
    return [format_listing(item) for item in result.data]

# GET listings by creator ID
@router.get("/creator/{creator_id}")
def get_listings_by_creator(creator_id: str):
    result = supabase.table("listings")\
        .select("*")\
        .eq("seller_id", creator_id)\
        .order("created_at", desc=True)\
        .execute()
    return [format_listing(item) for item in result.data]

# POST create new listing
@router.post("/")
def create_listing(listing: dict):
    if "skills" in listing:
        listing["whats_included"] = listing.pop("skills")
    
    if listing.get("listing_type") == "job":
        listing["breadcrumb_category"] = "job"
        listing["listing_type"] = "service"

    if "whats_included" not in listing:
        listing["whats_included"] = []
    if "addons" not in listing:
        listing["addons"] = []
    if "delivery_days" not in listing:
        listing["delivery_days"] = 90
    if "sales" not in listing:
        listing["sales"] = 0

    # Filter listing payload to only include columns that exist in the listings table
    valid_cols = {
        "id", "title", "description", "price", "listing_type", "seller_id", 
        "created_at", "emoji", "sales", "category", "breadcrumb_category", 
        "about", "whats_included", "delivery_days", "addons", "images"
    }
    try:
        inspect_res = supabase.table("listings").select("*").limit(1).execute()
        if inspect_res.data:
            valid_cols = set(inspect_res.data[0].keys())
    except Exception as e:
        print("Failed to inspect listings columns:", e)

    listing = {k: v for k, v in listing.items() if k in valid_cols}

    result = supabase.table("listings").insert(listing).execute()
    if result.data:
        return [format_listing(item) for item in result.data]
    return result.data


# PUT update listing details
@router.put("/{listing_id}")
def update_listing(listing_id: str, update: dict):
    update.pop("id", None)
    
    if "skills" in update:
        update["whats_included"] = update.pop("skills")
        
    # Filter update payload to only include columns that exist in the listings table
    valid_cols = {
        "id", "title", "description", "price", "listing_type", "seller_id", 
        "created_at", "emoji", "sales", "category", "breadcrumb_category", 
        "about", "whats_included", "delivery_days", "addons", "images"
    }
    try:
        inspect_res = supabase.table("listings").select("*").limit(1).execute()
        if inspect_res.data:
            valid_cols = set(inspect_res.data[0].keys())
    except Exception as e:
        print("Failed to inspect listings columns:", e)

    update = {k: v for k, v in update.items() if k in valid_cols}

    result = supabase.table("listings")\
        .update(update)\
        .eq("id", listing_id)\
        .execute()
        
    if not result.data:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    return format_listing(result.data[0])