from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import listings, orders, reviews, messages, users

app = FastAPI(title="Marketplace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    listings.router,
    prefix="/listings",
    tags=["Listings"]
)

app.include_router(
    orders.router,
    prefix="/orders",
    tags=["Orders"]
)

app.include_router(
    reviews.router,
    prefix="/reviews",
    tags=["Reviews"]
)

app.include_router(
    messages.router,
    prefix="/messages",
    tags=["Messages"]
)

app.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
)


@app.get("/")
def root():
    return {"message": "Marketplace API is running!"}