import urllib.request
import json

LIVE_URL = "https://freelancemarketplace-backend.onrender.com"

try:
    print("Testing live /listings/ ...")
    with urllib.request.urlopen(f"{LIVE_URL}/listings/") as res:
        data = json.loads(res.read().decode())
        print(f"Success! Fetched {len(data)} listings from Render.")
except Exception as e:
    print("Error on live listings:", e)

try:
    print("Testing live /users/ ...")
    with urllib.request.urlopen(f"{LIVE_URL}/users/") as res:
        data = json.loads(res.read().decode())
        print(f"Success! Fetched {len(data)} users from Render.")
except Exception as e:
    print("Error on live users:", e)
