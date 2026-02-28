# MoPilot – Projektkontext für Claude

> Zuletzt aktualisiert: 2026-02-27

## Projektbeschreibung

**MoPilot** ist ein KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum.
Prototyp v0.1 – rollenbasierte Demo mit angepasster KI-Tonalität pro Nutzerrolle.

- **Betreiber:** ZEO Carsharing (Region Bruchsal) + Car&RideSharing Community eG (cc)
- **Zweck:** Intelligenter Assistent, der Tonalität, Wissen und Funktionen an die jeweilige Nutzerrolle anpasst
- **KI-Model:** Claude Sonnet (`claude-sonnet-4-20250514`)

## Infrastruktur

| Komponente        | Details                                       |
|-------------------|-----------------------------------------------|
| Server            | Hetzner CX33 – IP: `142.132.232.211`         |
| IPv6              | `2a01:4f8:c17:b65c::1`                       |
| Deployment        | **Coolify** mit Docker Compose                |
| Coolify-Dashboard | `http://localhost:8000` (via SSH-Tunnel)      |
| Coolify Service   | `service-l0ko88csko448w8kwo0gww0k`            |
| Frontend-Domain   | `https://mopilot.website`                     |
| Backend-Domain    | `https://api.mopilot.website`                 |
| API Docs          | `https://api.mopilot.website/docs`            |
| Frontend-Stack    | **Next.js** (SSR, App Router, Node 20)        |
| Backend-Stack     | **FastAPI** (Python 3.11, Uvicorn, 2 Workers) |
| Datenbank         | **PostgreSQL 16** (Alpine)                    |
| Cache             | **Redis 7** (Alpine, 256MB)                   |
| Projektpfad lokal | `C:\Projekte\MoPilot`                         |
| Projektpfad Server| `/opt/mopilot/` (Coolify-managed)             |
| SSH-Zugang        | `ssh root@142.132.232.211` (Passwort-Auth)    |

## Docker Compose Services

| Container                           | Image/Build                    | Port | Netzwerke              |
|-------------------------------------|--------------------------------|------|------------------------|
| frontend-ns8wok04s4sgkcggwg48okcg   | /opt/mopilot/frontend          | 3000 | mopilot-net, coolify   |
| backend-ns8wok04s4sgkcggwg48okcg    | /opt/mopilot/backend           | 8000 | mopilot-net, coolify   |
| postgres-ns8wok04s4sgkcggwg48okcg   | postgres:16-alpine             | 5432 | mopilot-net            |
| redis-ns8wok04s4sgkcggwg48okcg      | redis:7-alpine                 | 6379 | mopilot-net            |

## Backend-Architektur

```
/opt/mopilot/backend/
  app/
    main.py              # FastAPI App + Startup/Seeding
    core/
      config.py          # Pydantic Settings (ENV-basiert)
      database.py        # SQLAlchemy Async Engine (asyncpg)
      seed.py            # Demo-Daten Seeding
    models/
      models.py          # SQLAlchemy Models (User, ChatMessage, Station, Vehicle, Tariff, FAQ)
    api/
      auth.py            # Login, JWT, Demo-Accounts
      chat.py            # KI-Chat (Send + SSE-Stream)
      knowledge.py       # FAQ/Wissensbasis
      stations.py        # Standorte
      vehicles.py        # Fahrzeuge
      tariffs.py         # Tarife
      users.py           # Benutzerprofil
```

### API-Endpunkte
| Endpunkt                    | Methode | Auth  | Beschreibung                    |
|-----------------------------|---------|-------|---------------------------------|
| `/api/auth/login`           | POST    | Nein  | Login (Email + Passwort)        |
| `/api/auth/me`              | GET     | JWT   | Aktueller User                  |
| `/api/auth/demo-accounts`   | GET     | Nein  | Liste aller Demo-Accounts       |
| `/api/chat/send`            | POST    | JWT   | KI-Nachricht (non-streaming)    |
| `/api/chat/stream`          | POST    | JWT   | KI-Nachricht (SSE-Stream)       |
| `/api/knowledge/`           | GET     | Nein  | FAQ-Liste                       |
| `/api/knowledge/{topic}`    | GET     | Nein  | Wissen zu Thema                 |
| `/api/stations/`            | GET     | Nein  | Standort-Liste                  |
| `/api/vehicles/`            | GET     | Nein  | Fahrzeug-Liste                  |
| `/api/tariffs/`             | GET     | Nein  | Tarif-Liste                     |
| `/api/users/profile`        | GET     | JWT   | Benutzerprofil                  |
| `/api/health`               | GET     | Nein  | Health-Check                    |

## Rollen-System (10 Rollen in 3 Kategorien)

### Kundennah
| Rolle         | Email                           | Beschreibung                      |
|---------------|---------------------------------|-----------------------------------|
| Endkunde      | endkunde@mopilot.website        | Buchung, FAQs, Standorte          |
| Stationspate  | stationspate@mopilot.website    | Standortbetreuung, Meldungen      |
| Hotline       | hotline@mopilot.website         | Gesprächsleitfaden, Kundenhilfe   |

### Betrieb
| Rolle             | Email                           | Beschreibung                      |
|-------------------|---------------------------------|-----------------------------------|
| Betreiber         | betreiber@mopilot.website       | Dashboard, Kennzahlen, Strategie  |
| Flottenmanagement | flotte@mopilot.website          | Fahrzeuge, Wartung, Zuweisung     |
| Fahrzeugbetreuer  | fahrzeug@mopilot.website        | Zustandsprüfung, Laden            |
| Plattform-Support | support@mopilot.website         | Technik, Tickets, Systeme         |

### Strategie
| Rolle              | Email                           | Beschreibung                      |
|--------------------|---------------------------------|-----------------------------------|
| Projektträger      | traeger@mopilot.website         | KPIs, Förderung, Strategie        |
| Fahrzeugsteller    | steller@mopilot.website         | Fahrzeugintegration, Verträge     |
| Validierungsstelle | validierung@mopilot.website     | Führerscheinprüfung, Dokumente    |

### CC-Operator Accounts
| Rolle    | Email                           |
|----------|---------------------------------|
| Endkunde | endkunde-cc@mopilot.website     |
| Betreiber| betreiber-cc@mopilot.website    |

## Demo-Zugang

- **Passwort für alle Accounts:** `mopilot2026`
- Login erfolgt über Rollenauswahl auf der Startseite oder via API
- JWT-Token wird bei Login zurückgegeben (8h gültig)

## Aktueller Status (2026-02-27)

| Service              | Status | Details                                              |
|----------------------|--------|------------------------------------------------------|
| Frontend             | ✅ OK  | Next.js App antwortet korrekt                        |
| Backend/API          | ✅ OK  | FastAPI läuft, Swagger UI unter /docs erreichbar     |
| Demo-Login           | ✅ OK  | Login mit endkunde@mopilot.website funktioniert      |
| Postgres             | ✅ OK  | Healthy, Seeding erfolgreich                         |
| Redis                | ✅ OK  | Läuft                                                |

## Behobene Probleme (2026-02-27)

1. **`asyncpg` fehlte** in requirements.txt – hinzugefügt (`asyncpg==0.29.0`)
2. **`bcrypt`-Inkompatibilität** mit passlib – gefixt durch `bcrypt==4.0.1`
3. **DNS-Konflikt**: Doppelter Postgres-Service verursachte falsches DNS-Routing – Duplikat-Service gestoppt
4. **DATABASE_URL**: Muss vollen Container-Namen nutzen (`postgres-ns8wok04s4sgkcggwg48okcg` statt `postgres`) wegen Coolify-Netzwerk
5. **Tariff VARCHAR(20)** zu kurz – auf VARCHAR(50) erweitert in models.py
6. **Port nicht exposed**: `expose: ["8000"]` in Compose-Datei hinzugefügt

## Wichtige Hinweise für zukünftige Sessions

- **Coolify überschreibt ENV-Variablen** aus seiner DB – Änderungen an docker-compose.yml auf dem Server werden ignoriert, Edit muss in Coolify UI erfolgen
- **Zweiter Service** (`service-tkokw440w4040ogw0o0w4cg4`) ist ein Duplikat und sollte gestoppt bleiben
- **Dritter Postgres** (`postgresql-bog0swkc88g084c8ocwkg0go`) gehört zu n8n – nicht löschen
- Bei Problemen mit Postgres-Verbindung: Immer prüfen ob DNS `postgres` auf den richtigen Container zeigt
- SSH-Passwort wird benötigt (kein Key-Auth vom lokalen Rechner)

## Umgebungsvariablen (Backend)

| Variable            | Wert/Beschreibung                                                     |
|---------------------|-----------------------------------------------------------------------|
| DATABASE_URL        | `postgresql+asyncpg://mopilot:mopilot_secret_2026@postgres-ns8wok04...:5432/mopilot` |
| REDIS_URL           | `redis://redis:6379/0`                                                |
| ANTHROPIC_API_KEY   | Über Coolify ENV gesetzt (nicht im Code)                              |
| SECRET_KEY          | JWT-Secret (Coolify ENV)                                              |
| CORS_ORIGINS        | `https://mopilot.website,https://api.mopilot.website`                |
| ENVIRONMENT         | `production`                                                          |
| CLAUDE_MODEL        | `claude-sonnet-4-20250514`                                            |
