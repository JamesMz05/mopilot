"""Shared test fixtures for the Ideenplattform test suite."""

import os
import tempfile

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Override env vars before importing app modules
_upload_dir = tempfile.mkdtemp()
os.environ["UPLOAD_DIR"] = _upload_dir
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET"] = "test-secret"

# In-memory SQLite engine for tests (must be created BEFORE importing app)
_test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_test_engine)

# Monkey-patch the database module to use the test engine
import app.database as _db_module  # noqa: E402

_db_module.engine = _test_engine
_db_module.SessionLocal = _TestingSessionLocal

# Now import main (which imports engine/SessionLocal from database)
# and patch its module-level references too
import app.main as _main_module  # noqa: E402

_main_module.engine = _test_engine
_main_module.SessionLocal = _TestingSessionLocal

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import (  # noqa: E402
    Idea,
    IdeaStatus,
    Role,
    RoleCategory,
    User,
    UserType,
)
from app.auth import hash_password, create_access_token  # noqa: E402


def _override_get_db():
    db = _TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=_test_engine)
    yield
    Base.metadata.drop_all(bind=_test_engine)


@pytest.fixture()
def db():
    """Provide a database session for direct data manipulation in tests."""
    session = _TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client():
    """Provide a FastAPI TestClient."""
    return TestClient(app)


@pytest.fixture()
def role(db):
    """Create and return a test role."""
    r = Role(
        name="Testrole",
        slug="testrole",
        category=RoleCategory.kundennah,
        description="Test role",
        email_alias="test@mopilot.website",
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@pytest.fixture()
def role2(db, role):
    """Create a second test role (for access control tests)."""
    r = Role(
        name="Andere Rolle",
        slug="andere-rolle",
        category=RoleCategory.betrieb,
        description="Second test role",
        email_alias="andere@mopilot.website",
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@pytest.fixture()
def admin_user(db):
    """Create and return an admin user."""
    u = User(
        email="admin@test.de",
        name="Admin User",
        password_hash=hash_password("testpass"),
        user_type=UserType.admin,
        role_id=None,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@pytest.fixture()
def team_user(db, role):
    """Create and return a team user."""
    u = User(
        email="team@test.de",
        name="Team User",
        password_hash=hash_password("testpass"),
        user_type=UserType.team,
        role_id=role.id,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@pytest.fixture()
def stakeholder_user(db, role):
    """Create and return a stakeholder user."""
    u = User(
        email="stakeholder@test.de",
        name="Stakeholder User",
        password_hash=hash_password("testpass"),
        user_type=UserType.stakeholder,
        role_id=role.id,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@pytest.fixture()
def idea(db, team_user, role):
    """Create and return a test idea."""
    i = Idea(
        title="Test-Idee",
        description="Eine Testbeschreibung",
        author_id=team_user.id,
        role_id=role.id,
        status=IdeaStatus.neu,
    )
    db.add(i)
    db.commit()
    db.refresh(i)
    return i


def auth_header(user: User) -> dict:
    """Generate an Authorization header for a user."""
    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}
