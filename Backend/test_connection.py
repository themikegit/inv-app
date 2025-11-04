from sqlalchemy import create_engine, text

# Directly use your username - hardcoded for testing
DATABASE_URL = "postgresql://miroslavkrsmanovic@localhost:5432/todo_db"

print(f"Testing connection to: {DATABASE_URL}")
print("-" * 50)

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        version = result.fetchone()
        print("✅ Connection successful!")
        print(f"PostgreSQL version: {version[0]}")
        
        result = connection.execute(text("SELECT current_database();"))
        db = result.fetchone()
        print(f"Connected to database: {db[0]}")
        
except Exception as e:
    print("❌ Connection failed!")
    print(f"Error: {e}")
    print("\nTroubleshooting:")
    print("1. Is PostgreSQL running?")
    print("2. Is the username correct?")
    print("3. Does the database 'todo_db' exist?")