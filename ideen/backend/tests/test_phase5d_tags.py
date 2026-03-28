"""Phase 5d – Smoke tests for tagging system endpoints."""

from app.models import Tag
from tests.conftest import auth_header


class TestListTags:
    """GET /api/tags"""

    def test_list_tags_empty(self, client):
        """List tags when none exist returns empty list."""
        resp = client.get("/api/tags")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_tags_returns_all(self, client, db, team_user):
        """List tags returns all created tags."""
        # Create tags via API
        client.post(
            "/api/tags",
            headers=auth_header(team_user),
            json={"name": "Digitalisierung"},
        )
        client.post(
            "/api/tags",
            headers=auth_header(team_user),
            json={"name": "Sicherheit"},
        )

        resp = client.get("/api/tags")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        names = {t["name"] for t in data}
        assert names == {"Digitalisierung", "Sicherheit"}


class TestCreateTag:
    """POST /api/tags"""

    def test_team_can_create_tag(self, client, team_user):
        """Team user can create a tag."""
        resp = client.post(
            "/api/tags",
            headers=auth_header(team_user),
            json={"name": "Mobilität"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Mobilität"
        assert data["slug"] == "mobilitaet"

    def test_admin_can_create_tag(self, client, admin_user):
        """Admin can create a tag."""
        resp = client.post(
            "/api/tags",
            headers=auth_header(admin_user),
            json={"name": "Innovation"},
        )
        assert resp.status_code == 201
        assert resp.json()["slug"] == "innovation"

    def test_stakeholder_cannot_create_tag(self, client, stakeholder_user):
        """Stakeholder gets 403 when creating a tag."""
        resp = client.post(
            "/api/tags",
            headers=auth_header(stakeholder_user),
            json={"name": "Verboten"},
        )
        assert resp.status_code == 403

    def test_umlaut_slugification(self, client, team_user):
        """German umlauts are correctly converted in slugs."""
        resp = client.post(
            "/api/tags",
            headers=auth_header(team_user),
            json={"name": "Überprüfung"},
        )
        assert resp.status_code == 201
        assert resp.json()["slug"] == "ueberpruefung"

    def test_eszett_slugification(self, client, team_user):
        """ß is correctly converted to ss in slugs."""
        resp = client.post(
            "/api/tags",
            headers=auth_header(team_user),
            json={"name": "Straßenverkehr"},
        )
        assert resp.status_code == 201
        assert resp.json()["slug"] == "strassenverkehr"

    def test_duplicate_tag_returns_existing(self, client, team_user):
        """Creating a tag with duplicate slug returns existing tag."""
        resp1 = client.post(
            "/api/tags",
            headers=auth_header(team_user),
            json={"name": "Test"},
        )
        resp2 = client.post(
            "/api/tags",
            headers=auth_header(team_user),
            json={"name": "Test"},
        )
        # Both should succeed, second returns existing
        assert resp1.json()["id"] == resp2.json()["id"]

    def test_create_tag_without_auth_returns_403(self, client):
        """Creating a tag without auth returns 403."""
        resp = client.post("/api/tags", json={"name": "NoAuth"})
        assert resp.status_code == 403


class TestDeleteTag:
    """DELETE /api/tags/{tag_id}"""

    def test_admin_can_delete_tag(self, client, admin_user):
        """Admin can delete a tag."""
        create = client.post(
            "/api/tags",
            headers=auth_header(admin_user),
            json={"name": "Zu löschen"},
        )
        tag_id = create.json()["id"]

        resp = client.delete(
            f"/api/tags/{tag_id}",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 204

        # Verify it's gone
        tags = client.get("/api/tags").json()
        assert all(t["id"] != tag_id for t in tags)

    def test_team_cannot_delete_tag(self, client, team_user, admin_user):
        """Team user gets 403 when deleting a tag."""
        create = client.post(
            "/api/tags",
            headers=auth_header(admin_user),
            json={"name": "Keep"},
        )
        tag_id = create.json()["id"]

        resp = client.delete(
            f"/api/tags/{tag_id}",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 403

    def test_delete_nonexistent_tag_returns_404(self, client, admin_user):
        """Deleting a non-existent tag returns 404."""
        resp = client.delete(
            "/api/tags/99999",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 404


class TestAssignTagToIdea:
    """POST /api/ideas/{idea_id}/tags/{tag_id}"""

    def test_assign_tag(self, client, idea, team_user, admin_user):
        """Assign a tag to an idea returns 201."""
        tag = client.post(
            "/api/tags",
            headers=auth_header(admin_user),
            json={"name": "E-Mobilität"},
        ).json()

        resp = client.post(
            f"/api/ideas/{idea.id}/tags/{tag['id']}",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 201
        assert "zugewiesen" in resp.json()["message"]

    def test_assign_same_tag_twice(self, client, idea, team_user, admin_user):
        """Assigning the same tag twice returns success (idempotent)."""
        tag = client.post(
            "/api/tags",
            headers=auth_header(admin_user),
            json={"name": "Doppelt"},
        ).json()

        client.post(
            f"/api/ideas/{idea.id}/tags/{tag['id']}",
            headers=auth_header(team_user),
        )
        resp = client.post(
            f"/api/ideas/{idea.id}/tags/{tag['id']}",
            headers=auth_header(team_user),
        )
        assert resp.status_code in (200, 201)

    def test_assign_tag_to_nonexistent_idea(self, client, team_user, admin_user):
        """Assigning tag to non-existent idea returns 404."""
        tag = client.post(
            "/api/tags",
            headers=auth_header(admin_user),
            json={"name": "NoIdea"},
        ).json()

        resp = client.post(
            f"/api/ideas/99999/tags/{tag['id']}",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 404

    def test_assign_nonexistent_tag_to_idea(self, client, idea, team_user):
        """Assigning non-existent tag to idea returns 404."""
        resp = client.post(
            f"/api/ideas/{idea.id}/tags/99999",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 404


class TestRemoveTagFromIdea:
    """DELETE /api/ideas/{idea_id}/tags/{tag_id}"""

    def test_remove_tag(self, client, idea, team_user, admin_user):
        """Remove a tag from an idea returns 204."""
        tag = client.post(
            "/api/tags",
            headers=auth_header(admin_user),
            json={"name": "Entfernen"},
        ).json()

        client.post(
            f"/api/ideas/{idea.id}/tags/{tag['id']}",
            headers=auth_header(team_user),
        )

        resp = client.delete(
            f"/api/ideas/{idea.id}/tags/{tag['id']}",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 204

    def test_remove_unassigned_tag_returns_404(self, client, idea, team_user, admin_user):
        """Remove tag not assigned to idea returns 404."""
        tag = client.post(
            "/api/tags",
            headers=auth_header(admin_user),
            json={"name": "NichtDa"},
        ).json()

        resp = client.delete(
            f"/api/ideas/{idea.id}/tags/{tag['id']}",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 404


class TestGetIdeaTags:
    """GET /api/ideas/{idea_id}/tags"""

    def test_get_tags_empty(self, client, idea):
        """Get tags for idea with none returns empty list."""
        resp = client.get(f"/api/ideas/{idea.id}/tags")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_assigned_tags(self, client, idea, team_user, admin_user):
        """Get tags returns assigned tags."""
        tag1 = client.post(
            "/api/tags",
            headers=auth_header(admin_user),
            json={"name": "Tag A"},
        ).json()
        tag2 = client.post(
            "/api/tags",
            headers=auth_header(admin_user),
            json={"name": "Tag B"},
        ).json()

        client.post(
            f"/api/ideas/{idea.id}/tags/{tag1['id']}",
            headers=auth_header(team_user),
        )
        client.post(
            f"/api/ideas/{idea.id}/tags/{tag2['id']}",
            headers=auth_header(team_user),
        )

        resp = client.get(f"/api/ideas/{idea.id}/tags")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        names = {t["name"] for t in data}
        assert names == {"Tag A", "Tag B"}

    def test_deleted_tag_removed_from_idea(self, client, idea, team_user, admin_user):
        """When a tag is deleted, it's removed from all ideas."""
        tag = client.post(
            "/api/tags",
            headers=auth_header(admin_user),
            json={"name": "WirdGelöscht"},
        ).json()

        client.post(
            f"/api/ideas/{idea.id}/tags/{tag['id']}",
            headers=auth_header(team_user),
        )

        # Delete the tag itself
        client.delete(
            f"/api/tags/{tag['id']}",
            headers=auth_header(admin_user),
        )

        # Verify idea no longer has the tag
        resp = client.get(f"/api/ideas/{idea.id}/tags")
        assert resp.status_code == 200
        assert len(resp.json()) == 0
