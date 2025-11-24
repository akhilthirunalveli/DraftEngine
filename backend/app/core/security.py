from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from .config import settings

from passlib.context import CryptContext

# Use Argon2 for hashing (strong and avoids bcrypt issues on Windows).
# Requires `argon2-cffi` to be installed.
ctx = CryptContext(schemes=["argon2"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_pwd(plain, hashed):
    return ctx.verify(plain, hashed)

def get_hash(pwd):
    return ctx.hash(pwd)