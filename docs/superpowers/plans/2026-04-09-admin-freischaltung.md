# Admin-Freischaltung & Benutzerverwaltung – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Neue User-Registrierungen erfordern Admin-Freischaltung bevor Login möglich ist. Admin erhält E-Mail-Benachrichtigung und kann User in einer Benutzerverwaltung freischalten, sperren, Rolle ändern und Passwort zurücksetzen.

**Architecture:** Neues Boolean-Feld `approved` im User-Model der Ideen-DB. Login prüft `email_verified AND approved`. Sync zur mopilot-DB nur bei Freischaltung. Erweiterte Admin-API-Endpoints in `users.py`. Neue Benutzerverwaltungs-UI als eigene Seite `/admin/users`.

**Tech Stack:** FastAPI (Backend), SQLAlchemy (sync), Next.js 14 + React 18 + Tailwind (Frontend), IONOS SMTP (E-Mail), psycopg2 (mopilot-DB Sync)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `ideen/backend/app/models.py` | Add `approved` column to User |
| Create | `ideen/backend/alembic/versions/d5e6f7g8h9_add_approved_column.py` | DB migration |
| Modify | `ideen/backend/app/schemas.py` | Add `approved` to UserOut, new admin schemas |
| Modify | `ideen/backend/app/routers/auth.py` | Login checks `approved`, verify no longer syncs |
| Modify | `ideen/backend/app/routers/users.py` | Admin endpoints: approve, suspend, role change, password reset |
| Modify | `ideen/backend/app/email.py` | Add `send_admin_new_registration_email()` |
| Modify | `ideen/backend/app/user_sync.py` | Add `delete_user_from_mopilot()` |
| Modify | `ideen/frontend/src/lib/types.ts` | Add `approved` to UserInfo type |
| Create | `ideen/frontend/src/app/admin/users/page.tsx` | Benutzerverwaltung page |
| Modify | `ideen/frontend/src/app/admin/page.tsx` | Add pending-user count badge + link |
| Modify | `ideen/frontend/src/components/Header.tsx` | Add pending badge for admin |

---

### Task 1: Database – Add `approved` column

**Files:**
- Modify: `ideen/backend/app/models.py:43-58`
- Create: `ideen/backend/alembic/versions/d5e6f7g8h9_add_approved_column.py`

- [ ] **Step 1: Add `approved` column to User model**

In `ideen/backend/app/models.py`, add after line 52 (`email_verified`):

```python
    approved = Column(Boolean, default=False, server_default="false", nullable=False)
```

- [ ] **Step 2: Create Alembic migration**

```bash
cd /opt/mopilot/ideen/backend && python -m alembic revision --autogenerate -m "add_approved_column"
```

- [ ] **Step 3: Review generated migration and run it**

```bash
cd /opt/mopilot/ideen/backend && python -m alembic upgrade head
```

- [ ] **Step 4: Set existing verified users as approved**

```bash
docker exec mopilot-postgres psql -U mopilot -d mopilot_ideen -c "UPDATE users SET approved = true WHERE email_verified = true;"
```

- [ ] **Step 5: Commit**

```bash
git add ideen/backend/app/models.py ideen/backend/alembic/
git commit -m "feat(ideen): add approved column to users table"
```

---

### Task 2: Schemas – Add `approved` field and admin request schemas

**Files:**
- Modify: `ideen/backend/app/schemas.py:36-46`

- [ ] **Step 1: Add `approved` to UserOut**

In `ideen/backend/app/schemas.py`, change UserOut class:

```python
class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role_id: int | None = None
    role_name: str | None = None
    user_type: UserType
    email_verified: bool = False
    approved: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}
```

- [ ] **Step 2: Add admin action schemas**

Append after `MessageResponse` class (line 161):

```python
class AdminApproveRequest(BaseModel):
    """Used for approve/reject actions."""
    pass


class AdminRoleChangeRequest(BaseModel):
    role_id: int


class AdminPasswordResetRequest(BaseModel):
    new_password: str = Field(..., min_length=6)
```

- [ ] **Step 3: Commit**

```bash
git add ideen/backend/app/schemas.py
git commit -m "feat(ideen): add approved field and admin schemas"
```

---

### Task 3: Email – Admin notification for new registrations

**Files:**
- Modify: `ideen/backend/app/email.py`

- [ ] **Step 1: Add `send_admin_new_registration_email()` function**

Append at end of `ideen/backend/app/email.py`:

```python
ADMIN_EMAIL = "admin@mopilot.website"


def send_admin_new_registration_email(
    user_email: str, user_name: str, role_name: str | None
) -> bool:
    """Notify admin about a new user registration pending approval."""
    subject = f"Neue Registrierung wartet auf Freischaltung: {user_name}"
    admin_url = f"{BASE_URL}/admin/users"
    role_display = role_name or "Keine Rolle"
    html = f"""
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2D6A4F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">MoPilot Ideenplattform</h2>
        </div>
        <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hallo Admin,</p>
            <p>ein neuer Benutzer hat sich registriert und wartet auf Freischaltung:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr><td style="padding: 8px; color: #666;"><strong>Name:</strong></td><td style="padding: 8px;">{user_name}</td></tr>
                <tr><td style="padding: 8px; color: #666;"><strong>E-Mail:</strong></td><td style="padding: 8px;">{user_email}</td></tr>
                <tr><td style="padding: 8px; color: #666;"><strong>Rolle:</strong></td><td style="padding: 8px;">{role_display}</td></tr>
            </table>
            <p style="text-align: center; margin: 24px 0;">
                <a href="{admin_url}"
                   style="display: inline-block; background: #2D6A4F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    Benutzerverwaltung öffnen
                </a>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">
                Diese Nachricht wurde automatisch von der MoPilot Ideenplattform versendet.
            </p>
        </div>
    </div>
    """
    return send_email(ADMIN_EMAIL, subject, html)
```

- [ ] **Step 2: Commit**

```bash
git add ideen/backend/app/email.py
git commit -m "feat(ideen): add admin notification email for new registrations"
```

---

### Task 4: Auth Router – Login checks `approved`, verify no longer syncs

**Files:**
- Modify: `ideen/backend/app/routers/auth.py`

- [ ] **Step 1: Update imports**

Add to the imports from `..email`:

```python
from ..email import (
    is_email_configured,
    send_admin_new_registration_email,
    send_password_reset_email,
    send_verification_email,
)
```

- [ ] **Step 2: Update register endpoint – send admin notification after verification email**

In the `register()` function, after the verification email block (after `send_verification_email` try/except), add admin notification. Replace the entire `if smtp_available:` block:

```python
    if smtp_available:
        token = create_verification_token(user.id)
        try:
            send_verification_email(user.email, user.name, token)
        except Exception as e:
            logger.warning("Verification email failed: %s", str(e))
        # Notify admin about pending registration
        role = db.query(Role).filter(Role.id == user.role_id).first() if user.role_id else None
        try:
            send_admin_new_registration_email(user.email, user.name, role.name if role else None)
        except Exception as e:
            logger.warning("Admin notification email failed: %s", str(e))
        return MessageResponse(
            message="Registrierung erfolgreich! Bitte prüfen Sie Ihr Postfach und bestätigen Sie Ihre E-Mail-Adresse. Nach der Bestätigung wird Ihr Konto vom Administrator freigeschaltet."
        )
    else:
        # No SMTP → auto-verified but still needs admin approval
        return MessageResponse(
            message="Registrierung erfolgreich! Ihr Konto muss noch vom Administrator freigeschaltet werden."
        )
```

**Important:** Remove the `sync_user_to_mopilot` call from the `else` branch (no-SMTP case). Sync now only happens on admin approval.

- [ ] **Step 3: Update login – check `approved`**

In the `login()` function, add after the `email_verified` check:

```python
    if not user.approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ihr Konto wurde noch nicht freigeschaltet. Bitte warten Sie auf die Bestätigung durch den Administrator.",
        )
```

- [ ] **Step 4: Update verify endpoint – remove sync call**

In the `verify_email()` function, remove the sync lines. Replace the sync block at the end:

```python
    # Sync verified user to mopilot DB
    role = db.query(Role).filter(Role.id == user.role_id).first() if user.role_id else None
    sync_user_to_mopilot(user.email, user.name, user.password_hash, role.slug if role else None)
```

With just a log message:

```python
    logger.info("Email verified for %s. Awaiting admin approval.", user.email)
```

- [ ] **Step 5: Commit**

```bash
git add ideen/backend/app/routers/auth.py
git commit -m "feat(ideen): login requires admin approval, verify no longer syncs"
```

---

### Task 5: User Sync – Add delete function

**Files:**
- Modify: `ideen/backend/app/user_sync.py`

- [ ] **Step 1: Add `delete_user_from_mopilot()` function**

Append at end of `ideen/backend/app/user_sync.py`:

```python
def delete_user_from_mopilot(email: str) -> bool:
    """Delete a user from the mopilot main database. Returns True on success."""
    try:
        conn = psycopg2.connect(MOPILOT_DB_URL, connect_timeout=10)
        try:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM users WHERE email = %s", (email,))
                deleted = cur.rowcount
            conn.commit()
            if deleted:
                logger.info("[USER-SYNC] Deleted %s from mopilot DB", email)
            return deleted > 0
        finally:
            conn.close()
    except Exception:
        logger.exception("[USER-SYNC] Failed to delete %s from mopilot DB", email)
        return False
```

- [ ] **Step 2: Commit**

```bash
git add ideen/backend/app/user_sync.py
git commit -m "feat(ideen): add delete_user_from_mopilot sync function"
```

---

### Task 6: Users Router – Admin management endpoints

**Files:**
- Modify: `ideen/backend/app/routers/users.py`

- [ ] **Step 1: Rewrite users.py with full admin management**

Replace the entire content of `ideen/backend/app/routers/users.py`:

```python
"""Users router: user management (admin)."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user, hash_password
from ..database import get_db
from ..models import Comment, Idea, Rating, Role, User, UserType
from ..schemas import (
    AdminPasswordResetRequest,
    AdminRoleChangeRequest,
    MessageResponse,
    UserOut,
)
from ..user_sync import delete_user_from_mopilot, sync_user_to_mopilot

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])


def _require_admin(current_user: User) -> None:
    if current_user.user_type != UserType.admin:
        raise HTTPException(status_code=403, detail="Nur Admins können Nutzer verwalten.")


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all users (admin only). Pending users first, then by created_at desc."""
    _require_admin(current_user)
    users = (
        db.query(User)
        .order_by(User.approved.asc(), User.created_at.desc())
        .all()
    )
    return [UserOut.model_validate(u) for u in users]


@router.get("/pending-count")
def pending_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return count of users pending approval (admin only)."""
    _require_admin(current_user)
    count = db.query(User).filter(
        User.email_verified == True,
        User.approved == False,
    ).count()
    return {"count": count}


@router.post("/{user_id}/approve", response_model=MessageResponse)
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approve a pending user and sync to mopilot DB."""
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")
    if user.approved:
        return MessageResponse(message="Benutzer ist bereits freigeschaltet.")

    user.approved = True
    db.commit()
    logger.info("User approved: %s by admin %s", user.email, current_user.email)

    # Sync to mopilot DB
    role = db.query(Role).filter(Role.id == user.role_id).first() if user.role_id else None
    sync_user_to_mopilot(
        user.email, user.name, user.password_hash,
        role.slug if role else None,
    )

    return MessageResponse(message=f"{user.name} wurde freigeschaltet.")


@router.post("/{user_id}/reject", response_model=MessageResponse)
def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reject and delete a pending user."""
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Sie können sich nicht selbst löschen.")

    email = user.email
    # Delete dependent data
    db.query(Comment).filter(Comment.user_id == user_id).delete()
    db.query(Rating).filter(Rating.user_id == user_id).delete()
    db.query(Idea).filter(Idea.author_id == user_id).delete()
    db.delete(user)
    db.commit()
    logger.info("User rejected/deleted: %s by admin %s", email, current_user.email)

    # Also delete from mopilot DB if synced
    delete_user_from_mopilot(email)

    return MessageResponse(message=f"{email} wurde gelöscht.")


@router.post("/{user_id}/suspend", response_model=MessageResponse)
def suspend_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Suspend a user (revoke approval). User can no longer log in."""
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Sie können sich nicht selbst sperren.")

    user.approved = False
    db.commit()
    logger.info("User suspended: %s by admin %s", user.email, current_user.email)

    # Remove from mopilot DB so login fails on other platforms too
    delete_user_from_mopilot(user.email)

    return MessageResponse(message=f"{user.name} wurde gesperrt.")


@router.patch("/{user_id}/role", response_model=MessageResponse)
def change_role(
    user_id: int,
    data: AdminRoleChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change a user's role and sync to mopilot DB."""
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")

    role = db.query(Role).filter(Role.id == data.role_id).first()
    if not role:
        raise HTTPException(status_code=400, detail="Ungültige Rolle.")

    old_role_name = user.role.name if user.role else "keine"
    user.role_id = data.role_id
    db.commit()
    db.refresh(user)
    logger.info("Role changed for %s: %s -> %s by admin %s", user.email, old_role_name, role.name, current_user.email)

    # Re-sync to mopilot DB with new role
    if user.approved:
        sync_user_to_mopilot(
            user.email, user.name, user.password_hash, role.slug,
        )

    return MessageResponse(message=f"Rolle von {user.name} auf {role.name} geändert.")


@router.post("/{user_id}/reset-password", response_model=MessageResponse)
def admin_reset_password(
    user_id: int,
    data: AdminPasswordResetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin sets a new password for a user."""
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")

    user.password_hash = hash_password(data.new_password)
    db.commit()
    logger.info("Password reset for %s by admin %s", user.email, current_user.email)

    # Sync new password to mopilot DB
    if user.approved:
        role = db.query(Role).filter(Role.id == user.role_id).first() if user.role_id else None
        sync_user_to_mopilot(
            user.email, user.name, user.password_hash,
            role.slug if role else None,
        )

    return MessageResponse(message=f"Passwort für {user.name} wurde zurückgesetzt.")


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a user (admin only)."""
    _require_admin(current_user)
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Sie können sich nicht selbst löschen.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")

    email = user.email
    db.query(Comment).filter(Comment.user_id == user_id).delete()
    db.query(Rating).filter(Rating.user_id == user_id).delete()
    db.query(Idea).filter(Idea.author_id == user_id).delete()
    db.delete(user)
    db.commit()
    logger.info("User deleted: #%d (%s) by admin #%d", user_id, email, current_user.id)

    delete_user_from_mopilot(email)
```

- [ ] **Step 2: Commit**

```bash
git add ideen/backend/app/routers/users.py
git commit -m "feat(ideen): admin user management endpoints (approve, suspend, role, password)"
```

---

### Task 7: Frontend Types – Add `approved` field

**Files:**
- Modify: `ideen/frontend/src/lib/types.ts`

- [ ] **Step 1: Find and update the UserInfo interface or add it**

The `UserInfo` type is defined inline in `admin/page.tsx`. We need to add `approved` there and also add it to `types.ts` for reuse. Add to `ideen/frontend/src/lib/types.ts`:

```typescript
export interface UserInfo {
  id: number;
  email: string;
  name: string;
  role_id: number | null;
  role_name: string | null;
  user_type: string;
  email_verified: boolean;
  approved: boolean;
  created_at: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add ideen/frontend/src/lib/types.ts
git commit -m "feat(ideen): add UserInfo type with approved field"
```

---

### Task 8: Frontend – Benutzerverwaltung page `/admin/users`

**Files:**
- Create: `ideen/frontend/src/app/admin/users/page.tsx`

- [ ] **Step 1: Create the admin users page**

Create `ideen/frontend/src/app/admin/users/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Role, UserInfo } from "@/lib/types";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [passwordModal, setPasswordModal] = useState<{ userId: number; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [roleModal, setRoleModal] = useState<{ userId: number; name: string; currentRoleId: number | null } | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    if (user && user.user_type !== "admin") { router.push("/"); return; }

    Promise.all([
      apiFetch<UserInfo[]>("/users", { token }),
      apiFetch<Record<string, Role[]>>("/roles"),
    ])
      .then(([u, r]) => {
        setUsers(u);
        setRoles(Object.values(r).flat());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, user, router]);

  const pendingUsers = users.filter((u) => u.email_verified && !u.approved);
  const activeUsers = users.filter((u) => u.approved);
  const suspendedUsers = users.filter((u) => !u.email_verified || (!u.approved && u.email_verified === false));

  async function handleAction(userId: number, action: string, body?: object) {
    setActionLoading(userId);
    try {
      const res = await apiFetch<{ message: string }>(`/users/${userId}/${action}`, {
        method: "POST",
        token,
        body,
      });
      // Refresh user list
      const updated = await apiFetch<UserInfo[]>("/users", { token });
      setUsers(updated);
    } catch { /* ignore */ }
    setActionLoading(null);
  }

  async function handleDelete(userId: number, name: string) {
    if (!confirm(`${name} wirklich löschen? Alle Ideen, Kommentare und Bewertungen werden ebenfalls gelöscht.`)) return;
    setActionLoading(userId);
    try {
      await apiFetch(`/users/${userId}`, { method: "DELETE", token });
      setUsers(users.filter((u) => u.id !== userId));
    } catch { /* ignore */ }
    setActionLoading(null);
  }

  async function handlePasswordReset() {
    if (!passwordModal || !newPassword.trim() || newPassword.length < 6) return;
    setActionLoading(passwordModal.userId);
    try {
      await apiFetch<{ message: string }>(`/users/${passwordModal.userId}/reset-password`, {
        method: "POST",
        token,
        body: { new_password: newPassword },
      });
      setPasswordModal(null);
      setNewPassword("");
    } catch { /* ignore */ }
    setActionLoading(null);
  }

  async function handleRoleChange() {
    if (!roleModal || !selectedRoleId) return;
    await handleAction(roleModal.userId, "role", { role_id: selectedRoleId });
    setRoleModal(null);
    setSelectedRoleId(null);
  }

  function getRoleName(roleId: number | null) {
    if (!roleId) return "\u2014";
    return roles.find((r) => r.id === roleId)?.name || "\u2014";
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <Link href="/admin" className="text-sm font-body text-primary-600 hover:text-primary-800 hover:underline mb-4 inline-flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
        Zurück zum Admin-Dashboard
      </Link>
      <h2 className="text-2xl font-display font-bold text-surface-900 mb-6">Benutzerverwaltung</h2>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <>
          <h3 className="text-lg font-display font-semibold text-surface-900 mb-3 flex items-center gap-2">
            Warten auf Freischaltung
            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">{pendingUsers.length}</span>
          </h3>
          <div className="bg-white rounded-xl shadow-warm-sm border border-amber-200 overflow-hidden mb-8">
            <table className="w-full text-sm font-body">
              <thead className="bg-amber-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">E-Mail</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Rolle</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Registriert</th>
                  <th className="text-right px-4 py-3 font-medium text-surface-600">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {pendingUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-surface-800">{u.name}</td>
                    <td className="px-4 py-3 text-surface-500">{u.email}</td>
                    <td className="px-4 py-3 text-surface-500">{getRoleName(u.role_id)}</td>
                    <td className="px-4 py-3 text-surface-500">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleAction(u.id, "approve")}
                        disabled={actionLoading === u.id}
                        className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Freischalten
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        disabled={actionLoading === u.id}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      >
                        Ablehnen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Active Users */}
      <h3 className="text-lg font-display font-semibold text-surface-900 mb-3">Aktive Benutzer ({activeUsers.length})</h3>
      <div className="bg-white rounded-xl shadow-warm-sm border border-surface-200 overflow-hidden mb-8">
        <table className="w-full text-sm font-body">
          <thead className="bg-surface-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">E-Mail</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Typ</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Rolle</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Registriert</th>
              <th className="text-right px-4 py-3 font-medium text-surface-600">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {activeUsers.map((u) => (
              <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3 font-medium text-surface-800">{u.name}</td>
                <td className="px-4 py-3 text-surface-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.user_type === "admin" ? "bg-red-100 text-red-700"
                    : u.user_type === "team" ? "bg-blue-100 text-blue-700"
                    : "bg-surface-100 text-surface-700"
                  }`}>{u.user_type}</span>
                </td>
                <td className="px-4 py-3 text-surface-500">
                  <button
                    onClick={() => { setRoleModal({ userId: u.id, name: u.name, currentRoleId: u.role_id }); setSelectedRoleId(u.role_id); }}
                    className="text-primary-600 hover:text-primary-800 hover:underline"
                  >
                    {getRoleName(u.role_id)}
                  </button>
                </td>
                <td className="px-4 py-3 text-surface-500">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  {u.id !== user?.id && (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setPasswordModal({ userId: u.id, name: u.name }); setNewPassword(""); }} className="text-xs text-primary-600 hover:text-primary-800 transition-colors">
                        Passwort
                      </button>
                      <button onClick={() => handleAction(u.id, "suspend")} disabled={actionLoading === u.id} className="text-xs text-amber-600 hover:text-amber-800 transition-colors disabled:opacity-50">
                        Sperren
                      </button>
                      <button onClick={() => handleDelete(u.id, u.name)} disabled={actionLoading === u.id} className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50">
                        Löschen
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password Reset Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPasswordModal(null)}>
          <div className="bg-white rounded-2xl shadow-warm-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-display font-semibold text-surface-900 mb-4">Passwort zurücksetzen: {passwordModal.name}</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Neues Passwort (min. 6 Zeichen)"
              className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setPasswordModal(null)} className="text-sm font-body text-surface-500 hover:text-surface-700 px-4 py-2">
                Abbrechen
              </button>
              <button
                onClick={handlePasswordReset}
                disabled={newPassword.length < 6 || actionLoading !== null}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold font-body hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setRoleModal(null)}>
          <div className="bg-white rounded-2xl shadow-warm-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-display font-semibold text-surface-900 mb-4">Rolle ändern: {roleModal.name}</h3>
            <select
              value={selectedRoleId || ""}
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
              className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent mb-4"
            >
              <option value="">Rolle auswählen...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRoleModal(null)} className="text-sm font-body text-surface-500 hover:text-surface-700 px-4 py-2">
                Abbrechen
              </button>
              <button
                onClick={handleRoleChange}
                disabled={!selectedRoleId || selectedRoleId === roleModal.currentRoleId || actionLoading !== null}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold font-body hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add ideen/frontend/src/app/admin/users/page.tsx
git commit -m "feat(ideen): admin user management page with approve, suspend, role change, password reset"
```

---

### Task 9: Frontend – Update admin dashboard with pending badge + link

**Files:**
- Modify: `ideen/frontend/src/app/admin/page.tsx`
- Modify: `ideen/frontend/src/components/Header.tsx`

- [ ] **Step 1: Update admin/page.tsx – replace inline UserInfo with import, add pending count**

In `ideen/frontend/src/app/admin/page.tsx`:

1. Replace the inline `UserInfo` interface (lines 10-17) with import:
```typescript
import { Role, STATUS_LABELS, UserInfo } from "@/lib/types";
```

2. Add a `pendingCount` state and fetch:
```typescript
const [pendingCount, setPendingCount] = useState(0);
```

3. In the Promise.all, add the pending-count fetch:
```typescript
    Promise.all([
      apiFetch<UserInfo[]>("/users", { token }),
      apiFetch<Record<string, Role[]>>("/roles"),
      apiFetch<Stats>("/export/stats", { token }),
      apiFetch<Tag[]>("/tags"),
      apiFetch<{ count: number }>("/users/pending-count", { token }),
    ])
      .then(([u, r, s, t, p]) => { setUsers(u); setRoles(r); setStats(s); setTags(t); setPendingCount(p.count); })
```

4. Replace the Users section (lines 263-300) with a link to `/admin/users`:
```tsx
      {/* Users */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-display font-semibold text-surface-900">Benutzer</h3>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold font-body hover:from-primary-700 hover:to-primary-800 hover:shadow-warm-md transition-all duration-200"
        >
          Benutzerverwaltung
          {pendingCount > 0 && (
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </Link>
      </div>
```

Keep the existing users table below but simplified (read-only, no delete button).

- [ ] **Step 2: Update Header.tsx – show pending badge for admin**

In `ideen/frontend/src/components/Header.tsx`, for the Admin link, add a pending count badge. Add a useEffect to fetch pending count when user is admin:

```typescript
// Inside Header component, after existing state declarations:
const [pendingCount, setPendingCount] = useState(0);

useEffect(() => {
  if (user?.user_type === "admin" && token) {
    apiFetch<{ count: number }>("/users/pending-count", { token })
      .then((p) => setPendingCount(p.count))
      .catch(() => {});
  }
}, [user, token]);
```

In the admin nav link, add badge:

```tsx
{user?.user_type === "admin" && (
  <Link href="/admin" className="...existing classes...">
    Admin
    {pendingCount > 0 && (
      <span className="ml-1 bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
    )}
  </Link>
)}
```

- [ ] **Step 3: Commit**

```bash
git add ideen/frontend/src/app/admin/page.tsx ideen/frontend/src/components/Header.tsx
git commit -m "feat(ideen): pending user badge in admin dashboard and header"
```

---

### Task 10: Build, Deploy & Verify

- [ ] **Step 1: Rebuild ideen-backend and ideen-frontend containers**

```bash
cd /opt/mopilot && docker compose build ideen-backend ideen-frontend
```

- [ ] **Step 2: Run the migration inside the container**

```bash
docker compose up -d ideen-backend
docker exec mopilot-ideen-backend python -m alembic upgrade head
```

- [ ] **Step 3: Set existing verified users as approved**

```bash
docker exec mopilot-postgres psql -U mopilot -d mopilot_ideen -c "UPDATE users SET approved = true WHERE email_verified = true;"
```

- [ ] **Step 4: Restart all ideen services**

```bash
docker compose down ideen-backend ideen-frontend && docker compose up -d ideen-backend ideen-frontend
```

- [ ] **Step 5: Verify endpoints**

```bash
# Health check
curl -sf https://ideen.mopilot.website/api/health

# Login still works for approved users
curl -s -X POST https://ideen.mopilot.website/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mopilot.website","password":"admin2026!"}' | head -c 100

# Pending count returns 0 (all existing users approved)
TOKEN=$(curl -s -X POST https://ideen.mopilot.website/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@mopilot.website","password":"admin2026!"}' | python3 -c "import json,sys;print(json.load(sys.stdin)['access_token'])")
curl -s -H "Authorization: Bearer $TOKEN" https://ideen.mopilot.website/api/users/pending-count
```

- [ ] **Step 6: Commit all remaining changes**

```bash
git add -A
git commit -m "feat(ideen): admin approval system - users require admin approval before login"
```
