"""Phase 5c – Smoke tests for CSV export and statistics endpoints."""

import csv
import io

from app.models import Comment, Idea, IdeaStatus, Rating
from tests.conftest import auth_header


class TestCSVExport:
    """GET /api/export/ideas"""

    def test_admin_can_export_csv(self, client, idea, admin_user):
        """Admin gets a CSV export with correct headers."""
        resp = client.get(
            "/api/export/ideas",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        assert "ideen_export.csv" in resp.headers.get("content-disposition", "")

        reader = csv.reader(io.StringIO(resp.text), delimiter=";")
        rows = list(reader)
        # Header row
        assert rows[0][0] == "ID"
        assert rows[0][1] == "Titel"
        assert "Durchschnittsbewertung" in rows[0]
        # Data row for the test idea
        assert len(rows) == 2
        assert rows[1][1] == "Test-Idee"

    def test_csv_includes_all_columns(self, client, idea, admin_user):
        """CSV has all 13 expected columns."""
        resp = client.get(
            "/api/export/ideas",
            headers=auth_header(admin_user),
        )
        reader = csv.reader(io.StringIO(resp.text), delimiter=";")
        header = next(reader)
        assert len(header) == 13

    def test_csv_empty_when_no_ideas(self, client, admin_user):
        """CSV export with no ideas returns only the header row."""
        resp = client.get(
            "/api/export/ideas",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        reader = csv.reader(io.StringIO(resp.text), delimiter=";")
        rows = list(reader)
        assert len(rows) == 1  # Only header

    def test_non_admin_cannot_export(self, client, idea, team_user):
        """Non-admin user gets 403 on CSV export."""
        resp = client.get(
            "/api/export/ideas",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 403

    def test_stakeholder_cannot_export(self, client, idea, stakeholder_user):
        """Stakeholder user gets 403 on CSV export."""
        resp = client.get(
            "/api/export/ideas",
            headers=auth_header(stakeholder_user),
        )
        assert resp.status_code == 403

    def test_csv_with_ratings_and_comments(self, client, idea, admin_user, team_user, db):
        """CSV export includes rating and comment counts."""
        # Add a rating
        db.add(Rating(idea_id=idea.id, user_id=team_user.id, score=4))
        # Add a comment
        db.add(Comment(idea_id=idea.id, user_id=team_user.id, text="Test"))
        db.commit()

        resp = client.get(
            "/api/export/ideas",
            headers=auth_header(admin_user),
        )
        reader = csv.reader(io.StringIO(resp.text), delimiter=";")
        rows = list(reader)
        data_row = rows[1]
        # Durchschnittsbewertung (index 8) should be "4.0"
        assert data_row[8] == "4.0"
        # Anzahl Bewertungen (index 9) should be "1"
        assert data_row[9] == "1"
        # Anzahl Kommentare (index 10) should be "1"
        assert data_row[10] == "1"


class TestStatistics:
    """GET /api/export/stats"""

    def test_admin_gets_statistics(self, client, idea, admin_user):
        """Admin gets platform statistics."""
        resp = client.get(
            "/api/export/stats",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "totals" in data
        assert "top_rated" in data
        assert "ideas_per_role" in data
        assert "ideas_per_status" in data
        assert "recent_activity" in data

    def test_stats_totals(self, client, idea, admin_user, team_user, db):
        """Statistics totals count correctly."""
        resp = client.get(
            "/api/export/stats",
            headers=auth_header(admin_user),
        )
        data = resp.json()
        assert data["totals"]["ideas"] >= 1
        assert data["totals"]["users"] >= 1

    def test_stats_ideas_per_role(self, client, idea, admin_user):
        """ideas_per_role contains role distribution."""
        resp = client.get(
            "/api/export/stats",
            headers=auth_header(admin_user),
        )
        data = resp.json()
        roles = data["ideas_per_role"]
        assert isinstance(roles, list)
        assert len(roles) >= 1
        role_entry = next((r for r in roles if r["slug"] == "testrole"), None)
        assert role_entry is not None
        assert role_entry["count"] >= 1

    def test_stats_ideas_per_status(self, client, idea, admin_user):
        """ideas_per_status contains status distribution."""
        resp = client.get(
            "/api/export/stats",
            headers=auth_header(admin_user),
        )
        data = resp.json()
        statuses = data["ideas_per_status"]
        assert isinstance(statuses, list)
        assert any(s["status"] == "neu" for s in statuses)

    def test_stats_recent_activity(self, client, idea, admin_user):
        """recent_activity contains last 7 day counts."""
        resp = client.get(
            "/api/export/stats",
            headers=auth_header(admin_user),
        )
        data = resp.json()
        activity = data["recent_activity"]
        assert "ideas_7d" in activity
        assert "comments_7d" in activity

    def test_stats_top_rated(self, client, idea, admin_user, team_user, db):
        """top_rated lists ideas with ratings."""
        db.add(Rating(idea_id=idea.id, user_id=team_user.id, score=5))
        db.commit()

        resp = client.get(
            "/api/export/stats",
            headers=auth_header(admin_user),
        )
        data = resp.json()
        assert len(data["top_rated"]) >= 1
        assert data["top_rated"][0]["avg_rating"] == 5.0

    def test_non_admin_cannot_access_stats(self, client, team_user):
        """Non-admin user gets 403 on statistics."""
        resp = client.get(
            "/api/export/stats",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 403
