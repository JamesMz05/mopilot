"""Attachments router: upload and serve files for ideas."""

import logging
import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..auth import get_accessible_role_ids, get_current_user
from ..database import get_db
from ..models import Attachment, Idea, User, UserType
from ..schemas import AttachmentOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ideas", tags=["attachments"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".docx"}
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.post("/{idea_id}/attachments", response_model=AttachmentOut, status_code=201)
async def upload_attachment(
    idea_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a file attachment to an idea."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee nicht gefunden.")

    # Access check
    accessible = get_accessible_role_ids(current_user, db)
    if accessible is not None and idea.role_id not in accessible:
        raise HTTPException(status_code=403, detail="Kein Zugriff auf diese Idee.")

    # Validate file extension
    original = file.filename or "unknown"
    ext = os.path.splitext(original)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Dateityp nicht erlaubt. Erlaubt: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read and validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Datei zu groß (max. 10 MB).")

    # Save file
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, stored_name)
    with open(filepath, "wb") as f:
        f.write(content)

    attachment = Attachment(
        idea_id=idea_id,
        filename=stored_name,
        original_filename=original,
        content_type=file.content_type or "application/octet-stream",
        size=len(content),
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    logger.info(
        "Attachment uploaded: %s (%d bytes) for idea #%d",
        original,
        len(content),
        idea_id,
    )
    return AttachmentOut.model_validate(attachment)


@router.get("/{idea_id}/attachments", response_model=list[AttachmentOut])
def list_attachments(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all attachments for an idea."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee nicht gefunden.")

    accessible = get_accessible_role_ids(current_user, db)
    if accessible is not None and idea.role_id not in accessible:
        raise HTTPException(status_code=403, detail="Kein Zugriff auf diese Idee.")

    attachments = db.query(Attachment).filter(Attachment.idea_id == idea_id).all()
    return [AttachmentOut.model_validate(a) for a in attachments]


@router.delete("/{idea_id}/attachments/{attachment_id}", status_code=204)
def delete_attachment(
    idea_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an attachment (idea author or admin)."""
    attachment = db.query(Attachment).filter(
        Attachment.id == attachment_id, Attachment.idea_id == idea_id
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Anhang nicht gefunden.")

    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if current_user.user_type != UserType.admin and idea.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Keine Berechtigung.")

    # Delete file from disk
    filepath = os.path.join(UPLOAD_DIR, attachment.filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    db.delete(attachment)
    db.commit()
    logger.info("Attachment deleted: #%d", attachment_id)


@router.get("/{idea_id}/attachments/{attachment_id}/download")
def download_attachment(
    idea_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
):
    """Download an attachment file."""
    attachment = db.query(Attachment).filter(
        Attachment.id == attachment_id, Attachment.idea_id == idea_id
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Anhang nicht gefunden.")

    filepath = os.path.join(UPLOAD_DIR, attachment.filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Datei nicht gefunden.")

    return FileResponse(
        filepath,
        media_type=attachment.content_type,
        filename=attachment.original_filename,
    )
