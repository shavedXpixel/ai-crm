# backend/database.py
from sqlmodel import SQLModel, create_engine, Session

# This creates a file named "crm.db" in your backend folder
sqlite_file_name = "crm.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# check_same_thread=False is needed for SQLite with FastAPI
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    """Creates the tables if they don't exist."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Helper to get a database session."""
    with Session(engine) as session:
        yield session