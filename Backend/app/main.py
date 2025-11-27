"""
Main FastAPI application.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

# Import from our modules
from app.auth import get_current_user
from app.database import engine, get_db, Base
from app.models import Invoice, User, Client
from app.schemas import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse,
    ClientCreate, ClientUpdate, ClientResponse
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title="Invoice API with Authentication",
    description="An Invoice management API with user authentication built with FastAPI and PostgreSQL",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173",
     "http://167.71.34.142",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes
from app.routers import auth
app.include_router(auth.router)


# ============= ROOT ENDPOINT =============

@app.get("/")
def root():
    """
    Root endpoint - API information.
    """
    return {
        "message": "Invoice API with Authentication is running",
        "docs": "/docs",
        "version": "2.0.0",
        "endpoints": {
            "auth": "/auth/register, /auth/token, /auth/me",
            "invoices": "/invoices"
        }
    }


# ============= INVOICE ENDPOINTS =============

@app.post(
    "/invoices",
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["invoices"]
)
def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new invoice for the current user."""
    # Check if invoice_number already exists for this user
    existing = db.query(Invoice).filter(
        Invoice.invoice_number == invoice.invoice_number,
        Invoice.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invoice with number '{invoice.invoice_number}' already exists"
        )
    
    # Create invoice with user_id set to current user
    invoice_data = invoice.model_dump()
    invoice_data["user_id"] = current_user.id
    db_invoice = Invoice(**invoice_data)
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice


@app.get(
    "/invoices",
    response_model=List[InvoiceResponse],
    tags=["invoices"]
)
def get_invoices(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all invoices for the current user with optional filtering by status."""
    # Filter by current user's invoices
    query = db.query(Invoice).filter(Invoice.user_id == current_user.id)
    if status is not None:
        if status not in ["draft", "sent", "paid", "overdue"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be one of: draft, sent, paid, overdue"
            )
        query = query.filter(Invoice.status == status)
    invoices = query.offset(skip).limit(limit).all()
    return invoices


@app.get(
    "/invoices/{invoice_id}",
    response_model=InvoiceResponse,
    tags=["invoices"]
)
def get_invoice(
    invoice_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single invoice by ID (only if it belongs to the current user)."""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found"
        )
    return invoice


@app.put(
    "/invoices/{invoice_id}",
    response_model=InvoiceResponse,
    tags=["invoices"]
)
def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing invoice (only if it belongs to the current user)."""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found"
        )
    
    # Check if invoice_number is being updated and if it already exists for this user
    update_data = invoice_update.model_dump(exclude_unset=True)
    if "invoice_number" in update_data:
        existing = db.query(Invoice).filter(
            Invoice.invoice_number == update_data["invoice_number"],
            Invoice.user_id == current_user.id,
            Invoice.id != invoice_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invoice with number '{update_data['invoice_number']}' already exists"
            )
    
    for field, value in update_data.items():
        setattr(invoice, field, value)
    
    db.commit()
    db.refresh(invoice)
    return invoice


@app.delete(
    "/invoices/{invoice_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["invoices"]
)
def delete_invoice(
    invoice_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an invoice (only if it belongs to the current user)."""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found"
        )
    
    db.delete(invoice)
    db.commit()
    return None


# ============= CLIENT ENDPOINTS =============

@app.post(
    "/clients",
    response_model=ClientResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["clients"]
)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new client for the current user."""
    client_data = client.model_dump()
    client_data["user_id"] = current_user.id
    db_client = Client(**client_data)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@app.get(
    "/clients",
    response_model=List[ClientResponse],
    tags=["clients"]
)
def get_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all clients for the current user."""
    clients = db.query(Client).filter(
        Client.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return clients


@app.get(
    "/clients/{client_id}",
    response_model=ClientResponse,
    tags=["clients"]
)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single client by ID (only if it belongs to the current user)."""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id
    ).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {client_id} not found"
        )
    return client


@app.put(
    "/clients/{client_id}",
    response_model=ClientResponse,
    tags=["clients"]
)
def update_client(
    client_id: int,
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing client (only if it belongs to the current user)."""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id
    ).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {client_id} not found"
        )
    
    update_data = client_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    return client


@app.delete(
    "/clients/{client_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["clients"]
)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a client (only if it belongs to the current user)."""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id
    ).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {client_id} not found"
        )
    
    db.delete(client)
    db.commit()
    return None