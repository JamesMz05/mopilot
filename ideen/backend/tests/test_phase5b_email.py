"""Phase 5b – Smoke tests for email notifications on comments."""

from unittest.mock import patch

from app.models import User
from tests.conftest import auth_header


class TestCommentEmailNotification:
    """Test that creating a comment triggers email notification."""

    def test_create_comment_returns_201(self, client, idea, team_user):
        """Creating a comment on an idea returns 201."""
        resp = client.post(
            f"/api/ideas/{idea.id}/comments",
            headers=auth_header(team_user),
            json={"text": "Toller Vorschlag!"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["text"] == "Toller Vorschlag!"
        assert data["idea_id"] == idea.id
        assert data["user_id"] == team_user.id

    def test_comment_by_other_user_triggers_notification(
        self, client, idea, admin_user, team_user
    ):
        """Comment by another user triggers notify_new_comment (if email configured)."""
        with patch("app.email.notify_new_comment") as mock_notify:
            resp = client.post(
                f"/api/ideas/{idea.id}/comments",
                headers=auth_header(admin_user),
                json={"text": "Gute Idee!"},
            )
            assert resp.status_code == 201
            # Notification should be called since commenter != author
            mock_notify.assert_called_once()
            call_kwargs = mock_notify.call_args
            assert call_kwargs[1]["author_email"] == team_user.email
            assert call_kwargs[1]["commenter_name"] == admin_user.name
            assert call_kwargs[1]["idea_title"] == idea.title

    def test_comment_by_author_no_notification(self, client, idea, team_user):
        """Comment by the idea author does not trigger notification."""
        with patch("app.email.notify_new_comment") as mock_notify:
            resp = client.post(
                f"/api/ideas/{idea.id}/comments",
                headers=auth_header(team_user),
                json={"text": "Eigener Kommentar"},
            )
            assert resp.status_code == 201
            mock_notify.assert_not_called()

    def test_list_comments(self, client, idea, team_user):
        """GET comments returns list of comments."""
        client.post(
            f"/api/ideas/{idea.id}/comments",
            headers=auth_header(team_user),
            json={"text": "Kommentar 1"},
        )
        client.post(
            f"/api/ideas/{idea.id}/comments",
            headers=auth_header(team_user),
            json={"text": "Kommentar 2"},
        )

        resp = client.get(
            f"/api/ideas/{idea.id}/comments",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        assert data[0]["text"] == "Kommentar 1"
        assert data[1]["text"] == "Kommentar 2"

    def test_delete_own_comment(self, client, idea, team_user):
        """User can delete their own comment."""
        create = client.post(
            f"/api/ideas/{idea.id}/comments",
            headers=auth_header(team_user),
            json={"text": "Zu löschen"},
        )
        comment_id = create.json()["id"]

        resp = client.delete(
            f"/api/comments/{comment_id}",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 204

    def test_admin_can_delete_any_comment(self, client, idea, team_user, admin_user):
        """Admin can delete comments by other users."""
        create = client.post(
            f"/api/ideas/{idea.id}/comments",
            headers=auth_header(team_user),
            json={"text": "Admin löscht"},
        )
        comment_id = create.json()["id"]

        resp = client.delete(
            f"/api/comments/{comment_id}",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 204

    def test_comment_without_auth_returns_403(self, client, idea):
        """Creating a comment without auth returns 403."""
        resp = client.post(
            f"/api/ideas/{idea.id}/comments",
            json={"text": "Unautorisiert"},
        )
        assert resp.status_code == 403


class TestEmailModule:
    """Test the email utility module itself."""

    def test_is_email_configured_returns_false_without_env(self):
        """Without SMTP env vars, is_email_configured returns False."""
        from app.email import is_email_configured

        assert is_email_configured() is False

    def test_send_email_returns_false_when_not_configured(self):
        """send_email returns False when SMTP not configured."""
        from app.email import send_email

        result = send_email("test@test.de", "Test", "<p>Test</p>")
        assert result is False

    def test_notify_new_comment_does_not_raise(self):
        """notify_new_comment gracefully handles missing SMTP config."""
        from app.email import notify_new_comment

        # Should not raise even without SMTP
        notify_new_comment(
            author_email="author@test.de",
            author_name="Author",
            idea_title="Test Idee",
            idea_id=1,
            commenter_name="Commenter",
            comment_text="Ein Kommentar",
        )
