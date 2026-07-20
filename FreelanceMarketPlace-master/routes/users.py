from fastapi import APIRouter, HTTPException
from database import supabase
from postgrest.exceptions import APIError
import hashlib
import os
import httpx
from datetime import datetime, timezone, timedelta
from collections import Counter


router = APIRouter()

SALT = "adfreelancin_secret_salt_123"

VALID_ACCOUNT_TYPES = {"client", "seller_only", "freelancer_seller"}
DEFAULT_ACCOUNT_TYPE = "freelancer_seller"

def validate_account_type(account_type: str) -> str:
    if account_type not in VALID_ACCOUNT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid account_type. Must be one of: {', '.join(sorted(VALID_ACCOUNT_TYPES))}",
        )
    return account_type

def hash_password(password: str) -> str:
    return hashlib.sha256((password + SALT).encode()).hexdigest()

VALID_CATEGORIES = {
    "Design",
    "Development",
    "Data Analyst",
    "Writing & Translation",
    "DevOps",
    "Accounting & Finance",
    "Sales & Marketing",
    "Human Resources",
    "Legal & Compliance",
    "Operations & Management",
}

def validate_category(category: str) -> str:
    categories = [c.strip() for c in category.split(",")]
    for cat in categories:
        if cat not in VALID_CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category '{cat}'. Must be one of: {', '.join(sorted(VALID_CATEGORIES))}",
            )
    return category

def format_user(user: dict) -> dict:
    if not user:
        return user
    email = user.get("email")
    if email and ":" in email:
        user["email"] = email.split(":")[0]
    return user

# GET freelancer profiles for Find Talent (seller-only users are excluded)
@router.get("/")
def get_all_users(category: str = None):
    query = supabase.table("profiles")\
        .select("*")\
        .or_(f"account_type.eq.{DEFAULT_ACCOUNT_TYPE},account_type.is.null,enabled_roles.cs.{{freelancer_seller}}")
    
    if category and category != "All Categories":
        query = query.eq("category", category)
        
    result = query.execute()
    # Filter out users whose profiles are not completed (must have bio and location)
    completed_users = [
        format_user(u) for u in result.data 
        if u.get("bio") and u.get("bio").strip() and u.get("location") and u.get("location").strip()
    ]
    return completed_users

def parse_datetime_utc(dt_str: str):
    if not dt_str:
        return None
    try:
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    except Exception:
        return None

def calculate_user_stats(user: dict) -> dict:
    user_id = user.get("id")
    if not user_id:
        return user

    # 1. Fetch all orders for this user as seller
    try:
        orders_res = supabase.table("orders").select("*").eq("seller_id", user_id).execute()
        orders = orders_res.data or []
    except Exception:
        orders = []

    # 2. Fetch all reviews for this user as seller
    try:
        reviews_res = supabase.table("reviews").select("*").eq("freelancer_id", user_id).execute()
        reviews_list = reviews_res.data or []
    except Exception:
        reviews_list = []

    # 3. Fetch all messages involving the user to calculate response time
    try:
        messages_res = supabase.table("messages").select("*")\
            .or_(f"sender_id.eq.{user_id},receiver_id.eq.{user_id}")\
            .execute()
        messages = messages_res.data or []
    except Exception:
        messages = []

    # A. Completion Rate
    completed_orders = [o for o in orders if o.get("status", "").lower() == "completed"]
    declined_orders = [o for o in orders if o.get("status", "").lower() == "declined"]
    total_closed = len(completed_orders) + len(declined_orders)
    completion_rate = int((len(completed_orders) / total_closed) * 100) if total_closed > 0 else 100
    user["completion_rate"] = completion_rate

    # B. On-time Delivery
    reviews_map = {r["order_id"]: r["created_at"] for r in reviews_list if r.get("order_id")}
    on_time_count = 0
    total_delivery_counted = 0
    
    for o in completed_orders:
        due_date_str = o.get("due_date")
        if not due_date_str:
            on_time_count += 1
            total_delivery_counted += 1
            continue
        
        due_date = parse_datetime_utc(due_date_str)
        if not due_date:
            created_at_str = o.get("created_at")
            if created_at_str:
                created_at = parse_datetime_utc(created_at_str)
                if created_at:
                    if '3 months' in due_date_str.lower() or '90' in due_date_str.lower():
                        due_date = created_at + timedelta(days=90)
                    else:
                        due_date = created_at + timedelta(days=30)
        
        if not due_date:
            on_time_count += 1
            total_delivery_counted += 1
            continue

        completion_date_str = reviews_map.get(o["id"])
        if completion_date_str:
            completion_date = parse_datetime_utc(completion_date_str)
            if completion_date:
                if completion_date <= due_date:
                    on_time_count += 1
            else:
                on_time_count += 1
        else:
            on_time_count += 1
        total_delivery_counted += 1

    # Check overdue in-progress orders
    in_progress_orders = [o for o in orders if o.get("status", "").lower() in ("in progress", "applied")]
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    late_in_progress = 0
    for o in in_progress_orders:
        due_date_str = o.get("due_date")
        if due_date_str:
            due_date = parse_datetime_utc(due_date_str)
            if not due_date:
                created_at_str = o.get("created_at")
                if created_at_str:
                    created_at = parse_datetime_utc(created_at_str)
                    if created_at:
                        if '3 months' in due_date_str.lower() or '90' in due_date_str.lower():
                            due_date = created_at + timedelta(days=90)
                        else:
                            due_date = created_at + timedelta(days=30)
            if due_date and now > due_date:
                late_in_progress += 1

    total_delivery_counted += late_in_progress
    on_time_delivery_rate = int((on_time_count / total_delivery_counted) * 100) if total_delivery_counted > 0 else 100
    user["on_time_delivery"] = on_time_delivery_rate

    # C. Repeat Clients
    completed_buyers = [o["buyer_id"] for o in completed_orders if o.get("buyer_id")]
    buyer_counts = Counter(completed_buyers)
    unique_buyers = len(buyer_counts)
    repeat_buyers = sum(1 for buyer, count in buyer_counts.items() if count >= 2)
    repeat_clients_rate = int((repeat_buyers / unique_buyers) * 100) if unique_buyers > 0 else 0
    user["repeat_clients"] = repeat_clients_rate

    # D. Response Time
    response_times = []
    client_conversations = {}
    for msg in messages:
        sender = msg.get("sender_id")
        receiver = msg.get("receiver_id")
        if not sender or not receiver:
            continue
        other_id = sender if receiver == user_id else receiver
        if other_id not in client_conversations:
            client_conversations[other_id] = []
        client_conversations[other_id].append(msg)

    for other_id, msgs in client_conversations.items():
        sorted_msgs = sorted(msgs, key=lambda x: x.get("created_at") or "")
        last_client_time = None
        for msg in sorted_msgs:
            is_client = msg["sender_id"] == other_id
            created_at_str = msg.get("created_at")
            if not created_at_str:
                continue
            msg_time = parse_datetime_utc(created_at_str)
            if not msg_time:
                continue

            if is_client:
                if last_client_time is None:
                    last_client_time = msg_time
            else:
                if last_client_time is not None:
                    diff = (msg_time - last_client_time).total_seconds() / 3600.0
                    response_times.append(diff)
                    last_client_time = None

    if response_times:
        avg_hours = sum(response_times) / len(response_times)
        if avg_hours <= 1:
            user["response_time"] = "< 1 hour"
        elif avg_hours <= 2:
            user["response_time"] = "Under 2 hrs"
        elif avg_hours <= 24:
            user["response_time"] = "Within 24 hrs"
        else:
            user["response_time"] = "Few days"
    else:
        user["response_time"] = "Under 2 hrs"

    # E. Member Since
    created_at_str = user.get("created_at")
    if created_at_str:
        try:
            created_date = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            user["member_since"] = created_date.strftime("%b %Y")
        except Exception:
            pass

    return user


# GET user profile by ID
@router.get("/{user_id}")
def get_user(user_id: str):
    result = supabase.table("profiles")\
        .select("*")\
        .eq("id", user_id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    user = format_user(result.data[0])
    return calculate_user_stats(user)

# POST create new user profile
@router.post("/")
def create_user(user: dict):
    password = user.pop("password", None)
    user.pop("is_profile_setup", None) # Remove schema mismatch field

    account_type = user.pop("account_type", None) or DEFAULT_ACCOUNT_TYPE
    validated_type = validate_account_type(account_type)
    user["account_type"] = validated_type
    
    if "category" in user and user["category"]:
        user["category"] = validate_category(user["category"])
    
    # Initialize multi-role system columns
    user["enabled_roles"] = [validated_type]
    user["active_role"] = validated_type

    email = user.get("email")
    if password and email:
        hashed = hash_password(password)
        user["email"] = f"{email}:{hashed}"
        
    try:
        result = supabase.table("profiles").insert(user).execute()
        if result.data:
            return format_user(result.data[0])
        return result.data
    except APIError as e:
        if e.code == "23505":
            raise HTTPException(status_code=400, detail="An account with this email address already exists.")
        raise HTTPException(status_code=400, detail=e.message)

# POST login user securely
@router.post("/login")
def login_user(credentials: dict):
    email = credentials.get("email", "").strip().lower()
    password = credentials.get("password", "")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
        
    # Search database for a user where the email column starts with "email:"
    result = supabase.table("profiles")\
        .select("*")\
        .ilike("email", f"{email}:%")\
        .execute()
        
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    user = result.data[0]
    db_email = user.get("email", "")
    if ":" not in db_email:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    # Verify the password hash
    _, db_hash = db_email.split(":", 1)
    if hash_password(password) != db_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    return {"status": "success", "profile": format_user(user)}

# PUT update user profile details
@router.put("/{user_id}")
def update_user(user_id: str, update: dict):
    # Do not allow modifying email or id via update
    update.pop("email", None)
    update.pop("id", None)

    if "account_type" in update:
        update["account_type"] = validate_account_type(update["account_type"])
    
    if "category" in update and update["category"]:
        update["category"] = validate_category(update["category"])
    
    # Filter update payload to only include columns that exist in the profiles table
    try:
        inspect_res = supabase.table("profiles").select("*").limit(1).execute()
        if inspect_res.data:
            valid_cols = set(inspect_res.data[0].keys())
            update = {k: v for k, v in update.items() if k in valid_cols}
    except Exception as e:
        print("Failed to inspect profiles columns:", e)
    
    result = supabase.table("profiles")\
        .update(update)\
        .eq("id", user_id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    return format_user(result.data[0])


LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "")
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"


@router.post("/linkedin")
async def linkedin_auth(payload: dict):
    code = payload.get("code")
    redirect_uri = payload.get("redirect_uri")
    verify_user_id = payload.get("verify_user_id")

    if not code or not redirect_uri:
        raise HTTPException(status_code=400, detail="Missing code or redirect_uri")

    if not LINKEDIN_CLIENT_ID or not LINKEDIN_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="LinkedIn OAuth is not configured on the server.")

    # 1. Exchange auth code for token
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            LINKEDIN_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": LINKEDIN_CLIENT_ID,
                "client_secret": LINKEDIN_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if token_resp.status_code != 200:
        error_detail = token_resp.json() if token_resp.headers.get("content-type", "").startswith("application/json") else token_resp.text
        raise HTTPException(status_code=401, detail=f"LinkedIn token exchange failed: {error_detail}")

    access_token = token_resp.json().get("access_token")

    # 2. Fetch user profile
    async with httpx.AsyncClient() as client:
        profile_resp = await client.get(
            LINKEDIN_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if profile_resp.status_code != 200:
        error_detail = profile_resp.json() if profile_resp.headers.get("content-type", "").startswith("application/json") else profile_resp.text
        raise HTTPException(status_code=502, detail=f"Failed to fetch LinkedIn profile: {error_detail}")

    li_profile = profile_resp.json()
    li_sub = li_profile.get("sub")
    li_email = li_profile.get("email", "").strip().lower()
    li_name = li_profile.get("name", "")

    if not li_email:
        raise HTTPException(status_code=400, detail="LinkedIn did not provide an email address.")

    # 3a. Verification-only flow
    if verify_user_id:
        result = supabase.table("profiles").update({"linkedin_id": li_sub, "is_verified": True}).eq("id", verify_user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        return {"profile": format_user(result.data[0]), "is_new_user": False}

    # 3b. Auth flow: Search by LinkedIn ID
    existing = supabase.table("profiles").select("*").eq("linkedin_id", li_sub).execute()
    if existing.data:
        result = supabase.table("profiles").update({"is_verified": True}).eq("id", existing.data[0]["id"]).execute()
        return {"profile": format_user(result.data[0]), "is_new_user": False}

    # Search by email (handles plain email for other OAuth providers or password-hashed emails)
    email_match = supabase.table("profiles").select("*").or_(f"email.eq.{li_email},email.ilike.{li_email}:%").execute()
    if email_match.data:
        user = email_match.data[0]
        result = supabase.table("profiles").update({"linkedin_id": li_sub, "is_verified": True}).eq("id", user["id"]).execute()
        return {"profile": format_user(result.data[0]), "is_new_user": False}

    # 3c. Create new user
    initials = "".join(w[0] for w in li_name.split() if w).upper() or "LI"
    new_user = {
        "full_name": li_name or li_email.split("@")[0],
        "email": li_email,
        "linkedin_id": li_sub,
        "is_verified": True,
        "role": "Freelancer",
        "account_type": "freelancer_seller",
        "enabled_roles": ["freelancer_seller"],
        "active_role": "freelancer_seller",
        "hourly_rate": 2000,
        "skills": [],
        "initials": initials[:2],
        "avatar_bg": "#1B2A41",
    }
    result = supabase.table("profiles").insert(new_user).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user profile")
    return {"profile": format_user(result.data[0]), "is_new_user": True}


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USERINFO_URL = "https://api.github.com/user"


@router.post("/google")
async def google_auth(payload: dict):
    code = payload.get("code")
    redirect_uri = payload.get("redirect_uri")

    if not code or not redirect_uri:
        raise HTTPException(status_code=400, detail="Missing code or redirect_uri")

    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured on the server.")

    # 1. Exchange auth code for token
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
    
    if token_resp.status_code != 200:
        error_detail = token_resp.json() if token_resp.headers.get("content-type", "").startswith("application/json") else token_resp.text
        raise HTTPException(status_code=401, detail=f"Google token exchange failed: {error_detail}")

    access_token = token_resp.json().get("access_token")

    # 2. Fetch user profile info
    async with httpx.AsyncClient() as client:
        profile_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
    if profile_resp.status_code != 200:
        error_detail = profile_resp.json() if profile_resp.headers.get("content-type", "").startswith("application/json") else profile_resp.text
        raise HTTPException(status_code=502, detail=f"Failed to fetch Google profile: {error_detail}")

    g_profile = profile_resp.json()
    g_sub = g_profile.get("sub")
    g_email = g_profile.get("email", "").strip().lower()
    g_name = g_profile.get("name", "")
    g_picture = g_profile.get("picture", "")

    if not g_email:
        raise HTTPException(status_code=400, detail="Google did not provide an email address.")

    # 3. Check existing by Google ID
    existing = supabase.table("profiles").select("*").eq("google_id", g_sub).execute()
    if existing.data:
        user = existing.data[0]
        # Keep avatar_url synced if not set
        if not user.get("avatar_url") and g_picture:
            supabase.table("profiles").update({"avatar_url": g_picture}).eq("id", user["id"]).execute()
            user["avatar_url"] = g_picture
        return {"profile": format_user(user), "is_new_user": False}

    # Check existing by email (handles plain email for other OAuth providers or password-hashed emails)
    email_match = supabase.table("profiles").select("*").or_(f"email.eq.{g_email},email.ilike.{g_email}:%").execute()
    if email_match.data:
        user = email_match.data[0]
        update_data = {"google_id": g_sub}
        if not user.get("avatar_url") and g_picture:
            update_data["avatar_url"] = g_picture
        result = supabase.table("profiles").update(update_data).eq("id", user["id"]).execute()
        return {"profile": format_user(result.data[0]), "is_new_user": False}

    # Create new profile
    initials = "".join(w[0] for w in g_name.split() if w).upper() or "G"
    new_user = {
        "full_name": g_name or g_email.split("@")[0],
        "email": g_email,
        "google_id": g_sub,
        "role": "Freelancer",
        "account_type": "freelancer_seller",
        "enabled_roles": ["freelancer_seller"],
        "active_role": "freelancer_seller",
        "hourly_rate": 2000,
        "skills": [],
        "initials": initials[:2],
        "avatar_bg": "#1B2A41",
    }
    if g_picture:
        new_user["avatar_url"] = g_picture

    result = supabase.table("profiles").insert(new_user).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user profile")
    return {"profile": format_user(result.data[0]), "is_new_user": True}


@router.post("/github")
async def github_auth(payload: dict):
    code = payload.get("code")
    redirect_uri = payload.get("redirect_uri")

    if not code or not redirect_uri:
        raise HTTPException(status_code=400, detail="Missing code or redirect_uri")

    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="GitHub OAuth is not configured on the server.")

    # 1. Exchange auth code for token
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"}
        )

    if token_resp.status_code != 200:
        error_detail = token_resp.json() if token_resp.headers.get("content-type", "").startswith("application/json") else token_resp.text
        raise HTTPException(status_code=401, detail=f"GitHub token exchange failed: {error_detail}")

    access_token = token_resp.json().get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail=f"GitHub token exchange did not return access_token")

    # 2. Fetch user profile from GitHub
    async with httpx.AsyncClient() as client:
        profile_resp = await client.get(
            GITHUB_USERINFO_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "User-Agent": "FreelanceMarketPlace"
            }
        )

    if profile_resp.status_code != 200:
        error_detail = profile_resp.json() if profile_resp.headers.get("content-type", "").startswith("application/json") else profile_resp.text
        raise HTTPException(status_code=502, detail=f"Failed to fetch GitHub profile: {error_detail}")

    gh_profile = profile_resp.json()
    gh_id = str(gh_profile.get("id"))
    gh_email = gh_profile.get("email")
    gh_name = gh_profile.get("name") or gh_profile.get("login", "")
    gh_avatar = gh_profile.get("avatar_url", "")

    # If email is private, fetch public/private emails from email API endpoint
    if not gh_email:
        try:
            async with httpx.AsyncClient() as client:
                email_resp = await client.get(
                    "https://api.github.com/user/emails",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "User-Agent": "FreelanceMarketPlace"
                    }
                )
            if email_resp.status_code == 200:
                emails_list = email_resp.json()
                # Find primary email, or verified email, or first email
                primary = next((e.get("email") for e in emails_list if e.get("primary")), None)
                if not primary:
                    primary = next((e.get("email") for e in emails_list if e.get("verified")), None)
                if not primary and emails_list:
                    primary = emails_list[0].get("email")
                if primary:
                    gh_email = primary
        except Exception:
            pass

    # If still no email, construct a safe fallback
    if not gh_email:
        gh_email = f"{gh_profile.get('login', 'github-user')}@github.com"

    gh_email = gh_email.strip().lower()

    # 3. Check existing by GitHub ID
    existing = supabase.table("profiles").select("*").eq("github_id", gh_id).execute()
    if existing.data:
        user = existing.data[0]
        # Keep avatar_url synced if not set
        if not user.get("avatar_url") and gh_avatar:
            supabase.table("profiles").update({"avatar_url": gh_avatar}).eq("id", user["id"]).execute()
            user["avatar_url"] = gh_avatar
        return {"profile": format_user(user), "is_new_user": False}

    # Check existing by email (handles plain email for other OAuth providers or password-hashed emails)
    email_match = supabase.table("profiles").select("*").or_(f"email.eq.{gh_email},email.ilike.{gh_email}:%").execute()
    if email_match.data:
        user = email_match.data[0]
        update_data = {"github_id": gh_id}
        if not user.get("avatar_url") and gh_avatar:
            update_data["avatar_url"] = gh_avatar
        result = supabase.table("profiles").update(update_data).eq("id", user["id"]).execute()
        return {"profile": format_user(result.data[0]), "is_new_user": False}

    # Create new profile
    initials = "".join(w[0] for w in gh_name.split() if w).upper() or "GH"
    new_user = {
        "full_name": gh_name,
        "email": gh_email,
        "github_id": gh_id,
        "role": "Freelancer",
        "account_type": "freelancer_seller",
        "enabled_roles": ["freelancer_seller"],
        "active_role": "freelancer_seller",
        "hourly_rate": 2000,
        "skills": [],
        "initials": initials[:2],
        "avatar_bg": "#1B2A41",
    }
    if gh_avatar:
        new_user["avatar_url"] = gh_avatar

    result = supabase.table("profiles").insert(new_user).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user profile")
    return {"profile": format_user(result.data[0]), "is_new_user": True}

