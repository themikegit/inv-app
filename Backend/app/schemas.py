from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, date
from typing import Optional
from decimal import Decimal

# ============= INVOICE SCHEMAS =============

class InvoiceBase(BaseModel):
    invoice_number: str = Field(..., min_length=1, max_length=100)
    customer_name: str = Field(..., min_length=1, max_length=200)
    customer_email: Optional[EmailStr] = None
    amount: Decimal = Field(..., gt=0)
    status: str = Field(default="draft", pattern="^(draft|sent|paid|overdue)$")
    description: Optional[str] = Field(None, max_length=1000)
    issue_date: date
    due_date: date

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    invoice_number: Optional[str] = Field(None, min_length=1, max_length=100)
    customer_name: Optional[str] = Field(None, min_length=1, max_length=200)
    customer_email: Optional[EmailStr] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    status: Optional[str] = Field(None, pattern="^(draft|sent|paid|overdue)$")
    description: Optional[str] = Field(None, max_length=1000)
    issue_date: Optional[date] = None
    due_date: Optional[date] = None

class InvoiceResponse(InvoiceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# ============= USER/AUTH SCHEMAS =============

class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    """Schema for returning user data."""
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Schema for data stored inside JWT token."""
    email: Optional[str] = None