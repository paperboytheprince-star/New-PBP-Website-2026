from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'paperboy-prince-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Admin emails that have automatic admin access
ADMIN_EMAILS = os.environ.get('ADMIN_EMAILS', '').split(',')

app = FastAPI(title="Paperboy Prince Platform API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============ MODELS ============

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    is_admin: bool
    created_at: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    is_admin: Optional[bool] = None

# Post Models
class PostCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class PostResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    content: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    author_id: str
    author_name: str
    created_at: str
    updated_at: str

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None

# Product Models
class ProductCreate(BaseModel):
    title: str
    description: str
    price: float
    image_url: Optional[str] = None
    available: bool = False

class ProductResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    price: float
    image_url: Optional[str] = None
    available: bool
    created_at: str

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None

# Event Models
class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    location: str
    image_url: Optional[str] = None

class EventResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    date: str
    location: str
    image_url: Optional[str] = None
    rsvp_count: int
    created_at: str

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None

class RSVPResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    event_id: str
    user_id: str
    user_name: str
    user_email: str
    created_at: str

# Action Models
class ActionCreate(BaseModel):
    title: str
    description: str
    action_type: str  # volunteer, petition, pledge
    image_url: Optional[str] = None

class ActionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    action_type: str
    image_url: Optional[str] = None
    participant_count: int
    created_at: str

class ActionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    action_type: Optional[str] = None
    image_url: Optional[str] = None

class ActionParticipantResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    action_id: str
    user_id: str
    user_name: str
    user_email: str
    message: Optional[str] = None
    created_at: str

class ActionSignup(BaseModel):
    message: Optional[str] = None

# Notification Models
class NotifyEmailCreate(BaseModel):
    email: EmailStr

class NotifyEmailResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    created_at: str

# Cart Models
class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    product_id: str
    product_title: str
    product_price: float
    product_image: Optional[str] = None
    quantity: int

class CartResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    items: List[CartItemResponse]
    total: float

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, is_admin: bool) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    is_admin = user_data.email in ADMIN_EMAILS
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hash_password(user_data.password),
        "is_admin": is_admin,
        "created_at": now
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email, is_admin)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "is_admin": is_admin,
            "created_at": now
        }
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user["is_admin"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "is_admin": user["is_admin"],
            "created_at": user["created_at"]
        }
    }

@api_router.post("/auth/admin-login")
async def admin_login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    token = create_token(user["id"], user["email"], user["is_admin"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "is_admin": user["is_admin"],
            "created_at": user["created_at"]
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return user

# ============ POST ROUTES ============

@api_router.get("/posts", response_model=List[PostResponse])
async def get_posts():
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return posts

@api_router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: str):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@api_router.post("/posts", response_model=PostResponse)
async def create_post(post_data: PostCreate, user: dict = Depends(get_admin_user)):
    post_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    post_doc = {
        "id": post_id,
        "title": post_data.title,
        "content": post_data.content,
        "image_url": post_data.image_url,
        "video_url": post_data.video_url,
        "author_id": user["id"],
        "author_name": user["name"],
        "created_at": now,
        "updated_at": now
    }
    await db.posts.insert_one(post_doc)
    return post_doc

@api_router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(post_id: str, post_data: PostUpdate, user: dict = Depends(get_admin_user)):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = {k: v for k, v in post_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.posts.update_one({"id": post_id}, {"$set": update_data})
    updated = await db.posts.find_one({"id": post_id}, {"_id": 0})
    return updated

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user: dict = Depends(get_admin_user)):
    result = await db.posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted"}

# ============ PRODUCT ROUTES ============

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=ProductResponse)
async def create_product(product_data: ProductCreate, user: dict = Depends(get_admin_user)):
    product_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    product_doc = {
        "id": product_id,
        "title": product_data.title,
        "description": product_data.description,
        "price": product_data.price,
        "image_url": product_data.image_url,
        "available": product_data.available,
        "created_at": now
    }
    await db.products.insert_one(product_doc)
    return product_doc

@api_router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product_data: ProductUpdate, user: dict = Depends(get_admin_user)):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ============ EVENT ROUTES ============

@api_router.get("/events", response_model=List[EventResponse])
async def get_events():
    events = await db.events.find({}, {"_id": 0}).to_list(100)
    for event in events:
        rsvp_count = await db.rsvps.count_documents({"event_id": event["id"]})
        event["rsvp_count"] = rsvp_count
    return events

@api_router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    rsvp_count = await db.rsvps.count_documents({"event_id": event_id})
    event["rsvp_count"] = rsvp_count
    return event

@api_router.post("/events", response_model=EventResponse)
async def create_event(event_data: EventCreate, user: dict = Depends(get_admin_user)):
    event_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    event_doc = {
        "id": event_id,
        "title": event_data.title,
        "description": event_data.description,
        "date": event_data.date,
        "location": event_data.location,
        "image_url": event_data.image_url,
        "created_at": now
    }
    await db.events.insert_one(event_doc)
    event_doc["rsvp_count"] = 0
    return event_doc

@api_router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(event_id: str, event_data: EventUpdate, user: dict = Depends(get_admin_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = {k: v for k, v in event_data.model_dump().items() if v is not None}
    await db.events.update_one({"id": event_id}, {"$set": update_data})
    updated = await db.events.find_one({"id": event_id}, {"_id": 0})
    rsvp_count = await db.rsvps.count_documents({"event_id": event_id})
    updated["rsvp_count"] = rsvp_count
    return updated

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, user: dict = Depends(get_admin_user)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.rsvps.delete_many({"event_id": event_id})
    return {"message": "Event deleted"}

@api_router.post("/events/{event_id}/rsvp")
async def rsvp_event(event_id: str, user: dict = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    existing = await db.rsvps.find_one({"event_id": event_id, "user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already RSVPed")
    
    rsvp_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    rsvp_doc = {
        "id": rsvp_id,
        "event_id": event_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "user_email": user["email"],
        "created_at": now
    }
    await db.rsvps.insert_one(rsvp_doc)
    return {"message": "RSVP confirmed", "rsvp_id": rsvp_id}

@api_router.delete("/events/{event_id}/rsvp")
async def cancel_rsvp(event_id: str, user: dict = Depends(get_current_user)):
    result = await db.rsvps.delete_one({"event_id": event_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="RSVP not found")
    return {"message": "RSVP cancelled"}

@api_router.get("/events/{event_id}/rsvps", response_model=List[RSVPResponse])
async def get_event_rsvps(event_id: str, user: dict = Depends(get_admin_user)):
    rsvps = await db.rsvps.find({"event_id": event_id}, {"_id": 0}).to_list(1000)
    return rsvps

@api_router.get("/my-rsvps")
async def get_my_rsvps(user: dict = Depends(get_current_user)):
    rsvps = await db.rsvps.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    event_ids = [r["event_id"] for r in rsvps]
    return {"event_ids": event_ids}

# ============ ACTION ROUTES ============

@api_router.get("/actions", response_model=List[ActionResponse])
async def get_actions():
    actions = await db.actions.find({}, {"_id": 0}).to_list(100)
    for action in actions:
        count = await db.action_participants.count_documents({"action_id": action["id"]})
        action["participant_count"] = count
    return actions

@api_router.get("/actions/{action_id}", response_model=ActionResponse)
async def get_action(action_id: str):
    action = await db.actions.find_one({"id": action_id}, {"_id": 0})
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    count = await db.action_participants.count_documents({"action_id": action_id})
    action["participant_count"] = count
    return action

@api_router.post("/actions", response_model=ActionResponse)
async def create_action(action_data: ActionCreate, user: dict = Depends(get_admin_user)):
    action_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    action_doc = {
        "id": action_id,
        "title": action_data.title,
        "description": action_data.description,
        "action_type": action_data.action_type,
        "image_url": action_data.image_url,
        "created_at": now
    }
    await db.actions.insert_one(action_doc)
    action_doc["participant_count"] = 0
    return action_doc

@api_router.put("/actions/{action_id}", response_model=ActionResponse)
async def update_action(action_id: str, action_data: ActionUpdate, user: dict = Depends(get_admin_user)):
    action = await db.actions.find_one({"id": action_id})
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    update_data = {k: v for k, v in action_data.model_dump().items() if v is not None}
    await db.actions.update_one({"id": action_id}, {"$set": update_data})
    updated = await db.actions.find_one({"id": action_id}, {"_id": 0})
    count = await db.action_participants.count_documents({"action_id": action_id})
    updated["participant_count"] = count
    return updated

@api_router.delete("/actions/{action_id}")
async def delete_action(action_id: str, user: dict = Depends(get_admin_user)):
    result = await db.actions.delete_one({"id": action_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Action not found")
    await db.action_participants.delete_many({"action_id": action_id})
    return {"message": "Action deleted"}

@api_router.post("/actions/{action_id}/signup")
async def signup_action(action_id: str, signup_data: ActionSignup, user: dict = Depends(get_current_user)):
    action = await db.actions.find_one({"id": action_id})
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    existing = await db.action_participants.find_one({"action_id": action_id, "user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already signed up")
    
    participant_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    participant_doc = {
        "id": participant_id,
        "action_id": action_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "user_email": user["email"],
        "message": signup_data.message,
        "created_at": now
    }
    await db.action_participants.insert_one(participant_doc)
    return {"message": "Signup confirmed", "participant_id": participant_id}

@api_router.delete("/actions/{action_id}/signup")
async def cancel_signup(action_id: str, user: dict = Depends(get_current_user)):
    result = await db.action_participants.delete_one({"action_id": action_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Signup not found")
    return {"message": "Signup cancelled"}

@api_router.get("/actions/{action_id}/participants", response_model=List[ActionParticipantResponse])
async def get_action_participants(action_id: str, user: dict = Depends(get_admin_user)):
    participants = await db.action_participants.find({"action_id": action_id}, {"_id": 0}).to_list(1000)
    return participants

@api_router.get("/my-signups")
async def get_my_signups(user: dict = Depends(get_current_user)):
    signups = await db.action_participants.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    action_ids = [s["action_id"] for s in signups]
    return {"action_ids": action_ids}

# ============ CART ROUTES ============

@api_router.get("/cart", response_model=CartResponse)
async def get_cart(user: dict = Depends(get_current_user)):
    cart_items = await db.cart_items.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    items = []
    total = 0.0
    
    for item in cart_items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            cart_item = {
                "id": item["id"],
                "product_id": item["product_id"],
                "product_title": product["title"],
                "product_price": product["price"],
                "product_image": product.get("image_url"),
                "quantity": item["quantity"]
            }
            items.append(cart_item)
            total += product["price"] * item["quantity"]
    
    return {"items": items, "total": round(total, 2)}

@api_router.post("/cart/add")
async def add_to_cart(item_data: CartItemAdd, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": item_data.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    existing = await db.cart_items.find_one({"user_id": user["id"], "product_id": item_data.product_id})
    if existing:
        new_quantity = existing["quantity"] + item_data.quantity
        await db.cart_items.update_one(
            {"id": existing["id"]},
            {"$set": {"quantity": new_quantity}}
        )
        return {"message": "Cart updated", "quantity": new_quantity}
    
    cart_item_id = str(uuid.uuid4())
    cart_doc = {
        "id": cart_item_id,
        "user_id": user["id"],
        "product_id": item_data.product_id,
        "quantity": item_data.quantity
    }
    await db.cart_items.insert_one(cart_doc)
    return {"message": "Added to cart", "cart_item_id": cart_item_id}

@api_router.put("/cart/{cart_item_id}")
async def update_cart_item(cart_item_id: str, quantity: int, user: dict = Depends(get_current_user)):
    if quantity <= 0:
        result = await db.cart_items.delete_one({"id": cart_item_id, "user_id": user["id"]})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Cart item not found")
        return {"message": "Item removed from cart"}
    
    result = await db.cart_items.update_one(
        {"id": cart_item_id, "user_id": user["id"]},
        {"$set": {"quantity": quantity}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Cart updated"}

@api_router.delete("/cart/{cart_item_id}")
async def remove_from_cart(cart_item_id: str, user: dict = Depends(get_current_user)):
    result = await db.cart_items.delete_one({"id": cart_item_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed from cart"}

@api_router.delete("/cart")
async def clear_cart(user: dict = Depends(get_current_user)):
    await db.cart_items.delete_many({"user_id": user["id"]})
    return {"message": "Cart cleared"}

# ============ NOTIFY ME ROUTES ============

@api_router.post("/notify", response_model=NotifyEmailResponse)
async def subscribe_notify(data: NotifyEmailCreate):
    """Subscribe to shop launch notifications"""
    existing = await db.notify_emails.find_one({"email": data.email})
    if existing:
        return {"id": existing["id"], "email": existing["email"], "created_at": existing["created_at"]}
    
    notify_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    notify_doc = {
        "id": notify_id,
        "email": data.email,
        "created_at": now
    }
    await db.notify_emails.insert_one(notify_doc)
    return notify_doc

@api_router.get("/notify/subscribers", response_model=List[NotifyEmailResponse])
async def get_notify_subscribers(user: dict = Depends(get_admin_user)):
    """Get all notify me subscribers (admin only)"""
    subscribers = await db.notify_emails.find({}, {"_id": 0}).to_list(10000)
    return subscribers

@api_router.delete("/notify/{email}")
async def unsubscribe_notify(email: str, user: dict = Depends(get_admin_user)):
    """Remove a subscriber (admin only)"""
    result = await db.notify_emails.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Email not found")
    return {"message": "Unsubscribed successfully"}

# ============ ADMIN STATS ============

@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(get_admin_user)):
    users_count = await db.users.count_documents({})
    posts_count = await db.posts.count_documents({})
    products_count = await db.products.count_documents({})
    events_count = await db.events.count_documents({})
    actions_count = await db.actions.count_documents({})
    rsvps_count = await db.rsvps.count_documents({})
    signups_count = await db.action_participants.count_documents({})
    notify_count = await db.notify_emails.count_documents({})
    
    return {
        "users": users_count,
        "posts": posts_count,
        "products": products_count,
        "events": events_count,
        "actions": actions_count,
        "rsvps": rsvps_count,
        "action_signups": signups_count,
        "notify_subscribers": notify_count
    }

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(user: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}")
async def update_user_admin(user_id: str, user_data: UserUpdate, admin: dict = Depends(get_admin_user)):
    target_user = await db.users.find_one({"id": user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {k: v for k, v in user_data.model_dump().items() if v is not None}
    await db.users.update_one({"id": user_id}, {"$set": update_data})
    return {"message": "User updated"}

# ============ SEED DATA ============

@api_router.post("/seed")
async def seed_data():
    """Seed initial demo data"""
    # Check if already seeded
    existing_posts = await db.posts.count_documents({})
    if existing_posts > 0:
        return {"message": "Data already seeded"}
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Create demo admin
    admin_id = str(uuid.uuid4())
    admin_doc = {
        "id": admin_id,
        "email": "admin@paperboyprince.com",
        "name": "Paperboy Prince",
        "password_hash": hash_password("admin123"),
        "is_admin": True,
        "created_at": now
    }
    await db.users.insert_one(admin_doc)
    
    # Seed Posts
    posts = [
        {
            "id": str(uuid.uuid4()),
            "title": "Welcome to the Love Revolution!",
            "content": "Hey beautiful people! Welcome to our new platform. This is where we come together, share ideas, and build the future we want to see. Let's spread love, positivity, and make real change happen! 💖",
            "image_url": "https://images.unsplash.com/photo-1682447450943-c5785c84d047?w=800",
            "video_url": None,
            "author_id": admin_id,
            "author_name": "Paperboy Prince",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Community Garden Project Launch",
            "content": "We're transforming empty lots into community gardens! Join us this weekend as we break ground on our newest project in Brooklyn. Fresh food, fresh air, fresh vibes. Everyone is welcome!",
            "image_url": "https://images.unsplash.com/photo-1728706613021-e447801e1ea6?w=800",
            "video_url": None,
            "author_id": admin_id,
            "author_name": "Paperboy Prince",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Art is Activism",
            "content": "Every piece of art we create tells a story. Every mural we paint sends a message. Art isn't just decoration - it's revolution. Keep creating, keep expressing, keep fighting for what matters.",
            "image_url": "https://images.unsplash.com/photo-1763168573987-5c3130015401?w=800",
            "video_url": None,
            "author_id": admin_id,
            "author_name": "Paperboy Prince",
            "created_at": now,
            "updated_at": now
        }
    ]
    await db.posts.insert_many(posts)
    
    # Seed Products
    products = [
        {
            "id": str(uuid.uuid4()),
            "title": "Love Revolution Hoodie",
            "description": "Spread the love everywhere you go with our signature pink hoodie. Made with organic cotton and printed with eco-friendly inks.",
            "price": 65.00,
            "image_url": "https://images.unsplash.com/photo-1630269470859-f950f36b54ce?w=800",
            "available": False,
            "created_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Paperboy Prince T-Shirt",
            "description": "Classic tee featuring the iconic Paperboy Prince logo. Available in multiple colors. 100% organic cotton.",
            "price": 35.00,
            "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
            "available": False,
            "created_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Movement Cap",
            "description": "Rep the movement with this embroidered cap. One size fits all, adjustable strap.",
            "price": 28.00,
            "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800",
            "available": False,
            "created_at": now
        }
    ]
    await db.products.insert_many(products)
    
    # Seed Events
    events = [
        {
            "id": str(uuid.uuid4()),
            "title": "Community Town Hall",
            "description": "Join us for our monthly town hall where we discuss local issues, share updates on our projects, and plan for the future. Everyone's voice matters!",
            "date": "2025-02-15T18:00:00",
            "location": "Brooklyn Community Center, 123 Main St",
            "image_url": "https://images.unsplash.com/photo-1759605034474-b143695762c5?w=800",
            "created_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Street Art Festival",
            "description": "A celebration of street art and culture! Live performances, murals being painted, food vendors, and good vibes all around.",
            "date": "2025-03-01T12:00:00",
            "location": "Bushwick Open Studios, Brooklyn",
            "image_url": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
            "created_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Youth Leadership Workshop",
            "description": "Empowering the next generation of leaders. This workshop covers public speaking, community organizing, and how to make your voice heard.",
            "date": "2025-02-22T14:00:00",
            "location": "The People's House, 456 Unity Ave",
            "image_url": "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800",
            "created_at": now
        }
    ]
    await db.events.insert_many(events)
    
    # Seed Actions
    actions = [
        {
            "id": str(uuid.uuid4()),
            "title": "Volunteer: Community Clean-Up",
            "description": "Help us keep our neighborhoods beautiful! Sign up to volunteer for our weekly community clean-up events. All supplies provided.",
            "action_type": "volunteer",
            "image_url": "https://images.unsplash.com/photo-1618477462146-050d2767ebd4?w=800",
            "created_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Petition: Fund Youth Programs",
            "description": "Sign our petition to increase funding for youth arts and education programs in our community. Every signature counts!",
            "action_type": "petition",
            "image_url": "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800",
            "created_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Pledge: Spread Love Daily",
            "description": "Take the pledge to perform one act of kindness every day. Small actions create big change. Join the love revolution!",
            "action_type": "pledge",
            "image_url": "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800",
            "created_at": now
        }
    ]
    await db.actions.insert_many(actions)
    
    return {"message": "Demo data seeded successfully", "admin_email": "admin@paperboyprince.com", "admin_password": "admin123"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
