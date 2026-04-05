# MoPilot v0.8 Hotfix – Claude Code Prompt

## Kontext
Drei Probleme nach v0.8 Deployment gefunden. Diesen Prompt der Reihe nach abarbeiten.

---

## Problem 1: "Passwort vergessen?" Link zeigt auf falsche Seite

### Diagnose
Der Link auf den ZEO- und CC-Kunden Login-Seiten zeigt auf:
```
https://ideen.mopilot.website/passwort-zuruecksetzen
```
Das ist die Reset-BESTÄTIGUNGSSEITE (erwartet `?token=...` aus der E-Mail). Ohne Token zeigt sie "Ungültiger Link".

### Fix: Korrekte URL ermitteln

Schritt 1: Prüfe welche Frontend-Seiten die Ideenplattform hat:
```bash
find /opt/mopilot/ideen/frontend/src/app -type d | sort
ls /opt/mopilot/ideen/frontend/src/app/
```

Schritt 2: Suche nach der "Passwort vergessen"-Anforderungsseite (wo User E-Mail eingibt):
```bash
grep -r "forgot-password\|passwort.*vergessen\|Passwort vergessen\|E-Mail.*reset\|Reset.*anfordern" \
  /opt/mopilot/ideen/frontend/src/ --include="*.tsx" --include="*.ts" -l
```

Schritt 3: Prüfe die Login-Seite der Ideenplattform auf "Vergessen"-Links:
```bash
cat /opt/mopilot/ideen/frontend/src/app/login/page.tsx
```

Schritt 4: Prüfe das Backend für den forgot-password Endpunkt:
```bash
grep -n "forgot.password\|reset.password\|passwort" /opt/mopilot/ideen/backend/app/routers/auth.py
```

### Fix anwenden

Es gibt zwei mögliche Szenarien:

**Szenario A:** Es gibt eine separate Anforderungsseite (z.B. `/passwort-vergessen` oder `/forgot-password`):
→ Ändere den Link in beiden Login-Seiten auf diese URL.

**Szenario B:** Die `/passwort-zuruecksetzen`-Seite hat einen "Neuen Link anfordern"-Modus wenn kein Token vorhanden:
→ Prüfe ob der "Neuen Link anfordern"-Button auf dem Screenshot funktioniert. Falls ja, könnte der aktuelle Link OK sein, er muss nur auf den "Neuen Link anfordern"-Flow zeigen.

**Szenario C (wahrscheinlichstes):** Es gibt KEINE separate Anforderungsseite. Die Ideenplattform zeigt "Passwort vergessen?" als Link auf der eigenen `/login`-Seite, der einen Modal/Inline-Form öffnet oder direkt zu einer Seite navigiert, die den `POST /api/auth/forgot-password` Endpunkt aufruft.

→ In diesem Fall: Erstelle auf der `/passwort-zuruecksetzen`-Seite einen Zustand für "kein Token vorhanden", der ein E-Mail-Eingabeformular zeigt und `POST /api/auth/forgot-password` aufruft.

**ODER** (einfachste Lösung): Ändere den Link auf den ZEO/CC Login-Seiten zu:
```
https://ideen.mopilot.website/login
```
mit dem Hinweis "Nutzen Sie 'Passwort vergessen?' auf der Ideenplattform".

### Dateien anpassen

Nachdem du die korrekte URL ermittelt hast, ändere sie in BEIDEN Dateien:

1. `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/login/page.tsx`
2. `/opt/mopilot/cc-kunden/frontend/src/app/login/page.tsx`

Suche nach:
```tsx
href="https://ideen.mopilot.website/passwort-zuruecksetzen"
```
Ersetze mit der korrekten URL.

### Neu bauen und deployen

```bash
# Shared UI sync
bash /opt/mopilot/sync-shared-ui.sh

# ZEO-Kunden
rsync -av --delete --exclude .env --exclude node_modules --exclude __pycache__ --exclude .next \
  /opt/mopilot/MoPilot_ZEO_Kunden/ /opt/zeo-kunden/
cd /opt/zeo-kunden && docker compose down && docker compose up -d --build

# CC-Kunden
rsync -av --delete --exclude .env --exclude node_modules --exclude __pycache__ --exclude .next \
  /opt/mopilot/cc-kunden/ /opt/cc-kunden/
cd /opt/cc-kunden && docker compose down && docker compose up -d --build
```

**STOP-PUNKT:** Teste den "Passwort vergessen?"-Link auf zeo-kunden.mopilot.website/login.

---

## Problem 2: Login mit tom15@pydna.de scheitert

### Diagnose

Schritt 1: Prüfe ob der User in der mopilot_ideen-DB existiert:
```bash
docker exec -i postgres-ns8wok04s4sgkcggwg48okcg psql -U mopilot mopilot_ideen -c \
  "SELECT id, email, name, email_verified, user_type, role_id FROM users WHERE email = 'tom15@pydna.de';"
```

Schritt 2: Prüfe ob der User in der mopilot-DB existiert (hier prüft ZEO das Login):
```bash
docker exec -i postgres-ns8wok04s4sgkcggwg48okcg psql -U mopilot mopilot -c \
  "SELECT id, email, name, role, operator, is_active FROM users WHERE email = 'tom15@pydna.de';"
```

Schritt 3: Prüfe die Rollen-Zuordnung:
```bash
docker exec -i postgres-ns8wok04s4sgkcggwg48okcg psql -U mopilot mopilot_ideen -c \
  "SELECT u.email, r.slug, r.name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = 'tom15@pydna.de';"
```

### Mögliche Ursachen und Fixes

**Fall A: User existiert in mopilot_ideen aber NICHT in mopilot:**
→ E-Mail nicht verifiziert (`email_verified = false`), oder Sync ist beim Verifizieren fehlgeschlagen.
→ Fix: Manuell synchronisieren:
```bash
docker exec -i postgres-ns8wok04s4sgkcggwg48okcg psql -U mopilot mopilot_ideen -c \
  "UPDATE users SET email_verified = true WHERE email = 'tom15@pydna.de';"
```
Dann den Sync manuell auslösen:
```bash
docker exec ideen-backend python3 -c "
from app.user_sync import sync_user_to_mopilot
from app.database import SessionLocal
from app.models import User, Role
db = SessionLocal()
user = db.query(User).filter(User.email == 'tom15@pydna.de').first()
if user:
    role = db.query(Role).filter(Role.id == user.role_id).first()
    role_slug = role.slug if role else None
    print(f'User: {user.email}, Role: {role_slug}, Verified: {user.email_verified}')
    result = sync_user_to_mopilot(user.email, user.name, user.password_hash, role_slug)
    print(f'Sync result: {result}')
else:
    print('User not found in ideen DB')
db.close()
"
```

**Fall B: User existiert in beiden DBs, aber Passwort-Hash unterschiedlich:**
→ Passwort wurde auf einer Plattform geändert, Sync fehlgeschlagen.
→ Fix: Hash aus mopilot_ideen in mopilot kopieren:
```bash
docker exec -i postgres-ns8wok04s4sgkcggwg48okcg psql -U mopilot -c "
UPDATE mopilot.users SET hashed_password = (
  SELECT password_hash FROM mopilot_ideen.users WHERE email = 'tom15@pydna.de'
) WHERE email = 'tom15@pydna.de';
"
```

**Fall C: User existiert in keiner DB:**
→ Muss sich erst auf ideen.mopilot.website/register registrieren.

### Verifizierung
```bash
# Nochmal beide DBs prüfen
docker exec -i postgres-ns8wok04s4sgkcggwg48okcg psql -U mopilot mopilot -c \
  "SELECT email, name, role, is_active FROM users WHERE email = 'tom15@pydna.de';"
```

Dann Login auf zeo-kunden.mopilot.website testen.

---

## Problem 3: Coolify Sentinel "Out Of Sync"

### Diagnose
```bash
# Sentinel-Status prüfen
docker ps | grep sentinel

# Sentinel-Logs prüfen
docker logs coolify-sentinel --tail 30 2>&1
```

### Fix

Variante A – Über Coolify UI:
→ Auf dem Screenshot ist ein "Sync"-Button neben "Out Of Sync" sichtbar. Klicke "Sync".

Variante B – Per Kommandozeile:
```bash
# Sentinel neustarten
docker restart coolify-sentinel

# Warten und Status prüfen
sleep 10
docker ps | grep sentinel
docker logs coolify-sentinel --tail 10 2>&1
```

Variante C – Falls Sync weiterhin fehlschlägt:
```bash
# Sentinel-Container komplett neu erstellen
docker stop coolify-sentinel && docker rm coolify-sentinel

# Coolify wird den Sentinel automatisch neu erstellen wenn man in der UI "Sync" klickt
# Alternativ: Server-Seite in Coolify UI → Save → Sync
```

**Hinweis:** Coolify Sentinel "Out Of Sync" ist meist unkritisch und betrifft nicht die laufenden Services. Es bedeutet nur, dass der Monitoring-Agent nicht mit der Coolify-Instanz synchron ist. Die MoPilot-Services laufen unabhängig davon.

---

## Abschluss

### Health-Check
```bash
bash /opt/mopilot/scripts/health-check-all.sh
```

### Git Commit (nur wenn Dateien geändert wurden)
```bash
cd /opt/mopilot
git add -A
git diff --cached --stat
# Nur committen wenn tatsächlich Änderungen vorliegen:
git commit -m "v0.8.1: Hotfix Passwort-vergessen Link, User-Sync manuell, Sentinel Sync"
git push origin master
```

### Abschlussbericht
Melde:
1. Passwort-vergessen: Welche URL ist korrekt? Funktioniert der Flow?
2. tom15@pydna.de: In welcher DB fehlte der User? Was war die Ursache?
3. Coolify Sentinel: Sync erfolgreich?
