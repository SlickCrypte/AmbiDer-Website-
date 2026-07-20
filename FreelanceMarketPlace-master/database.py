import os
import httpx
from supabase import create_client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

httpx_client = httpx.Client(http2=False)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY, options=ClientOptions(httpx_client=httpx_client))