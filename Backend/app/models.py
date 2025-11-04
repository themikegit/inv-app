from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from decimal import Decimal

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, nullable=False, index=True)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default="draft", nullable=False)  # draft, sent, paid, overdue
    description = Column(String, nullable=True)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship to User
    user = relationship("User", back_populates="invoices")
    
    def __repr__(self):
        return f"<Invoice(id={self.id}, invoice_number='{self.invoice_number}', customer_name='{self.customer_name}', amount={self.amount}, status='{self.status}')>"


class User(Base):
    """
    User database model for authentication.
    Stores user credentials and profile information.
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Email as username (must be unique)
    email = Column(String, unique=True, index=True, nullable=False)
    
    # Hashed password - NEVER store plain text passwords!
    hashed_password = Column(String, nullable=False)
    
    # Optional: User profile fields
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to Invoice
    invoices = relationship("Invoice", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"     