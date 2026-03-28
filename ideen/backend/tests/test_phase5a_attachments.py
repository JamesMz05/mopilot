"""Phase 5a – Smoke tests for file attachment endpoints."""

import io
import os

from tests.conftest import auth_header


class TestUploadAttachment:
    """POST /api/ideas/{id}/attachments"""

    def test_upload_jpg(self, client, idea, team_user):
        """Upload a valid JPG file returns 201."""
        resp = client.post(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
            files={"file": ("test.jpg", b"\xff\xd8\xff\xe0" + b"\x00" * 100, "image/jpeg")},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["original_filename"] == "test.jpg"
        assert data["content_type"] == "image/jpeg"
        assert data["size"] > 0
        assert data["idea_id"] == idea.id

    def test_upload_png(self, client, idea, admin_user):
        """Upload a PNG file returns 201."""
        resp = client.post(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(admin_user),
            files={"file": ("image.png", b"\x89PNG" + b"\x00" * 50, "image/png")},
        )
        assert resp.status_code == 201
        assert resp.json()["original_filename"] == "image.png"

    def test_upload_pdf(self, client, idea, team_user):
        """Upload a PDF file returns 201."""
        resp = client.post(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
            files={"file": ("doc.pdf", b"%PDF-1.4" + b"\x00" * 50, "application/pdf")},
        )
        assert resp.status_code == 201
        assert resp.json()["original_filename"] == "doc.pdf"

    def test_upload_docx(self, client, idea, team_user):
        """Upload a DOCX file returns 201."""
        resp = client.post(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
            files={
                "file": (
                    "report.docx",
                    b"PK" + b"\x00" * 50,
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                )
            },
        )
        assert resp.status_code == 201
        assert resp.json()["original_filename"] == "report.docx"

    def test_upload_disallowed_extension_returns_400(self, client, idea, team_user):
        """Upload a .exe file is rejected."""
        resp = client.post(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
            files={"file": ("malware.exe", b"\x00" * 10, "application/octet-stream")},
        )
        assert resp.status_code == 400
        assert "nicht erlaubt" in resp.json()["detail"]

    def test_upload_too_large_returns_400(self, client, idea, team_user):
        """Upload >10 MB file is rejected."""
        big_content = b"\x00" * (10 * 1024 * 1024 + 1)
        resp = client.post(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
            files={"file": ("big.jpg", big_content, "image/jpeg")},
        )
        assert resp.status_code == 400
        assert "10 MB" in resp.json()["detail"]

    def test_upload_to_nonexistent_idea_returns_404(self, client, team_user):
        """Upload to non-existent idea returns 404."""
        resp = client.post(
            "/api/ideas/99999/attachments",
            headers=auth_header(team_user),
            files={"file": ("test.jpg", b"\x00" * 10, "image/jpeg")},
        )
        assert resp.status_code == 404

    def test_upload_without_auth_returns_403(self, client, idea):
        """Upload without token returns 403."""
        resp = client.post(
            f"/api/ideas/{idea.id}/attachments",
            files={"file": ("test.jpg", b"\x00" * 10, "image/jpeg")},
        )
        assert resp.status_code == 403

    def test_stakeholder_cannot_upload_to_other_role(
        self, client, idea, stakeholder_user, role2, db
    ):
        """Stakeholder can't upload to idea from different role."""
        from app.models import Idea, IdeaStatus

        other_idea = Idea(
            title="Andere Idee",
            description="Andere Rolle",
            author_id=stakeholder_user.id,
            role_id=role2.id,
            status=IdeaStatus.neu,
        )
        db.add(other_idea)
        db.commit()
        db.refresh(other_idea)

        resp = client.post(
            f"/api/ideas/{other_idea.id}/attachments",
            headers=auth_header(stakeholder_user),
            files={"file": ("test.jpg", b"\x00" * 10, "image/jpeg")},
        )
        assert resp.status_code == 403


class TestListAttachments:
    """GET /api/ideas/{id}/attachments"""

    def test_list_empty(self, client, idea, team_user):
        """List attachments for idea with none returns empty list."""
        resp = client.get(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_after_upload(self, client, idea, team_user):
        """List attachments returns uploaded files."""
        client.post(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
            files={"file": ("a.jpg", b"\x00" * 10, "image/jpeg")},
        )
        client.post(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
            files={"file": ("b.png", b"\x00" * 20, "image/png")},
        )

        resp = client.get(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        names = {a["original_filename"] for a in data}
        assert names == {"a.jpg", "b.png"}


class TestDeleteAttachment:
    """DELETE /api/ideas/{id}/attachments/{attachment_id}"""

    def test_author_can_delete(self, client, idea, team_user):
        """Idea author can delete their attachment."""
        upload = client.post(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
            files={"file": ("del.jpg", b"\x00" * 10, "image/jpeg")},
        )
        att_id = upload.json()["id"]

        resp = client.delete(
            f"/api/ideas/{idea.id}/attachments/{att_id}",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 204

    def test_admin_can_delete(self, client, idea, admin_user, team_user):
        """Admin can delete any attachment."""
        upload = client.post(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
            files={"file": ("del.jpg", b"\x00" * 10, "image/jpeg")},
        )
        att_id = upload.json()["id"]

        resp = client.delete(
            f"/api/ideas/{idea.id}/attachments/{att_id}",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 204

    def test_delete_nonexistent_returns_404(self, client, idea, team_user):
        """Delete non-existent attachment returns 404."""
        resp = client.delete(
            f"/api/ideas/{idea.id}/attachments/99999",
            headers=auth_header(team_user),
        )
        assert resp.status_code == 404


class TestDownloadAttachment:
    """GET /api/ideas/{id}/attachments/{attachment_id}/download"""

    def test_download_uploaded_file(self, client, idea, team_user):
        """Download returns the correct file content."""
        content = b"\xff\xd8\xff\xe0" + b"testdata"
        upload = client.post(
            f"/api/ideas/{idea.id}/attachments",
            headers=auth_header(team_user),
            files={"file": ("photo.jpg", content, "image/jpeg")},
        )
        att_id = upload.json()["id"]

        resp = client.get(
            f"/api/ideas/{idea.id}/attachments/{att_id}/download",
        )
        assert resp.status_code == 200
        assert resp.content == content

    def test_download_nonexistent_returns_404(self, client, idea):
        """Download non-existent attachment returns 404."""
        resp = client.get(
            f"/api/ideas/{idea.id}/attachments/99999/download",
        )
        assert resp.status_code == 404
