# MoPilot v0.8 Update – Claude Code Prompt

## Kontext
Du arbeitest auf dem MoPilot-Server (142.132.232.211). Die Patch-Dateien liegen unter `/opt/mopilot/v0.8_patches/`. Führe die folgenden Phasen **der Reihe nach** aus. Nach jeder Phase: Ergebnis prüfen und erst dann weitermachen.

## Phase 0: Backup und Diagnose

### 0.1 Backup erstellen
```bash
cd /opt/mopilot
git stash 2>/dev/null
git tag -a v0.74-pre-v0.8 -m "Backup vor v0.8 Update" 2>/dev/null || echo "Tag existiert bereits"
```

### 0.2 Health-Check VOR Update
```bash
bash /opt/mopilot/scripts/health-check-all.sh
```

### 0.3 PostgreSQL-Container identifizieren
```bash
POSTGRES_CONTAINER=$(docker ps --format '{{.Names}}' | grep postgres)
echo "PostgreSQL-Container: $POSTGRES_CONTAINER"
```
**Merke dir den Container-Namen** – er wird in Phase 1 benötigt.

---

## Phase 1: User-Sync reparieren (KRITISCH)

### 1.1 Konnektivität testen
Führe folgenden Test aus – ersetze ggf. den Container-Namen:
```bash
docker exec ideen-backend python3 -c "
import psycopg2
try:
    c = psycopg2.connect('postgresql://mopilot:mopilot_secret_2026@postgres-ns8wok04s4sgkcggwg48okcg:5432/mopilot', connect_timeout=5)
    cur = c.cursor()
    cur.execute('SELECT COUNT(*) FROM users')
    print(f'OK - {cur.fetchone()[0]} users in mopilot DB')
    c.close()
except Exception as e:
    print(f'FEHLER: {e}')
"
```

Falls der Test FEHLER zeigt:
- Prüfe ob der Container-Name korrekt ist (nutze den aus Phase 0.3)
- Prüfe das Docker-Netzwerk: `docker network inspect coolify | grep -A5 ideen`
- Falls der Name anders ist: Passe die Variable `MOPILOT_DB_URL` in der Patch-Datei an

### 1.2 user_sync.py ersetzen
```bash
# Backup
cp /opt/mopilot/ideen/backend/app/user_sync.py /opt/mopilot/ideen/backend/app/user_sync.py.bak

# Aktuelle Datei lesen und verstehen
cat /opt/mopilot/ideen/backend/app/user_sync.py
```

Jetzt lies die Patch-Datei `/opt/mopilot/v0.8_patches/02_user_sync_debug.py` und wende die Verbesserungen auf die bestehende `user_sync.py` an:

**Wichtige Änderungen:**
1. Füge die Funktion `test_mopilot_db_connection()` hinzu (DB-Konnektivitätstest)
2. Erweitere `sync_user_to_mopilot()` um differenziertes Logging:
   - `logger.info()` bei Start und Erfolg jedes Sync-Vorgangs
   - `psycopg2.errors.InvalidTextRepresentation` separat fangen (ENUM-Fehler)
   - `psycopg2.OperationalError` separat fangen (Verbindungsfehler)
3. Stelle sicher, dass der PostgreSQL-Container-Name korrekt ist (aus Phase 0.3)
4. Stelle sicher, dass das ROLE_MAPPING alle 11 Rollen enthält inkl. `"mopilot-team": "MOPILOT_TEAM"`

**KRITISCH:** Ändere NICHT die SQL-Logik (INSERT ON CONFLICT DO UPDATE). Ändere nur das Logging und die Fehlerbehandlung.

### 1.3 Ideen-Backend neu starten
```bash
cd /opt/mopilot/ideen
docker compose down
docker compose up -d --build
```

### 1.4 Warten und Logs prüfen
```bash
sleep 15
docker ps | grep ideen
docker logs ideen-backend --tail 30 2>&1 | grep -i "sync\|error\|start"
```

### 1.5 Sync-Test
```bash
# DB-Verbindung vom neuen Container aus testen
docker exec ideen-backend python3 -c "
from app.user_sync import test_mopilot_db_connection
test_mopilot_db_connection()
"
```

**STOP-PUNKT:** Melde das Ergebnis. Sync muss funktionieren, bevor du weitermachst.

---

## Phase 2: ZEO-Kunden Login-Seite

### 2.1 Aktuelle Login-Seite lesen
```bash
cat /opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/login/page.tsx
```

### 2.2 Login-Seite ersetzen
Ersetze die Datei mit dem Inhalt von `/opt/mopilot/v0.8_patches/01_zeo_kunden_login_page.tsx`:
```bash
cp /opt/mopilot/v0.8_patches/01_zeo_kunden_login_page.tsx \
   /opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/login/page.tsx
```

**Prüfe dabei:** Vergleiche die bestehende Login-Logik (handleSubmit, fetch URL, localStorage-Keys) mit dem Patch. Falls die bestehende Datei andere fetch-URLs, andere State-Variablen oder andere Redirect-Pfade verwendet, passe den Patch entsprechend an, sodass die Geschäftslogik erhalten bleibt. Die neuen Elemente sind NUR:
- `<a href="https://ideen.mopilot.website/passwort-zuruecksetzen">Passwort vergessen?</a>`
- `<a href="https://ideen.mopilot.website/register">Noch kein Konto? Jetzt registrieren</a>`

### 2.3 Shared UI synchronisieren
```bash
bash /opt/mopilot/sync-shared-ui.sh
```

### 2.4 rsync und Build
```bash
rsync -av --delete \
  --exclude .env \
  --exclude node_modules \
  --exclude __pycache__ \
  --exclude .next \
  /opt/mopilot/MoPilot_ZEO_Kunden/ /opt/zeo-kunden/

cd /opt/zeo-kunden
docker compose down
docker compose up -d --build
```

### 2.5 Verifizierung
```bash
sleep 20
curl -s https://zeo-kunden.mopilot.website/login | grep -c "Passwort vergessen"
curl -s https://zeo-kunden.mopilot.website/api/health
```
Erwartung: `1` (gefunden) und `{"status":"ok"}`

---

## Phase 3: CC-Kunden Login-Seite

### 3.1 Aktuelle Login-Seite lesen
```bash
cat /opt/mopilot/cc-kunden/frontend/src/app/login/page.tsx
```

### 3.2 Login-Seite ersetzen
```bash
cp /opt/mopilot/v0.8_patches/01b_cc_kunden_login_page.tsx \
   /opt/mopilot/cc-kunden/frontend/src/app/login/page.tsx
```

**Gleiche Prüfung wie bei ZEO:** Geschäftslogik (fetch, localStorage, Redirect) muss mit der bestehenden übereinstimmen. Nur die zwei Links werden hinzugefügt.

### 3.3 rsync und Build
```bash
rsync -av --delete \
  --exclude .env \
  --exclude node_modules \
  --exclude __pycache__ \
  --exclude .next \
  /opt/mopilot/cc-kunden/ /opt/cc-kunden/

cd /opt/cc-kunden
docker compose down
docker compose up -d --build
```

### 3.4 Verifizierung
```bash
sleep 20
curl -s https://cc-kunden.mopilot.website/login | grep -c "Passwort vergessen"
curl -s https://cc-kunden.mopilot.website/api/health
```

---

## Phase 4: Dashboard mit Vianova-Beispiel

### 4.1 Bild prüfen
```bash
ls -la /opt/mopilot/frontend/public/images/260405_BeispielCCfuhrpark_dashboard.jpg
```
Falls nicht vorhanden: Das Bild muss vorher per SCP hochgeladen werden (siehe 01_UPLOAD_ZUM_SERVER.bat).

### 4.2 Dashboard-Datei lesen
```bash
cat /opt/mopilot/frontend/app/dashboard/page.tsx
```

### 4.3 Vianova-Block einfügen
Lies die Patch-Datei `/opt/mopilot/v0.8_patches/03_dashboard_vianova_example.tsx` und füge den JSX-Block in die Dashboard-Seite ein.

**Einfügeposition:** NACH der Begrüßung (suche nach dem `<h1>` mit "Willkommen" oder der Begrüßungszeile) und VOR dem bestehenden Chat- oder Content-Bereich.

Der einzufügende Block:
```tsx
{/* Beispiel Vianova Fahrzeugverwaltung */}
<div className="mt-8 mb-8">
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-warm-lg border border-surface-200/50 overflow-hidden hover:shadow-warm-xl transition-shadow duration-300">
    <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-primary-100/50 border-b border-surface-200/50">
      <h2 className="text-xl font-display font-semibold text-primary-800">
        Beispiel: Vianova Fahrzeugverwaltung
      </h2>
      <p className="text-sm text-surface-600 font-body mt-1">
        Das CC Fuhrpark Dashboard zeigt, wie digitale Fuhrparkverwaltung für Carsharing-Genossenschaften funktioniert.
      </p>
    </div>
    <div className="p-6">
      <a href="https://ccfuhrpark.vianova.website/" target="_blank" rel="noopener noreferrer" className="block group">
        <div className="rounded-xl overflow-hidden border border-surface-200 shadow-warm-sm group-hover:shadow-warm-md transition-shadow duration-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/260405_BeispielCCfuhrpark_dashboard.jpg"
            alt="CC Fuhrpark Dashboard – Fahrzeugverwaltung mit Terminen, Schäden und Live-Karte"
            className="w-full h-auto object-cover"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-body text-surface-600">
            Fahrzeuge, Termine, Schäden und Stationen – alles in einem Dashboard.
          </p>
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-warm-sm group-hover:shadow-warm-md group-hover:from-primary-700 group-hover:to-primary-800 transition-all duration-200 whitespace-nowrap">
            Dashboard öffnen
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        </div>
      </a>
    </div>
  </div>
</div>
```

### 4.4 Hauptsystem-Frontend neu bauen
```bash
bash /opt/mopilot/sync-shared-ui.sh

cd /data/coolify/services/ns8wok04s4sgkcggwg48okcg
docker compose build frontend
docker compose up -d frontend
```

### 4.5 Verifizierung
```bash
sleep 25
curl -s https://mopilot.website/dashboard | grep -c "Vianova"
curl -s https://mopilot.website/api/health 2>/dev/null || echo "Health via Coolify"
```

---

## Phase 5: Abschluss

### 5.1 Gesamter Health-Check
```bash
bash /opt/mopilot/scripts/health-check-all.sh
```

### 5.2 Git Commit und Tag
```bash
cd /opt/mopilot
git add -A
git status

git commit -m "v0.8: User-Sync Fix, Login Passwort-Reset/Registrierung, Dashboard Vianova-Beispiel

- Fix: user_sync.py mit erweitertem Logging und Fehlerbehandlung
- Feature: ZEO + CC Login-Seiten mit Passwort vergessen und Jetzt registrieren Links
- Feature: Dashboard zeigt Vianova Fahrzeugverwaltung Beispiel mit Screenshot
- Bild: 260405_BeispielCCfuhrpark_dashboard.jpg in frontend/public/images/"

git tag -a v0.8 -m "v0.8: User-Sync Fix, Login Features, Dashboard Vianova"
git push origin master --tags
```

### 5.3 Patches-Verzeichnis aufräumen
```bash
rm -rf /opt/mopilot/v0.8_patches
```

### 5.4 Abschlussbericht
Melde folgende Ergebnisse:
1. User-Sync: Funktioniert ja/nein + ggf. was das Problem war
2. ZEO Login: Links sichtbar ja/nein
3. CC Login: Links sichtbar ja/nein
4. Dashboard: Vianova-Abschnitt sichtbar ja/nein
5. Health-Check: Alle Services OK ja/nein
6. Git: Tag v0.8 gepusht ja/nein
