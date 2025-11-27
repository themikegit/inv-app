"""
Script to populate the database with random test invoices.
Run this script to generate sample data for testing.
"""

import random
from datetime import datetime, timedelta, date
from decimal import Decimal
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import Invoice, User

# Sample invoice data
CUSTOMER_NAMES = [
    "Acme Corporation",
    "Tech Solutions Inc",
    "Global Services Ltd",
    "Digital Innovations",
    "Mega Industries",
    "Premier Consulting",
    "Advanced Systems",
    "Enterprise Solutions",
    "Innovative Technologies",
    "Professional Services Group",
    "Creative Agency Co",
    "Business Partners LLC",
    "Strategic Solutions",
    "Market Leaders Inc",
    "Prime Services",
    "Elite Consultants",
    "Top Tier Industries",
    "Excellence Corp",
    "Premium Services",
    "Leading Technologies"
]

CUSTOMER_EMAILS = [
    "billing@acmecorp.com",
    "finance@techsolutions.com",
    "accounts@globalservices.com",
    "invoice@digitalinnov.com",
    "payments@megaindustries.com",
    "billing@premierconsult.com",
    "finance@advancedsys.com",
    "accounts@enterprisesol.com",
    "invoice@innovatetech.com",
    "payments@proservices.com",
    "billing@creativeagency.com",
    "finance@bizpartners.com",
    "accounts@strategicsol.com",
    "invoice@marketleaders.com",
    "payments@primeservices.com"
]

INVOICE_DESCRIPTIONS = [
    "Web development services",
    "Consulting services",
    "Software licensing",
    "Maintenance and support",
    "Cloud hosting services",
    "Marketing services",
    "Design services",
    "Training services",
    "Equipment rental",
    "Professional services",
    "Monthly subscription",
    "Project implementation",
    "Custom development",
    "Support and maintenance",
    "Integration services"
]

INVOICE_STATUSES = ["draft", "sent", "paid", "overdue"]

def create_sample_invoices(count: int = 50, user_email: str = None) -> None:
    """Create random sample invoices in the database for a specific user."""
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Get or create a user for the invoices
        if user_email:
            user = db.query(User).filter(User.email == user_email).first()
            if not user:
                print(f"❌ User with email '{user_email}' not found!")
                print("Please create a user first or use an existing user's email.")
                return
        else:
            # Get the first user, or create a test user
            user = db.query(User).first()
            if not user:
                print("No users found. Creating a test user...")
                from app.auth import hash_password
                user = User(
                    email="test@example.com",
                    hashed_password=hash_password("testpassword123"),
                    full_name="Test User"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"✅ Created test user: {user.email} (password: testpassword123)")
        
        print(f"Using user: {user.email} (ID: {user.id})")
        
        # Clear existing invoices for this user (optional - remove this if you want to keep existing data)
        db.query(Invoice).filter(Invoice.user_id == user.id).delete()
        db.commit()
        print(f"Cleared existing invoices for user {user.email}.")
        
        # Generate random invoices
        invoices_to_create = []
        invoice_number_base = 1000
        
        for i in range(count):
            # Generate unique invoice number per user
            invoice_number = f"INV-{invoice_number_base + i:06d}"
            
            # Random customer data
            customer_name = random.choice(CUSTOMER_NAMES)
            customer_email = random.choice(CUSTOMER_EMAILS) if random.random() < 0.8 else None
            
            # Random amount between $50 and $10000
            amount = Decimal(str(round(random.uniform(50.0, 10000.0), 2)))
            
            # Random status (weighted: 20% draft, 30% sent, 40% paid, 10% overdue)
            rand = random.random()
            if rand < 0.2:
                status = "draft"
            elif rand < 0.5:
                status = "sent"
            elif rand < 0.9:
                status = "paid"
            else:
                status = "overdue"
            
            # Random description
            description = random.choice(INVOICE_DESCRIPTIONS)
            
            # Random dates
            # Issue date: within last 60 days
            days_ago_issue = random.randint(0, 60)
            issue_date = date.today() - timedelta(days=days_ago_issue)
            
            # Due date: 15-45 days after issue date
            days_until_due = random.randint(15, 45)
            due_date = issue_date + timedelta(days=days_until_due)
            
            # Create invoice object with user_id
            invoice = Invoice(
                invoice_number=invoice_number,
                customer_name=customer_name,
                customer_email=customer_email,
                amount=amount,
                status=status,
                description=description,
                issue_date=issue_date,
                due_date=due_date,
                user_id=user.id
            )
            
            invoices_to_create.append(invoice)
        
        # Bulk insert invoices
        db.add_all(invoices_to_create)
        db.commit()
        
        print(f"✅ Successfully created {count} random invoices for user {user.email}!")
        
        # Show some statistics for this user's invoices
        user_invoices = db.query(Invoice).filter(Invoice.user_id == user.id).all()
        total_invoices = len(user_invoices)
        draft_invoices = sum(1 for inv in user_invoices if inv.status == "draft")
        sent_invoices = sum(1 for inv in user_invoices if inv.status == "sent")
        paid_invoices = sum(1 for inv in user_invoices if inv.status == "paid")
        overdue_invoices = sum(1 for inv in user_invoices if inv.status == "overdue")
        
        total_value = sum(inv.amount for inv in user_invoices)
        
        print(f"📊 Statistics for user {user.email}:")
        print(f"   Total invoices: {total_invoices}")
        print(f"   Draft: {draft_invoices}")
        print(f"   Sent: {sent_invoices}")
        print(f"   Paid: {paid_invoices}")
        print(f"   Overdue: {overdue_invoices}")
        print(f"   Total value: ${total_value:,.2f}")
        
    except Exception as e:
        print(f"❌ Error creating invoices: {e}")
        db.rollback()
    finally:
        db.close()

def show_sample_invoices(limit: int = 10, user_email: str = None) -> None:
    """Display sample invoices from the database."""
    
    db = SessionLocal()
    
    try:
        query = db.query(Invoice)
        
        if user_email:
            user = db.query(User).filter(User.email == user_email).first()
            if user:
                query = query.filter(Invoice.user_id == user.id)
                print(f"\n📄 Sample invoices for user {user_email}:")
            else:
                print(f"❌ User {user_email} not found!")
                return
        else:
            print(f"\n📄 Sample invoices (all users):")
        
        invoices = query.limit(limit).all()
        total_count = query.count()
        
        print(f"Showing {len(invoices)} of {total_count} total:")
        print("-" * 100)
        
        for invoice in invoices:
            status_emoji = {
                "draft": "📝",
                "sent": "📤",
                "paid": "✅",
                "overdue": "⚠️"
            }.get(invoice.status, "📄")
            
            print(f"{status_emoji} [{invoice.id}] {invoice.invoice_number} - {invoice.customer_name}")
            print(f"    Amount: ${invoice.amount:,.2f} | Status: {invoice.status.upper()}")
            print(f"    Issue: {invoice.issue_date} | Due: {invoice.due_date}")
            if invoice.description:
                print(f"    Description: {invoice.description}")
            print()
            
    except Exception as e:
        print(f"❌ Error retrieving invoices: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    
    print("🚀 Invoice Database Populator")
    print("=" * 50)
    
    # Check if user email is provided as command line argument
    user_email = sys.argv[1] if len(sys.argv) > 1 else None
    
    if user_email:
        print(f"Creating invoices for user: {user_email}")
    else:
        print("No user email provided. Will use first available user or create a test user.")
    
    # Create sample invoices
    create_sample_invoices(count=50, user_email=user_email)
    
    # Show sample results
    show_sample_invoices(limit=10, user_email=user_email)
    
    print("\n🎉 Database population complete!")
    print("You can now test your API endpoints with this sample data.")
    print("\nTip: You can specify a user email as an argument:")
    print("  python auto_script.py user@example.com")