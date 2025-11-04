"""
Authentication utilities for JWT tokens and password hashing.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import TokenData

# ============= CONFIGURATION =============

# Secret key to sign JWT tokens
# In production, use a strong random string and store in environment variables
SECRET_KEY = "your-secret-key-keep-this-secret-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
# Uses bcrypt algorithm for secure password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# OAuth2 scheme for token-based authentication
# Tells FastAPI where to look for the token (in Authorization header)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# ============= PASSWORD FUNCTIONS =============

def hash_password(password: str) -> str:
    """
    Hash a plain text password.
    
    Example:
    plain = "mypassword123"
    hashed = hash_password(plain)
    # Returns: "$2b$12$..."
    
    This is ONE-WAY - you can't reverse it to get the original password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Example:
    plain = "mypassword123"
    hashed = "$2b$12$..."
    verify_password(plain, hashed)  # Returns True if match
    """
    return pwd_context.verify(plain_password, hashed_password)


# ============= JWT TOKEN FUNCTIONS =============

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a JWT access token.
    
    Args:
        data: Data to encode in the token (usually {"sub": email})
        expires_delta: How long until token expires
    
    Returns:
        Encoded JWT token string
    
    Example:
    token = create_access_token({"sub": "user@example.com"})
    # Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    """
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Encode the JWT token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> TokenData:
    """
    Verify and decode a JWT token.
    
    Args:
        token: The JWT token string
    
    Returns:
        TokenData with the decoded email
    
    Raises:
        HTTPException if token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            raise credentials_exception
        
        return TokenData(email=email)
    
    except JWTError:
        raise credentials_exception


# ============= USER AUTHENTICATION =============

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user with email and password.
    
    Args:
        db: Database session
        email: User's email
        password: Plain text password
    
    Returns:
        User object if authentication succeeds, None otherwise
    """
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return None
    
    # Verify password
    if not verify_password(password, user.hashed_password):
        return None
    
    return user


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated user from JWT token.
    
    This is a dependency that can be used in protected routes.
    
    Usage:
    @app.get("/protected")
    def protected_route(current_user: User = Depends(get_current_user)):
        return {"user": current_user.email}
    
    Args:
        token: JWT token from Authorization header
        db: Database session
    
    Returns:
        Current User object
    
    Raises:
        HTTPException if token is invalid or user not found
    """
    # Verify and decode token
    token_data = verify_token(token)
    
    # Get user from database
    user = db.query(User).filter(User.email == token_data.email).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Get current user and ensure they're active.
    
    Usage for routes that require active users only:
    @app.get("/admin")
    def admin_route(user: User = Depends(get_current_active_user)):
        return {"admin": user.email}
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user