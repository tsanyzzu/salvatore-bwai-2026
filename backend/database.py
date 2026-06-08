import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    print("WARNING: DATABASE_URL not found in environment, falling back to local SQLite for development.")
    DATABASE_URL = "sqlite:///./mikroboost_local.db"
elif DATABASE_URL.startswith("http://") or DATABASE_URL.startswith("https://"):
    print(f"ERROR: Invalid DATABASE_URL schema. Expected a database connection string (e.g. postgresql://...), but got an HTTP URL: {DATABASE_URL}")
    print("WARNING: Falling back to local SQLite for development until this is fixed.")
    DATABASE_URL = "sqlite:///./mikroboost_local.db"

# Ensure postgresql:// schema is used for SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
