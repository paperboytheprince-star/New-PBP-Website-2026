from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File
from fastapi import status as http_status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
import hashlib
import traceback
import shutil
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from collections import defaultdict
import time
from PIL import Image
import io

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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

# Upload configuration
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_DIMENSION = 1600  # Max width/height after resize
DEFAULT_POST_IMAGE = "/default-post.jpg"  # Relative to frontend public

app = FastAPI(title="Paperboy Prince Platform API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ============ REQUEST LOGGING MIDDLEWARE ============
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()
    
    # Log request
    logger.info(f"[{request_id}] {request.method} {request.url.path} - Started")
    
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        logger.info(f"[{request_id}] {request.method} {request.url.path} - {response.status_code} ({duration:.3f}s)")
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"[{request_id}] {request.method} {request.url.path} - ERROR: {str(e)} ({duration:.3f}s)")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "request_id": request_id,
            },
            headers={"X-Request-ID": request_id}
        )

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

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class PasswordResetRequest(BaseModel):
    token: str
    new_password: str

class AdminUserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    is_admin: bool
    created_at: str
    last_login_at: Optional[str] = None
    user_status: str = "active"

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    action: str
    admin_id: str
    admin_email: str
    target_user_id: Optional[str] = None
    target_email: Optional[str] = None
    details: Optional[str] = None
    timestamp: str
    outcome: str

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
    status: str = "approved"  # pending, approved, rejected
    rejection_reason: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: str
    updated_at: str

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class PostModeration(BaseModel):
    action: str  # approve, reject
    rejection_reason: Optional[str] = None

# Profile Models
class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    display_name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: bool
    created_at: str
    updated_at: Optional[str] = None

# Notification Models
class NotificationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    recipient_admin_id: str
    notification_type: str  # new_post, new_action
    entity_type: str  # post, action
    entity_id: str
    message: str
    created_at: str
    read_at: Optional[str] = None

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
    location: Optional[str] = None
    action_url: Optional[str] = None
    action_date: Optional[str] = None

class ActionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    action_type: str
    image_url: Optional[str] = None
    location: Optional[str] = None
    action_url: Optional[str] = None
    action_date: Optional[str] = None
    author_id: Optional[str] = None
    author_name: Optional[str] = None
    status: str = "approved"  # pending, approved, rejected
    rejection_reason: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    participant_count: int = 0
    created_at: str

class ActionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    action_type: Optional[str] = None
    image_url: Optional[str] = None
    location: Optional[str] = None
    action_url: Optional[str] = None
    action_date: Optional[str] = None

class ActionModeration(BaseModel):
    action: str  # approve, reject
    rejection_reason: Optional[str] = None

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

# ============ RATE LIMITING ============
rate_limit_store = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 5  # max reset requests per window

def check_rate_limit(key: str) -> bool:
    """Check if action is rate limited. Returns True if allowed, False if blocked."""
    now = time.time()
    # Clean old entries
    rate_limit_store[key] = [t for t in rate_limit_store[key] if now - t < RATE_LIMIT_WINDOW]
    if len(rate_limit_store[key]) >= RATE_LIMIT_MAX_REQUESTS:
        return False
    rate_limit_store[key].append(now)
    return True

# ============ RESET TOKEN HELPERS ============
RESET_TOKEN_EXPIRY_MINUTES = 60

def generate_reset_token() -> tuple[str, str]:
    """Generate a reset token and its hash. Returns (plain_token, hashed_token)"""
    plain_token = secrets.token_urlsafe(32)
    hashed_token = hashlib.sha256(plain_token.encode()).hexdigest()
    return plain_token, hashed_token

def hash_reset_token(token: str) -> str:
    """Hash a reset token for comparison"""
    return hashlib.sha256(token.encode()).hexdigest()

async def create_audit_log(action: str, admin_id: str, admin_email: str, 
                           target_user_id: str = None, target_email: str = None,
                           details: str = None, outcome: str = "success"):
    """Create an audit log entry"""
    log_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    log_doc = {
        "id": log_id,
        "action": action,
        "admin_id": admin_id,
        "admin_email": admin_email,
        "target_user_id": target_user_id,
        "target_email": target_email,
        "details": details,
        "timestamp": now,
        "outcome": outcome
    }
    await db.audit_logs.insert_one(log_doc)
    return log_doc

def validate_password(password: str) -> tuple[bool, str]:
    """Validate password meets security requirements"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False, "Password must contain at least one special character"
    return True, ""

# ============ NOTIFICATION HELPERS ============

async def create_admin_notifications(entity_type: str, entity_id: str, entity_title: str, author_name: str):
    """Create in-app notifications for all admins when content is submitted"""
    admins = await db.users.find({"is_admin": True}, {"_id": 0, "id": 1, "email": 1}).to_list(100)
    now = datetime.now(timezone.utc).isoformat()
    
    for admin in admins:
        notification_doc = {
            "id": str(uuid.uuid4()),
            "recipient_admin_id": admin["id"],
            "notification_type": f"new_{entity_type}",
            "entity_type": entity_type,
            "entity_id": entity_id,
            "message": f"New {entity_type} '{entity_title}' submitted by {author_name} awaiting review",
            "created_at": now,
            "read_at": None
        }
        await db.notifications.insert_one(notification_doc)
    
    return len(admins)

async def log_email_attempt(to_email: str, template_type: str, entity_type: str, entity_id: str, 
                           email_status: str, error: str = None):
    """Log email delivery attempts for debugging"""
    log_doc = {
        "id": str(uuid.uuid4()),
        "to_email": to_email,
        "template_type": template_type,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "status": email_status,
        "error": error,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.email_logs.insert_one(log_doc)
    return log_doc

async def send_admin_notification_emails(entity_type: str, entity_id: str, entity_title: str, author_name: str):
    """Send email notifications to all admins (logs attempt since email not configured)"""
    admins = await db.users.find({"is_admin": True}, {"_id": 0, "id": 1, "email": 1}).to_list(100)
    
    for admin in admins:
        # Log the email attempt (email provider not configured)
        await log_email_attempt(
            to_email=admin["email"],
            template_type="pending_content_notification",
            entity_type=entity_type,
            entity_id=entity_id,
            email_status="skipped",
            error="Email provider not configured - notification logged for future delivery"
        )
    
    return len(admins)

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
    
    # Update last login timestamp
    now = datetime.now(timezone.utc).isoformat()
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_login_at": now}})
    
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

@api_router.post("/auth/change-password")
async def change_password(password_data: PasswordChange, user: dict = Depends(get_current_user)):
    """Change password for authenticated user"""
    # Get current user from database
    db_user = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(password_data.current_password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    # Validate new password
    if len(password_data.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    
    # Update password
    new_hash = hash_password(password_data.new_password)
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"message": "Password changed successfully"}

@api_router.post("/auth/reset-password")
async def reset_password_with_token(reset_data: PasswordResetRequest):
    """Reset password using a one-time token (public endpoint)"""
    # Rate limit by token to prevent brute force
    if not check_rate_limit(f"reset:{reset_data.token[:8]}"):
        raise HTTPException(status_code=429, detail="Too many attempts. Please wait before trying again.")
    
    # Hash the provided token to compare with stored hash
    token_hash = hash_reset_token(reset_data.token)
    
    # Find the reset token
    reset_doc = await db.password_resets.find_one({"token_hash": token_hash}, {"_id": 0})
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check if token is expired
    expiry = datetime.fromisoformat(reset_doc["expires_at"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expiry:
        # Clean up expired token
        await db.password_resets.delete_one({"token_hash": token_hash})
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Check if token was already used
    if reset_doc.get("used"):
        raise HTTPException(status_code=400, detail="Reset token has already been used")
    
    # Validate new password
    is_valid, error_msg = validate_password(reset_data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Update user password
    new_hash = hash_password(reset_data.new_password)
    result = await db.users.update_one(
        {"id": reset_doc["user_id"]},
        {"$set": {"password_hash": new_hash}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Invalidate the token
    await db.password_resets.update_one(
        {"token_hash": token_hash},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Password reset successfully. You can now log in with your new password."}

# ============ POST ROUTES ============

@api_router.get("/posts", response_model=List[PostResponse])
async def get_posts():
    """Get all approved posts (public)"""
    posts = await db.posts.find({"status": "approved"}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return posts

@api_router.get("/posts/pending", response_model=List[PostResponse])
async def get_pending_posts(user: dict = Depends(get_admin_user)):
    """Get all pending posts for admin review"""
    posts = await db.posts.find({"status": "pending"}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return posts

@api_router.get("/posts/my", response_model=List[PostResponse])
async def get_my_posts(user: dict = Depends(get_current_user)):
    """Get current user's posts (all statuses)"""
    posts = await db.posts.find({"author_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return posts

@api_router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: str):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@api_router.post("/posts", response_model=PostResponse)
async def create_post(post_data: PostCreate, user: dict = Depends(get_current_user)):
    """Create a new post (users: pending status, admins: approved)"""
    post_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Admins' posts are auto-approved, regular users' posts are pending
    post_status = "approved" if user.get("is_admin") else "pending"
    
    post_doc = {
        "id": post_id,
        "title": post_data.title,
        "content": post_data.content,
        "image_url": post_data.image_url,
        "video_url": post_data.video_url,
        "author_id": user["id"],
        "author_name": user["name"],
        "status": post_status,
        "rejection_reason": None,
        "reviewed_by": user["id"] if user.get("is_admin") else None,
        "reviewed_at": now if user.get("is_admin") else None,
        "created_at": now,
        "updated_at": now
    }
    await db.posts.insert_one(post_doc)
    
    # If pending, notify admins
    if post_status == "pending":
        await create_admin_notifications("post", post_id, post_data.title, user["name"])
        await send_admin_notification_emails("post", post_id, post_data.title, user["name"])
    
    return post_doc

@api_router.post("/posts/{post_id}/moderate")
async def moderate_post(post_id: str, moderation: PostModeration, user: dict = Depends(get_admin_user)):
    """Approve or reject a post (admin only)"""
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    now = datetime.now(timezone.utc).isoformat()
    
    if moderation.action == "approve":
        new_status = "approved"
    elif moderation.action == "reject":
        new_status = "rejected"
        if not moderation.rejection_reason:
            raise HTTPException(status_code=400, detail="Rejection reason required")
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'")
    
    update_data = {
        "status": new_status,
        "reviewed_by": user["id"],
        "reviewed_at": now,
        "updated_at": now
    }
    if moderation.rejection_reason:
        update_data["rejection_reason"] = moderation.rejection_reason
    
    await db.posts.update_one({"id": post_id}, {"$set": update_data})
    
    # Create audit log
    await create_audit_log(
        action=f"post_{moderation.action}",
        admin_id=user["id"],
        admin_email=user["email"],
        target_user_id=post.get("author_id"),
        details=f"Post '{post['title']}' {moderation.action}d" + (f": {moderation.rejection_reason}" if moderation.rejection_reason else ""),
        outcome="success"
    )
    
    updated = await db.posts.find_one({"id": post_id}, {"_id": 0})
    return updated

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
    """Get all approved actions (public)"""
    actions = await db.actions.find({"status": "approved"}, {"_id": 0}).to_list(100)
    for action in actions:
        count = await db.action_participants.count_documents({"action_id": action["id"]})
        action["participant_count"] = count
    return actions

@api_router.get("/actions/pending", response_model=List[ActionResponse])
async def get_pending_actions(user: dict = Depends(get_admin_user)):
    """Get all pending actions for admin review"""
    actions = await db.actions.find({"status": "pending"}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for action in actions:
        count = await db.action_participants.count_documents({"action_id": action["id"]})
        action["participant_count"] = count
    return actions

@api_router.get("/actions/my", response_model=List[ActionResponse])
async def get_my_actions(user: dict = Depends(get_current_user)):
    """Get current user's actions (all statuses)"""
    actions = await db.actions.find({"author_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
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
async def create_action(action_data: ActionCreate, user: dict = Depends(get_current_user)):
    """Create a new action (users: pending status, admins: approved)"""
    action_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Admins' actions are auto-approved, regular users' actions are pending
    action_status = "approved" if user.get("is_admin") else "pending"
    
    action_doc = {
        "id": action_id,
        "title": action_data.title,
        "description": action_data.description,
        "action_type": action_data.action_type,
        "image_url": action_data.image_url,
        "location": action_data.location,
        "action_url": action_data.action_url,
        "action_date": action_data.action_date,
        "author_id": user["id"],
        "author_name": user["name"],
        "status": action_status,
        "rejection_reason": None,
        "reviewed_by": user["id"] if user.get("is_admin") else None,
        "reviewed_at": now if user.get("is_admin") else None,
        "created_at": now
    }
    await db.actions.insert_one(action_doc)
    
    # If pending, notify admins
    if action_status == "pending":
        await create_admin_notifications("action", action_id, action_data.title, user["name"])
        await send_admin_notification_emails("action", action_id, action_data.title, user["name"])
    
    action_doc["participant_count"] = 0
    return action_doc

@api_router.post("/actions/{action_id}/moderate")
async def moderate_action(action_id: str, moderation: ActionModeration, user: dict = Depends(get_admin_user)):
    """Approve or reject an action (admin only)"""
    action = await db.actions.find_one({"id": action_id}, {"_id": 0})
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    now = datetime.now(timezone.utc).isoformat()
    
    if moderation.action == "approve":
        new_status = "approved"
    elif moderation.action == "reject":
        new_status = "rejected"
        if not moderation.rejection_reason:
            raise HTTPException(status_code=400, detail="Rejection reason required")
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'")
    
    update_data = {
        "status": new_status,
        "reviewed_by": user["id"],
        "reviewed_at": now
    }
    if moderation.rejection_reason:
        update_data["rejection_reason"] = moderation.rejection_reason
    
    await db.actions.update_one({"id": action_id}, {"$set": update_data})
    
    # Create audit log
    await create_audit_log(
        action=f"action_{moderation.action}",
        admin_id=user["id"],
        admin_email=user["email"],
        target_user_id=action.get("author_id"),
        details=f"Action '{action['title']}' {moderation.action}d" + (f": {moderation.rejection_reason}" if moderation.rejection_reason else ""),
        outcome="success"
    )
    
    updated = await db.actions.find_one({"id": action_id}, {"_id": 0})
    count = await db.action_participants.count_documents({"action_id": action_id})
    updated["participant_count"] = count
    return updated

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

# ============ PROFILE ROUTES ============

@api_router.get("/profile/{user_id}", response_model=ProfileResponse)
async def get_user_profile(user_id: str):
    """Get a user's profile (public)"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = await db.profiles.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "user_id": user["id"],
        "email": user["email"],
        "display_name": profile.get("display_name") if profile else user.get("name"),
        "username": profile.get("username") if profile else None,
        "bio": profile.get("bio") if profile else None,
        "avatar_url": profile.get("avatar_url") if profile else None,
        "is_admin": user.get("is_admin", False),
        "created_at": user["created_at"],
        "updated_at": profile.get("updated_at") if profile else None
    }

@api_router.get("/profile", response_model=ProfileResponse)
async def get_my_profile(user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    return await get_user_profile(user["id"])

@api_router.put("/profile", response_model=ProfileResponse)
async def update_my_profile(profile_data: ProfileUpdate, user: dict = Depends(get_current_user)):
    """Update current user's profile"""
    now = datetime.now(timezone.utc).isoformat()
    
    profile = await db.profiles.find_one({"user_id": user["id"]})
    
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    update_data["updated_at"] = now
    
    if profile:
        await db.profiles.update_one({"user_id": user["id"]}, {"$set": update_data})
    else:
        update_data["user_id"] = user["id"]
        await db.profiles.insert_one(update_data)
    
    return await get_user_profile(user["id"])

# ============ NOTIFICATION ROUTES ============

@api_router.get("/notifications")
async def get_my_notifications(user: dict = Depends(get_admin_user)):
    """Get notifications for admin user"""
    notifications = await db.notifications.find(
        {"recipient_admin_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return notifications

@api_router.get("/notifications/unread-count")
async def get_unread_notification_count(user: dict = Depends(get_admin_user)):
    """Get count of unread notifications"""
    count = await db.notifications.count_documents({
        "recipient_admin_id": user["id"],
        "read_at": None
    })
    return {"unread_count": count}

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: dict = Depends(get_admin_user)):
    """Mark a notification as read"""
    now = datetime.now(timezone.utc).isoformat()
    result = await db.notifications.update_one(
        {"id": notification_id, "recipient_admin_id": user["id"]},
        {"$set": {"read_at": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@api_router.post("/notifications/read-all")
async def mark_all_notifications_read(user: dict = Depends(get_admin_user)):
    """Mark all notifications as read"""
    now = datetime.now(timezone.utc).isoformat()
    await db.notifications.update_many(
        {"recipient_admin_id": user["id"], "read_at": None},
        {"$set": {"read_at": now}}
    )
    return {"message": "All notifications marked as read"}

# ============ HEALTH CHECK ============

@api_router.get("/health")
async def health_check():
    """Health check endpoint - returns API and database status"""
    try:
        # Check database connectivity
        await db.command("ping")
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "api": "ok",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/debug/auth-status")
async def get_auth_status(user: dict = Depends(get_admin_user)):
    """Debug endpoint for auth status (admin only)"""
    # Get pending counts
    pending_posts = await db.posts.count_documents({"status": "pending"})
    pending_actions = await db.actions.count_documents({"status": "pending"})
    unread_notifications = await db.notifications.count_documents({
        "recipient_admin_id": user["id"],
        "read_at": None
    })
    
    return {
        "user_id": user["id"],
        "email": user["email"],
        "role": "admin" if user.get("is_admin") else "user",
        "pending_posts": pending_posts,
        "pending_actions": pending_actions,
        "unread_notifications": unread_notifications,
        "api_health": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    return {"message": "Unsubscribed successfully"}

# ============ ADMIN STATS ============

@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(get_admin_user)):
    users_count = await db.users.count_documents({})
    posts_count = await db.posts.count_documents({})
    pending_posts = await db.posts.count_documents({"status": "pending"})
    products_count = await db.products.count_documents({})
    events_count = await db.events.count_documents({})
    actions_count = await db.actions.count_documents({})
    pending_actions = await db.actions.count_documents({"status": "pending"})
    rsvps_count = await db.rsvps.count_documents({})
    signups_count = await db.action_participants.count_documents({})
    notify_count = await db.notify_emails.count_documents({})
    
    return {
        "users": users_count,
        "posts": posts_count,
        "pending_posts": pending_posts,
        "products": products_count,
        "events": events_count,
        "actions": actions_count,
        "pending_actions": pending_actions,
        "rsvps": rsvps_count,
        "action_signups": signups_count,
        "notify_subscribers": notify_count
    }

@api_router.get("/admin/users")
async def get_all_users(
    user: dict = Depends(get_admin_user),
    search: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc"
):
    """Get all users with search and sorting (admin only)"""
    query = {}
    if search:
        query["email"] = {"$regex": search, "$options": "i"}
    
    sort_direction = -1 if sort_order == "desc" else 1
    valid_sort_fields = ["email", "name", "created_at", "last_login_at", "is_admin"]
    if sort_by not in valid_sort_fields:
        sort_by = "created_at"
    
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).sort(sort_by, sort_direction).to_list(1000)
    
    # Add status field to each user
    for u in users:
        u["status"] = "active"  # Could be extended to track suspended/inactive users
        if "last_login_at" not in u:
            u["last_login_at"] = None
    
    return users

@api_router.post("/admin/users/{user_id}/reset-password")
async def admin_reset_user_password(user_id: str, admin: dict = Depends(get_admin_user), request: Request = None):
    """Generate a password reset link for a user (admin only)"""
    # Rate limit
    if not check_rate_limit(f"admin_reset:{admin['id']}"):
        await create_audit_log(
            action="password_reset_request",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_user_id=user_id,
            details="Rate limited",
            outcome="blocked"
        )
        raise HTTPException(status_code=429, detail="Too many reset requests. Please wait before trying again.")
    
    # Find target user
    target_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate reset token
    plain_token, hashed_token = generate_reset_token()
    expiry = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)
    
    # Delete any existing reset tokens for this user
    await db.password_resets.delete_many({"user_id": user_id})
    
    # Store hashed token
    reset_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "user_email": target_user["email"],
        "token_hash": hashed_token,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expiry.isoformat(),
        "created_by_admin_id": admin["id"],
        "created_by_admin_email": admin["email"],
        "used": False
    }
    await db.password_resets.insert_one(reset_doc)
    
    # Create audit log
    await create_audit_log(
        action="password_reset_request",
        admin_id=admin["id"],
        admin_email=admin["email"],
        target_user_id=user_id,
        target_email=target_user["email"],
        details=f"Reset link generated, expires at {expiry.isoformat()}",
        outcome="success"
    )
    
    # Since email is not configured, return the reset link
    # In production, you would send this via email instead
    reset_link = f"/reset-password?token={plain_token}"
    
    return {
        "message": "Password reset link generated",
        "reset_link": reset_link,
        "expires_at": expiry.isoformat(),
        "user_email": target_user["email"],
        "note": "Email sending not configured. Share this one-time link securely with the user."
    }

@api_router.get("/admin/audit-logs")
async def get_audit_logs(
    admin: dict = Depends(get_admin_user),
    action: Optional[str] = None,
    limit: int = 100
):
    """Get audit logs (admin only)"""
    query = {}
    if action:
        query["action"] = action
    
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return logs

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
    """Seed initial admin user only - no demo posts/events for production"""
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": "admin@paperboyprince.com"})
    if existing_admin:
        return {"message": "Admin already exists"}
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Create admin user only
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
    
    return {"message": "Admin user created", "admin_email": "admin@paperboyprince.com"}

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
