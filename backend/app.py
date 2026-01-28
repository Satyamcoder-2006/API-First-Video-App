import os
import re
from datetime import datetime, timedelta, timezone

import bcrypt
from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pymongo import MongoClient

load_dotenv()


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _utcnow():
    return datetime.now(timezone.utc)


def _json_error(message: str, status: int):
    return {"error": message}, status


def _require_fields(data: dict, fields: list[str]):
    for f in fields:
        if f not in data or (isinstance(data[f], str) and not data[f].strip()):
            return f
    return None


def _object_id(id_str: str):
    if not ObjectId.is_valid(id_str):
        return None
    return ObjectId(id_str)


def _hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    pw_hash = bcrypt.hashpw(password.encode("utf-8"), salt)
    return pw_hash.decode("utf-8")


def _check_password(password: str, pw_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), pw_hash.encode("utf-8"))
    except Exception:
        return False


def seed_videos(videos_col):
    # 5+ real YouTube IDs (well-known talks).
    seed = [
        {
            "title": "How to Start a Startup (Sam Altman)",
            "description": "Y Combinator's Sam Altman shares practical startup lessons.",
            "youtube_id": "CBYhVcO4WgI",
            "thumbnail_url": "https://img.youtube.com/vi/CBYhVcO4WgI/hqdefault.jpg",
            "is_active": True,
            "created_at": _utcnow(),
        },
        {
            "title": "Inside the Mind of a Master Procrastinator",
            "description": "A humorous TED talk that explains procrastination behavior.",
            "youtube_id": "arj7oStGLkU",
            "thumbnail_url": "https://img.youtube.com/vi/arj7oStGLkU/hqdefault.jpg",
            "is_active": True,
            "created_at": _utcnow(),
        },
        {
            "title": "The Future of Programming",
            "description": "Discussion on how software development is evolving.",
            "youtube_id": "8pTEmbeENF4",
            "thumbnail_url": "https://img.youtube.com/vi/8pTEmbeENF4/hqdefault.jpg",
            "is_active": True,
            "created_at": _utcnow(),
        },
        {
            "title": "How Great Leaders Inspire Action",
            "description": "Simon Sinek on starting with why and building belief.",
            "youtube_id": "qp0HIF3SfI4",
            "thumbnail_url": "https://img.youtube.com/vi/qp0HIF3SfI4/hqdefault.jpg",
            "is_active": True,
            "created_at": _utcnow(),
        },
        {
            "title": "The Surprising Habits of Original Thinkers",
            "description": "Adam Grant explores patterns among original thinkers.",
            "youtube_id": "fxbCHn6gE3U",
            "thumbnail_url": "https://img.youtube.com/vi/fxbCHn6gE3U/hqdefault.jpg",
            "is_active": True,
            "created_at": _utcnow(),
        },
        {
            "title": "Your Body Language May Shape Who You Are",
            "description": "Amy Cuddy on how power posing affects confidence.",
            "youtube_id": "Ks-_Mh1QhMc",
            "thumbnail_url": "https://img.youtube.com/vi/Ks-_Mh1QhMc/hqdefault.jpg",
            "is_active": True,
            "created_at": _utcnow(),
        },
        {
            "title": "The Power of Vulnerability",
            "description": "Brené Brown studies human connection and empathy.",
            "youtube_id": "iCvmsMzlF7o",
            "thumbnail_url": "https://img.youtube.com/vi/iCvmsMzlF7o/hqdefault.jpg",
            "is_active": True,
            "created_at": _utcnow(),
        },
    ]

    for item in seed:
        exists = videos_col.find_one({"youtube_id": item["youtube_id"]})
        if not exists:
            videos_col.insert_one(item)
        else:
            # Update thumbnail for existing videos to fix resolution issues
            videos_col.update_one(
                {"youtube_id": item["youtube_id"]},
                {"$set": {"thumbnail_url": item["thumbnail_url"]}}
            )


def create_app():
    app = Flask(__name__)

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-change-me")

    exp_hours = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", "24"))
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=exp_hours)

    cors_origins = os.getenv("CORS_ORIGINS", "*")
    origins = ["*"] if cors_origins.strip() == "*" else [o.strip() for o in cors_origins.split(",")]
    CORS(app, resources={r"/*": {"origins": origins}}, supports_credentials=False)

    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
    )

    jwt = JWTManager(app)

    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/video_app")
    mongo_db_name = os.getenv("MONGO_DB_NAME", "video_app")
    client = MongoClient(mongo_uri)
    # Atlas connection strings often omit a default DB; fall back to explicit name.
    try:
        db = client.get_default_database()
    except Exception:
        db = client[mongo_db_name]
    users = db["users"]
    videos_col = db["videos"]
    revoked_tokens = db["revoked_tokens"]

    users.create_index("email", unique=True)
    videos_col.create_index("is_active")
    revoked_tokens.create_index("jti", unique=True)

    seed_videos(videos_col)

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(_jwt_header, jwt_payload):
        jti = jwt_payload.get("jti")
        if not jti:
            return True
        return revoked_tokens.find_one({"jti": jti}) is not None

    @app.get("/health")
    def health():
        return {"status": "ok", "time": _utcnow().isoformat()}

    @app.post("/auth/signup")
    @limiter.limit("10 per hour")
    def signup():
        data = request.get_json(silent=True) or {}
        missing = _require_fields(data, ["name", "email", "password"])
        if missing:
            return _json_error(f"Missing field: {missing}", 400)

        name = data["name"].strip()
        email = data["email"].strip().lower()
        password = data["password"]

        if not EMAIL_RE.match(email):
            return _json_error("Invalid email format", 400)
        if len(password) < 8:
            return _json_error("Password must be at least 8 characters", 400)

        if users.find_one({"email": email}):
            return _json_error("Email already exists", 400)

        pw_hash = _hash_password(password)
        user_doc = {
            "name": name,
            "email": email,
            "password_hash": pw_hash,
            "created_at": _utcnow(),
        }
        inserted = users.insert_one(user_doc)
        token = create_access_token(identity=str(inserted.inserted_id))
        return {"message": "Success", "token": token}

    @app.post("/auth/login")
    @limiter.limit("10 per hour")
    def login():
        data = request.get_json(silent=True) or {}
        missing = _require_fields(data, ["email", "password"])
        if missing:
            return _json_error(f"Missing field: {missing}", 400)

        email = data["email"].strip().lower()
        password = data["password"]

        user = users.find_one({"email": email})
        if not user or not _check_password(password, user.get("password_hash", "")):
            return _json_error("Invalid email or password", 401)

        token = create_access_token(identity=str(user["_id"]))
        return {"message": "Success", "token": token}

    @app.get("/auth/me")
    @jwt_required()
    def me():
        user_id = get_jwt_identity()
        oid = _object_id(user_id)
        if not oid:
            return _json_error("Invalid token identity", 401)
        user = users.find_one({"_id": oid}, {"name": 1, "email": 1})
        if not user:
            return _json_error("User not found", 404)
        return {"name": user["name"], "email": user["email"]}

    @app.post("/auth/logout")
    @jwt_required()
    def logout():
        payload = get_jwt()
        jti = payload.get("jti")
        exp = payload.get("exp")
        if not jti or not exp:
            return _json_error("Invalid token", 400)
        # store token jti until expiration
        revoked_tokens.insert_one(
            {
                "jti": jti,
                "revoked_at": _utcnow(),
                "expires_at": datetime.fromtimestamp(exp, tz=timezone.utc),
            }
        )
        return {"message": "Logged out"}

    @app.get("/dashboard")
    @jwt_required()
    def dashboard():
        # Up to 10 active videos
        cursor = videos_col.find({"is_active": True}).sort("created_at", -1).limit(10)
        vids = list(cursor)
        return [
            {
                "id": str(v["_id"]),
                "title": v["title"],
                "description": v["description"],
                "thumbnail_url": v["thumbnail_url"],
            }
            for v in vids
        ]

    @app.get("/video/<video_id>/play")
    @jwt_required()
    def video_play(video_id):
        oid = _object_id(video_id)
        if not oid:
            return _json_error("Invalid video id", 400)
        video = videos_col.find_one({"_id": oid, "is_active": True})
        if not video:
            return _json_error("Video not found", 404)
        embed_url = f"https://www.youtube.com/embed/{video['youtube_id']}?enablejsapi=1"
        return {"embed_url": embed_url}

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)

