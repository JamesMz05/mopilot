# MoPilot
**KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum**
**Prototyp v1.0**   Datum: 6. April 2026

MoPilot Projektlaufzeit
01.01.2026 – 31.07.2027
Projektpartner
Vianova eG, Reboot Mobility GmbH, Regionale Wirtschaftsförderung Bruchsal GmbH, Hochschule Bonn-Rhein-Sieg
Projektförderer: 
Bundesministerium für Landwirtschaft, Ernährung und Heimat (BMLEH)

Carsharing Projekte: ZEO Carsharing (Region Bruchsal) | Car&RideSharing Community eG (cc)
---

## Inhaltsverzeichnis

1. Zusammenfassung
2. IT-Umfeld
   - 2.1 Genutzte Werkzeuge und Technologien
   - 2.2 Server-Infrastruktur
   - 2.3 Admin und Deployment
   - 2.4 IT-Übersichtsgrafik
   - 2.5 IT-Detailgrafik
3. Deployment-Prozess (CI/CD)
   - 3.1 Übersicht
   - 3.2 Komponenten der Pipeline
   - 3.3 Ablauf eines Deployments
   - 3.4 GitHub Actions Workflow
   - 3.5 Deployment-Diagramm
4. Infrastruktur-Stabilisierung (v0.5)
   - 4.1 Analysierte Probleme
   - 4.2 Durchgeführte Maßnahmen
   - 4.3 Ergebnis
5. Bugfixes und Sicherheitsupdates (v0.6)
   - 5.1 502 Bad Gateway – ZEO-Kunden Frontend
   - 5.2 Next.js Sicherheitsupdate (14.1.0 → 14.2.35)
   - 5.3 Docker Health-Checks für alle Container
   - 5.4 ZEO-Kunden Login-Credentials
   - 5.5 UI-Anpassungen Hauptsystem
   - 5.6 Ergebnis
6. Monitoring mit Uptime Kuma (v0.6)
   - 6.1 Übersicht
   - 6.2 Installation
   - 6.3 Konfigurierte Monitore
   - 6.4 Status-Seite
   - 6.5 Zugang
7. MoPilot Ideenplattform – NEU in v0.7
   - 7.1 Projektbeschreibung und Funktionsumfang
   - 7.2 Technische Architektur
   - 7.3 Datenbank-Modelle (mopilot_ideen)
   - 7.4 API-Endpunkte
   - 7.5 Rollen und Zugriffskontrolle
   - 7.6 E-Mail-Service (SMTP)
   - 7.7 Docker Compose und Traefik-Routing
   - 7.8 Frontend
   - 7.9 Serverpfade und Dateien
8. Benutzerverwaltung und Authentifizierung – NEU in v0.7
   - 8.1 Übersicht: Plattformübergreifende Authentifizierung
   - 8.2 Registrierung (zentral über Ideenplattform)
   - 8.3 E-Mail-Verifizierung und Passwort-Reset
   - 8.4 User-Sync (Ideenplattform → mopilot DB)
   - 8.5 Login auf mopilot.website (Real Auth + Demo-Fallback)
   - 8.6 Login auf zeo-kunden.mopilot.website (Backend-Proxy)
   - 8.7 Middleware und Cookie-basierter Zugangschutz
   - 8.8 Header-Anzeige des eingeloggten Users
   - 8.9 JWT-Token und Passwort-Hashing
   - 8.10 Demo-Accounts (Seeded Users)
   - 8.11 Zusammenfassung: Auth-Architektur-Diagramm
9. ZEO Kundenassistent – Entwicklung und Deployment
   - 9.1 Projektbeschreibung und Ziel
   - 9.2 Technische Architektur
   - 9.3 Entwicklungsprozess
   - 9.4 Deployment-Ablauf
   - 9.5 Live-System
10. Benutzerverwaltung, Bugfixes und E-Mail-Optimierung – NEU in v0.71
    - 10.1 Übersicht der Änderungen
    - 10.2 Bugfix: User-Sync bei Passwort-Reset (UPSERT statt UPDATE)
    - 10.3 Navigation: Hauptmenü als Startseite
    - 10.4 Login/Logout auf mopilot.website
    - 10.5 Admin-Seite: Benutzerverwaltung
    - 10.6 Neue Rolle: MOPILOT_TEAM
    - 10.7 Admin-User-Synchronisierung (Ideen → mopilot DB)
    - 10.8 E-Mail-Zustellbarkeit verbessert
    - 10.9 DNS-Härtung (DKIM, DMARC)
    - 10.10 Geänderte Dateien
11. CC Kundenassistent – NEU in v0.72
    - 11.1 Projektbeschreibung und Ziel
    - 11.2 Betreiber: Car&RideSharing Community eG
    - 11.3 Technische Architektur
    - 11.4 API-Proxy-Pattern (Next.js Rewrites)
    - 11.5 Frontend-Module und Branding
    - 11.6 Docker Compose Konfiguration
    - 11.7 Live-System und Serverpfade
    - 11.8 Unterschiede zu ZEO Kundenassistent
12. API-Key-Verwaltung und Secrets-Management – NEU in v0.72
    - 12.1 Einheitliches Pattern für alle Projekte
    - 12.2 Regeln für docker-compose.yml
    - 12.3 Bekannte Fallstricke
    - 12.4 Checkliste für neue Sub-Projekte
13. UI/UX-Redesign & Shared Design System – NEU in v0.73
    - 13.1 Übersicht und Motivation
    - 13.2 Shared Design System (shared-ui)
    - 13.3 Tailwind-Preset und Farbpalette
    - 13.4 Typografie
    - 13.5 Phasen-Übersicht des Redesigns
    - 13.6 Geänderte Dateien
    - 13.7 Build-Workflow mit sync-shared-ui.sh
14. Stationen & Fahrzeuge Live-Dashboard – NEU in v0.73+
15. CC-Kunden Monorepo-Integration & Bugfix – NEU in v0.74
    - 15.1 Übersicht
    - 15.2 CC-Kunden ins Git-Monorepo aufgenommen
    - 15.3 Aktualisierte Pfadstruktur
    - 15.4 Bugfix: MOPILOT_TEAM Enum wiederhergestellt
    - 15.5 Auswirkungen auf Deployment
    - 15.6 Geänderte Dateien
16. User-Sync Fix, Login Self-Service & Dashboard Vianova – NEU in v0.8
17. Hotfix v0.8.1 – Login-Route Fix & Passwort-Link Korrektur
18. Rollenspezifische Dashboards & Landing Page – NEU in v0.9
    - 18.1 Übersicht der Änderungen
    - 18.2 Landing Page: Öffentliche Startseite mit Rollenkarten
    - 18.3 Login: Nur DB-Auth, kein Demo-Login
    - 18.4 Dashboard-Layout mit KI-Chat und Sidebar
    - 18.5 10 rollenspezifische Dashboard-Seiten
    - 18.6 Middleware: Landing Page öffentlich
    - 18.7 Geänderte Dateien
19. Infrastruktur-Vereinheitlichung – NEU in v1.0
    - 19.1 Motivation
    - 19.2 Lösung: Einheitliches Docker Compose Monorepo
    - 19.3 Neue Architektur
    - 19.4 CI/CD Pipeline (vereinfacht)
    - 19.5 Migration
    - 19.6 Entfernte Dateien
    - 19.7 Geänderte Dateien

---

## 1. Zusammenfassung

MoPilot ist ein KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum. Der Prototyp v1.0 erweitert v0.9 um eine **vereinheitlichte Infrastruktur**: ein zentrales `docker-compose.yml` für alle 10 Services, eine zentrale `.env`-Datei, shared-ui via Docker Build-Stage (kein Sync-Script mehr), vereinfachte CI/CD-Pipeline ohne rsync, und Coolify auf Traefik-Proxy-Rolle reduziert. Alle v0.9-Features bleiben erhalten: rollenspezifische Dashboards, KI-Chat, Landing Page, DB-Authentifizierung.

### Projektkontext

E-Carsharing im ländlichen Raum steht vor besonderen Herausforderungen: geringe Bevölkerungsdichte, weite Entfernungen und heterogene Nutzergruppen. MoPilot adressiert diese Herausforderungen durch einen KI-Assistenten auf Basis von Anthropics Claude (Sonnet), der als zentrale Schnittstelle zwischen Nutzern, Betreibern und strategischen Partnern fungiert.

### Betreiber

- **ZEO Carsharing**: Region Bruchsal – primärer Betreiber
- **Car&RideSharing Community eG (cc)**: Genossenschaftliches Modell in Overath/Oberbergischer Kreis – Zweitbetreiber

### Plattformen

| Plattform | URL | Funktion |
|-----------|-----|----------|
| MoPilot Hauptsystem | https://mopilot.website | Rollenbasiertes Demo-Cockpit mit KI-Chat |
| MoPilot Ideenplattform | https://ideen.mopilot.website | Ideen, Bewertungen, Kommentare, Admin |
| ZEO Kundenassistent | https://zeo-kunden.mopilot.website | KI-Chat für ZEO-Endkunden |
| CC Kundenassistent | https://cc-kunden.mopilot.website | KI-Chat für CC-Endkunden |

### Zugangschutz (aktualisiert in v0.7)

Alle Plattformen sind durch Login geschützt. Es gibt zwei Zugangsarten:

| Methode | Beschreibung | Gilt für |
|---------|-------------|----------|
| **E-Mail/Passwort** | Echte Authentifizierung gegen mopilot-Backend | Alle 4 Plattformen |
| ~~Demo-Login~~ | ~~Benutzername `mopilot` / Passwort `mopilot2027`~~ | ~~Nur mopilot.website~~ – **Entfernt in v0.9** |

Neue Benutzer registrieren sich auf **ideen.mopilot.website/register** und können sich nach Verifizierung mit denselben Zugangsdaten auf allen Plattformen anmelden (User-Sync, kein SSO — separater Login pro Plattform erforderlich).

### Rollensystem

Der Prototyp implementiert 10 verschiedene Nutzerrollen in 3 Kategorien. Jede Rolle erhält einen individuell angepassten KI-Kontext:

| Kategorie | Rolle | Slug | E-Mail (Demo) | Beschreibung |
|-----------|-------|------|----------------|--------------|
| Kundennah | Endkunde | endkunde | endkunde@mopilot.website | Buchung, FAQs, Standorte |
| | Stationspate | stationspate | stationspate@mopilot.website | Standortbetreuung, Meldungen |
| | Hotline | hotline | hotline@mopilot.website | Gesprächsleitfaden, Kundenhilfe |
| Betrieb | Betreiber | betreiber | betreiber@mopilot.website | Dashboard, Kennzahlen, Strategie |
| | Flottenmanagement | flottenmanagement | flotte@mopilot.website | Fahrzeuge, Wartung, Zuweisung |
| | Fahrzeugbetreuer | fahrzeugbetreuer | fahrzeug@mopilot.website | Zustandsprüfung, Laden |
| | Plattform-Support | plattform-support | support@mopilot.website | Technik, Tickets, Systeme |
| Strategie | Projektträger | projekttraeger | traeger@mopilot.website | KPIs, Förderung, Strategie |
| | Fahrzeugsteller | fahrzeugsteller | steller@mopilot.website | Fahrzeugintegration, Verträge |
| | Validierungsstelle | validierungsstelle | validierung@mopilot.website | Führerscheinprüfung, Dokumente |

### Funktionsumfang v0.9 / v1.0

**Neu in v1.0 (Infrastruktur-Vereinheitlichung)**
- Zentrales `docker-compose.yml` für alle 10 Services (statt 4 separate Compose-Dateien)
- Zentrale `.env`-Datei mit klaren Prefixen (MAIN_, IDEEN_, ZEO_, CC_)
- Shared-UI via Docker Build-Stage (kein `sync-shared-ui.sh` mehr)
- Vereinfachte CI/CD-Pipeline: `git pull && docker compose build && docker compose up -d`
- Coolify auf Traefik-Proxy-Rolle reduziert (kein Service-Management mehr)
- Runtime-Verzeichnisse `/opt/zeo-kunden/` und `/opt/cc-kunden/` entfallen

**Neu in v0.9 (Rollenspezifische Dashboards & Landing Page)**
- Öffentliche Landing Page mit Rollenkarten (klickbar → Dashboard) und Logout-Button
- Login nur noch per E-Mail/Passwort (DB-Auth), Demo-Login entfernt
- Login leitet nach Erfolg zur Landing Page weiter (statt direkt zum Dashboard)
- Gemeinsames Dashboard-Layout (`layout.tsx`) mit Header, KI-Chat-Bereich und Sidebar
- 10 rollenspezifische Dashboard-Unterseiten (`/dashboard/endkunde`, `/dashboard/betreiber`, etc.)
- Jede Rolle hat individuelle Schnellaktionen im Sidebar
- `/dashboard` leitet automatisch zur rollenspezifischen URL weiter
- Willkommenstext zeigt Seitenname der aktuellen Rolle
- Middleware erlaubt Landing Page (`/`) als öffentlichen Pfad

**Neu in v0.74 (Monorepo-Integration & Bugfix)**
- CC-Kunden ins Git-Monorepo aufgenommen: Quellcode unter `cc-kunden/` versioniert (war bisher nur auf dem Server unter `/opt/cc-kunden/`)
- Bugfix: MOPILOT_TEAM Enum in `UserRole` wiederhergestellt (war durch `git reset --hard` verloren gegangen)
- Serverpfade aktualisiert: CC-Kunden Git-Quelle nun `/opt/mopilot/cc-kunden/`, laufende Instanz weiterhin `/opt/cc-kunden/`
- Deployment-Dokumentation aktualisiert für CC-Kunden (rsync-Pattern analog zu ZEO-Kunden möglich)
- CLAUDE.md-Infrastruktur-Notizen erweitert

**Neu in v0.73 (UI/UX-Redesign & Shared Design System)**
- Shared Design System: Tailwind-Preset mit Petrol/Teal-Primärfarbe (#0F766E), Amber-Akzent (#F59E0B), warme Neutraltöne (surface-*), Plus Jakarta Sans (Display) + DM Sans (Body)
- sync-shared-ui.sh: Shell-Script kopiert Design-System-Dateien vor jedem Docker-Build in alle Frontends
- Glassmorphism-Header: `bg-white/80 backdrop-blur-md` mit User-Avatar-Dropdown und animierten Nav-Underlines
- Login-Seiten: Neues Design mit Glassmorphism-Cards, MoPilot-Logo-SVG, Gradient-Buttons
- Rollenauswahl (mopilot.website): Zonenbasierte Karten (Kundennah/Betrieb/Strategie) mit farbcodierten Stilen
- Ideenplattform: Kategoriekarten mit farbigen Badges, Admin-Dashboard mit Design-System-Tokens
- KI-Chat-Redesign: Gradient-Avatare, typing-dot-Animation, animate-fade-in-up pro Nachricht, scrollbar-thin, cursor-blink für Streaming
- ZEO/CC HeroChat: font-display/font-body, shadow-warm-lg, Gradient-Senden-Button, typing-dot bei leerem Streaming
- ZEO/CC Komponenten: Bulk-Migration gray-*→surface-*, shadow-sm→shadow-warm-sm, font-extrabold→font-bold font-display
- SVG-Favicons: MoPilot (Routen-Motiv), Ideen (Glühbirne), ZEO (grün), CC (blau)
- Open-Graph-Metadaten: og:title, og:description, og:site_name, og:locale auf allen 4 Plattformen
- Accessibility: Skip-Navigation ("Zum Inhalt springen"), id="main-content" Landmarks, focus-visible Ring
- Middleware: icon.svg-Passthrough in Auth-Middleware (matcher-Pattern erweitert)
- Reusable TSX-Komponenten: ChatBubble, TypingIndicator, Header, Footer, Card, Button, Badge, Input, MoPilotLogo, LoadingSpinner, TopographyBg, PageTransition
- CSS-Animationen: typingBounce, cursorBlink, fadeInUp, fadeIn, slideInRight, pulseSoft, float
- Git-Commits: mopilot (31 Dateien, +2504 Zeilen), ZEO (29 Dateien, initiales Repo), CC (29 Dateien, initiales Repo)

**Neu in v0.72 (CC Kundenassistent & Secrets-Management)**
- CC Kundenassistent (cc-kunden.mopilot.website) – vollständige Webanwendung mit CC-Branding
- API-Proxy-Pattern: Next.js Rewrites statt separater API-Domain
- Einheitliches Secrets-Management via `env_file: .env` für alle Sub-Projekte
- Healthchecks für alle ZEO- und CC-Container
- Uptime Kuma: 2 neue Monitore (CC API, CC Frontend)
- CC Kundenportal-Link auf mopilot.website Startseite

**Neu in v0.71 (Admin & E-Mail)**
- Admin-Benutzerverwaltung auf mopilot.website
- User-Sync-Bugfixes bei Passwort-Reset und Admin-Synchronisierung
- Neue Rolle MOPILOT_TEAM
- Login/Logout auf mopilot.website
- E-Mail-Zustellbarkeit verbessert, DNS-Härtung (DKIM, DMARC)

**In v0.7 (Ideenplattform & Benutzerverwaltung)**
- MoPilot Ideenplattform (ideen.mopilot.website) – vollständige Webanwendung
- Ideen einreichen, bewerten (1–5), kommentieren, Tags zuweisen
- Hierarchische Zugriffskontrolle: Stakeholder sehen nur Ideen ihrer Rollenkategorie
- E-Mail-Verifizierung bei Registrierung (IONOS SMTP)
- Passwort-Reset via E-Mail-Link
- User-Sync: Registrierte User werden automatisch in mopilot-DB synchronisiert
- Echte E-Mail/Passwort-Logins auf mopilot.website und zeo-kunden.mopilot.website
- Demo-Login-Fallback (mopilot/mopilot2027) auf mopilot.website erhalten
- Header-Anzeige des eingeloggten Users auf allen Plattformen
- Admin-Bereich: Benutzerverwaltung, CSV-Export, Statistiken
- Datei-Upload (Bilder, PDF, DOCX) an Ideen
- E-Mail-Benachrichtigung bei neuen Kommentaren
- 504 Gateway Timeout Fix (traefik.docker.network=coolify Label)

**In v0.6 (Bugfixes, Sicherheit & Monitoring)**
- 502 Bad Gateway behoben – Next.js Standalone HOSTNAME-Binding korrigiert
- Next.js Sicherheitsupdate 14.1.0 → 14.2.35 (CVE-2025-55184, CVE-2025-55183)
- Docker Health-Checks für alle Container
- Uptime Kuma Monitoring installiert und konfiguriert

**In v0.5 (Infrastruktur-Stabilisierung)**
- 4 GB Swap-Speicher, Docker restart-policies, Error Boundary
- ZEO-Kunden in CI/CD-Pipeline integriert

**mopilot.website (Hauptsystem)**
- Rollenbasierter Login mit 12 Demo-Accounts (10 ZEO + 2 CC)
- KI-Chat mit Claude Sonnet – rollenspezifische Tonalität und Wissen
- REST-API mit JWT-Authentifizierung (8h Token-Gültigkeit)
- Wissensbasis mit FAQs pro Betreiber und Rolle
- Standort-, Fahrzeug- und Tarifverwaltung
- Swagger UI für API-Dokumentation

**zeo-kunden.mopilot.website (ZEO Kundenassistent)**
- KI-Chat mit SSE-Streaming (wortweise Ausgabe)
- Kostenrechner, ÖPNV-Karte, Reichweiten-Guide, Fahrzeugkatalog, Onboarding

**cc-kunden.mopilot.website (CC Kundenassistent) – NEU in v0.72**
- KI-Chat mit SSE-Streaming (wortweise Ausgabe), CC-spezifischer System-Prompt
- Kostenrechner (CC eco / CC go Tarife), ÖPNV-Karte (12 CC-Stationen), Reichweiten-Guide
- Fahrzeugkatalog, Onboarding-Guide (6 Schritte), FAQ-Akkordeon
- API-Proxy über Next.js Rewrites (kein separates API-Subdomain)

---

## 2. IT-Umfeld

### 2.1 Genutzte Werkzeuge und Technologien

| Bereich | Technologie | Details |
|---------|-------------|---------|
| Frontend (alle) | Next.js 14 | React-basiert, App Router, SSR, Node 20 Alpine |
| | Tailwind CSS | Utility-First CSS, Shared Preset (tailwind.preset.js) |
| | Shared Design System | shared-ui/: Tailwind-Preset, globals.css, TSX-Komponenten, Hooks |
| | Plus Jakarta Sans | Display-Schrift (Headings, Branding) – font-display |
| | DM Sans | Body-Schrift (Fließtext, UI) – font-body |
| | Leaflet.js | Interaktive Karte (OpenStreetMap) für Stationen |
| Backend (Hauptsystem) | FastAPI | Python 3.11, async, Uvicorn, SQLAlchemy 2.0 async |
| Backend (Ideenplattform) | FastAPI | Python 3.11, sync, Uvicorn, SQLAlchemy 2.0 sync |
| Backend (ZEO-Kunden) | FastAPI | Python 3.11, SSE-Streaming |
| Backend (CC-Kunden) | FastAPI | Python 3.11, SSE-Streaming, JSON-Wissensbasis |
| KI-Modell | Claude Sonnet | `claude-sonnet-4-6` via Anthropic API |
| Datenbank | PostgreSQL 16 | 1 Server, 2 Datenbanken: `mopilot` + `mopilot_ideen` |
| Cache | Redis 7 | Alpine-Image, 256MB, LRU-Eviction |
| Auth (Hauptsystem) | JWT (python-jose) | 8h Token, bcrypt Passwort-Hashing (passlib) |
| Auth (Ideenplattform) | JWT (PyJWT) | 24h Verify-Token, 1h Reset-Token, bcrypt (passlib) |
| E-Mail | IONOS SMTP | smtp.ionos.de:587, STARTTLS, admin@mopilot.website |
| User-Sync | psycopg2 | Direkte DB-Verbindung Ideen → mopilot |
| Containerisierung | Docker | Multi-Stage Builds, Docker Compose, Health-Checks |
| Reverse Proxy | Traefik v3.1 | Via Coolify, SSL-Terminierung, Host-basiertes Routing |
| SSL/TLS | Let's Encrypt | Automatische Zertifikate via Traefik (certresolver) |
| Deployment | Coolify 4.0.0-beta.442 | Self-hosted PaaS, verwaltet Traefik + Container |
| CI/CD | GitHub Actions | Automatisches Deployment bei Push auf master |
| Versionskontrolle | Git + GitHub | Private Repository, Branch-basierter Workflow |
| DNS | IONOS | Domain-Verwaltung für mopilot.website (A-Records) |
| API-Dokumentation | Swagger UI | `/docs` (Hauptsystem), `/api/docs` (Ideenplattform) |
| KI-Entwicklung | Claude Code | KI-gestütztes Pair Programming (lokal + remote, CLI) |
| Monitoring | Uptime Kuma | Self-hosted, Docker, Port 3001, Status-Seite |

### 2.2 Server-Infrastruktur

| Eigenschaft | Wert |
|-------------|------|
| Anbieter | Hetzner Cloud |
| Server-Typ | CX33 (Shared vCPU) |
| IPv4 | 142.132.232.211 |
| IPv6 | 2a01:4f8:c17:b65c::1 |
| Standort | Falkenstein (FSN1), Deutschland |
| Betriebssystem | Ubuntu (Docker CE) |
| SSH-Zugang | root@142.132.232.211 (Passwort-Auth) |
| RAM | 7.6 GB |
| Swap | 4 GB (/swapfile, swappiness=10) |
| Disk | 38 GB (ca. 23 GB belegt) |
| Frontend-Domain (Hauptsystem) | https://mopilot.website |
| Backend-Domain (Hauptsystem) | https://api.mopilot.website |
| API-Dokumentation (Hauptsystem) | https://api.mopilot.website/docs |
| Frontend-Domain (Ideenplattform) | https://ideen.mopilot.website |
| API-Dokumentation (Ideenplattform) | https://ideen.mopilot.website/api/docs |
| Frontend-Domain (ZEO-Kunden) | https://zeo-kunden.mopilot.website |
| Backend-Domain (ZEO-Kunden) | https://api.zeo-kunden.mopilot.website |
| Frontend-Domain (CC-Kunden) | https://cc-kunden.mopilot.website |
| Backend (CC-Kunden) | Kein eigenes Subdomain – API-Proxy über Frontend (siehe 11.4) |
| Coolify-Dashboard | http://localhost:8000 (via SSH-Tunnel) |
| Uptime Kuma | http://localhost:3001 (via SSH-Tunnel) |
| GitHub-Repository | github.com/JamesMz05/mopilot (privat) |

### 2.3 Admin und Deployment

**Datenbanken (PostgreSQL 16, 1 Server-Instanz)**

| Datenbank | Zweck | Zugriff |
|-----------|-------|---------|
| `mopilot` | Hauptsystem – Users, Stations, Vehicles, Tariffs, FAQs, ChatMessages | Hauptsystem-Backend (async), Ideen-Backend (sync, für User-Sync) |
| `mopilot_ideen` | Ideenplattform – Users, Roles, Ideas, Ratings, Comments, Tags, Attachments | Ideen-Backend |

**Docker Compose Services – Hauptsystem (Coolify-managed)**

| Container | Image/Build | Restart | Health-Check | Funktion |
|-----------|-------------|---------|--------------|----------|
| frontend-ns8wok04s4sgkcggwg48okcg | Next.js (Node 20 Alpine) | unless-stopped | node fetch http://localhost:3000 | Web-Oberfläche, Auth-Middleware, API-Proxy |
| backend-ns8wok04s4sgkcggwg48okcg | FastAPI (Python 3.11 Slim) | unless-stopped | python3 urllib /api/health | REST-API, KI-Chat, JWT-Auth |
| postgres-ns8wok04s4sgkcggwg48okcg | postgres:16-alpine | unless-stopped | pg_isready | Relationale Datenbank (mopilot + mopilot_ideen) |
| redis-ns8wok04s4sgkcggwg48okcg | redis:7-alpine | unless-stopped | — | Cache, Session-Store |

**Docker Compose Services – Ideenplattform (direkt)**

| Container | Image/Build | Restart | Health-Check | Funktion |
|-----------|-------------|---------|--------------|----------|
| ideen-ideen-backend-1 | FastAPI (Python 3.11 Slim) | unless-stopped | python3 urllib /api/health | REST-API, Auth, User-Sync |
| ideen-ideen-frontend-1 | Next.js (Node 20 Alpine) | unless-stopped | node fetch http://localhost:3000 | Web-Oberfläche, SPA |

**Docker Compose Services – ZEO-Kunden (direkt) – aktualisiert in v0.72**

| Container | Image/Build | Restart | Health-Check | Funktion |
|-----------|-------------|---------|--------------|----------|
| zeo-kunden-frontend-1 | Next.js (Node 20 Alpine) | unless-stopped | wget http://127.0.0.1:3000/ | Web-Oberfläche, Auth-Proxy |
| zeo-kunden-backend-1 | FastAPI (Python 3.11 Slim) | unless-stopped | python3 urllib /api/health | REST-API, SSE-Streaming |

**Docker Compose Services – CC-Kunden (direkt) – NEU in v0.72**

| Container | Image/Build | Restart | Health-Check | Funktion |
|-----------|-------------|---------|--------------|----------|
| cc-kunden-cc-kunden-frontend-1 | Next.js (Node 20 Alpine) | unless-stopped | wget http://127.0.0.1:3000/ | Web-Oberfläche, Auth-Proxy, API-Proxy |
| cc-kunden-cc-kunden-backend-1 | FastAPI (Python 3.11 Slim) | unless-stopped | python3 urllib /api/health | REST-API, SSE-Streaming, JSON-Wissensbasis |

**Docker-Sonstiges**

| Container | Image | Restart | Funktion |
|-----------|-------|---------|----------|
| uptime-kuma | louislam/uptime-kuma:1 | unless-stopped | System-Monitoring, Status-Seite |
| coolify | ghcr.io/coollabsio/coolify:4.0.0-beta.442 | unless-stopped | PaaS-Management |
| coolify-proxy | traefik:v3.1 | unless-stopped | Reverse Proxy, SSL |
| coolify-db | postgres:15-alpine | unless-stopped | Coolify-interne DB |
| coolify-redis | redis | unless-stopped | Coolify-interner Cache |
| coolify-realtime | coolify-realtime:1.0.10 | unless-stopped | Coolify Websockets |
| coolify-sentinel | sentinel:0.0.18 | unless-stopped | Coolify Monitoring-Agent |

**Serverpfade**

| System | Pfad |
|--------|------|
| Hauptsystem (Git-Repo + Build-Quelle) | `/opt/mopilot/` |
| Shared Design System | `/opt/mopilot/shared-ui/` |
| Sync-Script (shared-ui → alle Frontends) | `/opt/mopilot/sync-shared-ui.sh` |
| Hauptsystem Frontend-Quellcode | `/opt/mopilot/frontend/` |
| Hauptsystem Backend-Quellcode | `/opt/mopilot/backend/` |
| Ideenplattform (komplett) | `/opt/mopilot/ideen/` |
| Ideenplattform Backend | `/opt/mopilot/ideen/backend/` |
| Ideenplattform Frontend | `/opt/mopilot/ideen/frontend/` |
| ZEO-Kunden (Git-Quelle) | `/opt/mopilot/MoPilot_ZEO_Kunden/` |
| ZEO-Kunden (laufende Instanz, rsync) | `/opt/zeo-kunden/` |
| CC-Kunden (Git-Quelle, NEU v0.74) | `/opt/mopilot/cc-kunden/` |
| CC-Kunden (laufende Instanz) | `/opt/cc-kunden/` |
| CC-Kunden Frontend | `/opt/cc-kunden/frontend/` |
| CC-Kunden Backend | `/opt/cc-kunden/backend/` |
| Coolify-Konfiguration | `/data/coolify/` |
| Coolify Hauptsystem Compose | `/data/coolify/services/ns8wok04s4sgkcggwg48okcg/docker-compose.yml` |
| Uptime Kuma Daten | Docker Volume `uptime-kuma-data` |

### 2.4 IT-Übersichtsgrafik

```
+============================================================+
|                    NUTZER (Browser)                        |
|   mopilot.website / ideen.mopilot.website /               |
|   zeo-kunden.mopilot.website /                             |
|   cc-kunden.mopilot.website                                |
+==================+=========+===============================+
                   |         |
              HTTPS|    HTTPS|
                   v         v
+============================================================+
|              HETZNER CX33  (142.132.232.211)               |
|  +------------------------------------------------------+  |
|  |         COOLIFY / TRAEFIK v3.1 (Reverse Proxy)       |  |
|  |         SSL/TLS Termination + Host-based Routing      |  |
|  +--------+----------+----------+----------+------------+  |
|           |          |          |          |               |
|  +--------+----+ +---+------+ +---+------+ +----------+   |
|  | HAUPTSYSTEM | | IDEEN-   | | ZEO-     | | CC-      |   |
|  | Next.js     | | PLATTFORM| | KUNDEN   | | KUNDEN   |   |
|  | FastAPI     | | Next.js  | | Next.js  | | Next.js  |   |
|  | PostgreSQL  | | FastAPI  | | FastAPI  | | FastAPI  |   |
|  | Redis       | |          | |          | |          |   |
|  +-------------+ +----------+ +----------+ +----------+   |
|                                                           |
|  +---------------------+  +----------------------------+  |
|  | UPTIME KUMA  :3001  |  | ANTHROPIC CLOUD API (ext.) |  |
|  | Monitoring + Status |  | Claude Sonnet – KI-Modell  |  |
|  +---------------------+  +----------------------------+  |
|                                                           |
|  +-------[ PostgreSQL 16 ]----------------------------+   |
|  |  DB: mopilot       (Hauptsystem + synced Users)    |   |
|  |  DB: mopilot_ideen (Ideenplattform)                |   |
|  +----------------------------------------------------+   |
|                                                           |
|  SWAP: 4 GB  |  RAM: 7.6 GB  |  Disk: 38 GB             |
+============================================================+
```

### 2.5 IT-Detailgrafik

```
+--[ Browser ]---------------------------------------------+
|  mopilot.website/login    → E-Mail/PW oder Demo-Login   |
|  ideen.mopilot.website    → E-Mail/PW (Registrierung)   |
|  zeo-kunden.../login      → E-Mail/PW (Proxy zu mopilot)|
|  cc-kunden.../login       → E-Mail/PW (Proxy zu mopilot)|
+-----+----------------------------------------------------+
      |  HTTPS
      v
+--[ Coolify Reverse Proxy / Traefik v3.1 ]----------------+
|  mopilot.website             → frontend:3000              |
|  api.mopilot.website         → backend:8000               |
|  ideen.mopilot.website       → ideen-frontend:3000        |
|  ideen.mopilot.website/api/* → ideen-backend:8000 (prio20)|
|  zeo-kunden.mopilot.website  → zeo-frontend:3000          |
|  api.zeo-kunden...           → zeo-backend:8000           |
|  cc-kunden.mopilot.website   → cc-frontend:3000           |
|    cc-frontend /api/chat/*   → cc-backend:8000 (rewrite)  |
|    cc-frontend /api/health   → cc-backend:8000 (rewrite)  |
+-----+----------------------------------------------------+
      |
      v
+--[ Next.js Frontends :3000 ]-----------------------------+
|  middleware.ts: Cookie-Check (demo_auth Cookie)           |
|    matcher: !(static|image|favicon.ico|icon.svg|robots)   |
|  /api/auth/login: Server-Side Proxy → Backend             |
|  app/error.tsx: Error Boundary (Deployment-Schutz)        |
|  HOSTNAME=0.0.0.0 (Docker-Binding)                        |
|  shared-ui/: Tailwind-Preset + globals.css + Komponenten  |
|  CC-Kunden: next.config.js rewrites → Backend (Proxy)     |
+-----+----------------------------------------------------+
      |
      v
+--[ FastAPI Backends :8000 ]------------------------------+
|  Hauptsystem:                                             |
|    /api/auth/login → JWT Token (8h), bcrypt verify        |
|    /api/chat/send  → Claude Sonnet (non-streaming)        |
|    /api/chat/stream → Claude Sonnet (SSE-Streaming)       |
|    /api/health, /api/knowledge/, /api/stations/           |
|                                                           |
|  Ideenplattform:                                          |
|    /api/auth/register → User anlegen + Verify-Mail        |
|    /api/auth/login → JWT Token, E-Mail-Verify-Check       |
|    /api/ideas/ → CRUD + Ratings + Comments + Tags         |
|    /api/roles/, /api/tags/, /api/users/, /api/export/     |
|    User-Sync → INSERT in mopilot-DB via psycopg2          |
|                                                           |
|  ZEO-Kunden:                                              |
|    /api/chat/stream → Claude Sonnet (SSE-Streaming)       |
|    /api/health                                            |
|                                                           |
|  CC-Kunden:                                               |
|    /api/chat/stream → Claude Sonnet (SSE-Streaming)       |
|    /api/health                                            |
+------+-----------------------+---------------------------+
       |                       |
       v                       v
+--[ PostgreSQL 16 ]---+  +--[ Anthropic Cloud ]---+
|  DB: mopilot         |  |  Claude Sonnet         |
|    Users (12 seed +  |  |  Rollenspez. Prompt    |
|     synced from Ideen)|  +------------------------+
|    ChatMessages      |
|    Stations, Vehicles|  +--[ IONOS SMTP ]--------+
|    Tariffs, FAQs     |  |  smtp.ionos.de:587     |
|                      |  |  Verify + Reset Mails  |
|  DB: mopilot_ideen   |  |  Kommentar-Benachr.    |
|    Users, Roles      |  +------------------------+
|    Ideas, Ratings    |
|    Comments, Tags    |
|    Attachments       |
+----------------------+
```

---

## 3. Deployment-Prozess (CI/CD)

### 3.1 Übersicht

Die CI/CD-Pipeline deckt Hauptsystem und ZEO-Kunden ab. Die Ideenplattform wird aktuell manuell deployed (`docker compose up -d --build`). CC-Kunden liegt seit v0.74 im Git-Monorepo unter `cc-kunden/` und kann analog zu ZEO-Kunden per rsync deployt werden (aktuell noch manuell). Jeder Push auf `master` deployt automatisch Hauptsystem und ZEO-Kunden.

### 3.2 Komponenten der Pipeline

| Komponente | Technologie | Aufgabe |
|------------|-------------|---------|
| Versionskontrolle | Git + GitHub | Quellcode aller Systeme in einem Repository |
| CI/CD-Runner | GitHub Actions | Automatisierte Pipeline bei Push auf master |
| Server-Zugriff | SSH (appleboy/ssh-action) | Code-Synchronisation + ZEO-Kunden Rebuild |
| Hauptsystem Rebuild | Coolify API | Container-Rebuild via Webhook |
| ZEO-Kunden Rebuild | docker compose | Direkter Rebuild auf dem Server |
| Code-Sync ZEO-Kunden | rsync | Synchronisiert `MoPilot_ZEO_Kunden/` → `/opt/zeo-kunden/` |

**GitHub Secrets**

| Secret | Zweck |
|--------|-------|
| SERVER_SSH_PASSWORD | SSH-Passwort für root@142.132.232.211 |
| GH_PAT | GitHub Personal Access Token (repo-Scope) |
| COOLIFY_TOKEN | API-Token für Coolify Rebuild |

### 3.3 Ablauf eines Deployments

1. **Lokale Entwicklung**: Code bearbeiten in `C:\Users\james\Projekte\MoPilot`
2. **Git Commit & Push** auf master
3. **GitHub Actions startet** automatisch
4. **SSH auf Server**: `git reset --hard FETCH_HEAD` – beide Systeme aktuell
5. **rsync**: ZEO-Kunden Code von `/opt/mopilot/MoPilot_ZEO_Kunden/` → `/opt/zeo-kunden/`
6. **ZEO-Kunden Rebuild**: `docker compose up -d --build`
7. **Coolify Rebuild**: Hauptsystem-Container werden neu gebaut
8. **Live**: beide Systeme aktualisiert, typisch in unter 3 Minuten

**Ideenplattform (manuell):**
```bash
cd /opt/mopilot/ideen
docker compose up -d --build
```

**CC-Kunden (manuell, Quellcode seit v0.74 im Monorepo):**
```bash
# Option A: rsync aus Monorepo (analog ZEO-Kunden)
rsync -av --delete /opt/mopilot/cc-kunden/ /opt/cc-kunden/ --exclude .env --exclude node_modules --exclude __pycache__
cd /opt/cc-kunden && docker compose down && docker compose up -d --build

# Option B: direkt auf dem Server (wie bisher)
cd /opt/cc-kunden
docker compose down && docker compose up -d --build
```

### 3.4 GitHub Actions Workflow

```yaml
name: Deploy to Coolify

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Pull code + deploy ZEO-Kunden
        uses: appleboy/ssh-action@v1
        with:
          host: 142.132.232.211
          username: root
          password: ${{ secrets.SERVER_SSH_PASSWORD }}
          script: |
            cd /opt/mopilot
            git fetch https://${{ secrets.GH_PAT }}@github.com/JamesMz05/mopilot.git master
            git reset --hard FETCH_HEAD
            echo "Hauptsystem: $(git rev-parse --short HEAD)"
            rsync -a --delete /opt/mopilot/MoPilot_ZEO_Kunden/frontend/ /opt/zeo-kunden/frontend/
            rsync -a --delete /opt/mopilot/MoPilot_ZEO_Kunden/backend/ /opt/zeo-kunden/backend/
            echo "ZEO-Kunden Code synchronisiert"
            cd /opt/zeo-kunden
            docker compose up -d --build
            echo "ZEO-Kunden deployed"

      - name: Coolify Rebuild (Hauptsystem)
        run: |
          curl -s -X GET \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
            "https://coolify.pydna.de/api/v1/deploy?uuid=ns8wok04s4sgkcggwg48okcg&force=true"
```

### 3.5 Deployment-Diagramm

```
+--[ Entwickler-PC ]-----+
|  C:\Users\james\Projekte\MoPilot   |
|  Code bearbeiten       |
|  git commit + push     |
+----------+-------------+
           |
           | git push (HTTPS)
           v
+--[ GitHub ]---------------------------------------+
|  Repository: JamesMz05/mopilot (privat)           |
|  Branch: master                                   |
|                                                   |
|  +--[ GitHub Actions ]-------------------------+  |
|  |  Trigger: push auf master                  |  |
|  |                                            |  |
|  |  Step 1: SSH auf Server                    |  |
|  |    → git reset --hard (alle Systeme)       |  |
|  |    → rsync ZEO-Kunden Code                 |  |
|  |    → docker compose up --build (ZEO)       |  |
|  |                                            |  |
|  |  Step 2: Coolify API                       |  |
|  |    → Hauptsystem Rebuild                   |  |
|  +--------------------------------------------+  |
+-------+--------------------+----------------------+
        |                    |
   SSH  |          HTTPS API |
        v                    v
+--[ Hetzner Server ]-----------------------------+
|  /opt/mopilot/            ← Hauptsystem (Git-Repo)   |
|  /opt/mopilot/ideen/      ← Ideenplattform (manuell) |
|  /opt/mopilot/cc-kunden/  ← CC-Kunden (Git, v0.74)   |
|  /opt/zeo-kunden/         ← ZEO-Kunden (rsync)       |
|  /opt/cc-kunden/          ← CC-Kunden (laufend)      |
|                                                       |
|  Coolify: Hauptsystem rebuild                         |
|  Docker Compose: ZEO-Kunden rebuild (rsync)           |
|  Docker Compose: Ideen manuell                        |
|  Docker Compose: CC-Kunden (manuell/rsync möglich)    |
+--------------------------------------------------+
```

---


## 4. MoPilot Ideenplattform – NEU in v0.7

### 4.1 Projektbeschreibung und Funktionsumfang

Die MoPilot Ideenplattform (ideen.mopilot.website) ist eine Webanwendung, in der alle MoPilot-Stakeholder Ideen einreichen, bewerten und diskutieren können. Jede Rolle sieht nur Ideen aus ihrer Rollenkategorie (hierarchische Zugriffskontrolle).

**Kernfunktionen:**
- Ideen einreichen mit Titel, Beschreibung, Rolle und optionalen Datei-Anhängen
- Bewertung (1–5 Sterne) mit Durchschnittsanzeige
- Kommentare mit E-Mail-Benachrichtigung an den Ideen-Autor
- Tags zur Kategorisierung
- Filtermöglichkeiten: nach Rolle, Status, Sortierung (neueste, beste Bewertung, meiste Kommentare)
- Admin-Bereich: Benutzerverwaltung, Statusänderungen, CSV-Export, Plattform-Statistiken
- Datei-Upload: JPG, PNG, PDF, DOCX (max. 10 MB)

**Seed-Daten:**
- 10 Rollen (je mit Name, Slug, Kategorie, Tagline)
- 1 Admin-User (admin@mopilot.website)
- 30 Seed-Ideen verteilt über alle Rollen

### 4.2 Technische Architektur

```
+============================================================+
|               NUTZER (Browser)                             |
|   https://ideen.mopilot.website                            |
+==========================+=================================+
                           |  HTTPS
                           v
+============================================================+
|         HETZNER CX33  (142.132.232.211)                    |
|                                                            |
|  +------------------------------------------------------+  |
|  |  TRAEFIK – Host: ideen.mopilot.website               |  |
|  |  PathPrefix(/api) → Backend (Prio 20)                |  |
|  |  Alles andere    → Frontend (Prio 10)                |  |
|  +-------------+----------------------------+-----------+  |
|                |                            |               |
|  +-------------+----------+  +--------------+-----------+   |
|  |  FRONTEND  :3000        |  |  BACKEND  :8000          |  |
|  |  Next.js 14.2.21        |  |  FastAPI (Python 3.11)   |  |
|  |  React 18, Tailwind     |  |  SQLAlchemy 2.0 (sync)   |  |
|  |  Custom useAuth hook    |  |  PyJWT, Passlib/bcrypt   |  |
|  |  HOSTNAME=0.0.0.0      |  |  psycopg2 (User-Sync)    |  |
|  +------------------------+  +-----------+--------------+   |
|                                          |                  |
|               +----------+----------+----+----+             |
|               |          |          |         |             |
|               v          v          v         v             |
|   +----------+   +------+---+  +---+------+  +----------+  |
|   | PG: mopi-|   | PG: mopi-|  | IONOS   |  | Uploads  |  |
|   | lot_ideen|   | lot (sync|  | SMTP    |  | Volume   |  |
|   | (eigene  |   | Ziel-DB) |  | :587    |  |          |  |
|   | DB)      |   |          |  |         |  |          |  |
|   +----------+   +----------+  +---------+  +----------+  |
+============================================================+
```

| Komponente | Technologie | Details |
|------------|-------------|---------|
| Frontend | Next.js 14.2.21, React 18, Tailwind CSS | Custom Auth-Hook, deutschsprachig |
| Backend | FastAPI 0.115.6, Uvicorn 0.34.0 | Sync SQLAlchemy, strukturiertes JSON-Logging |
| ORM | SQLAlchemy 2.0.36 | Sync, psycopg2-binary als Driver |
| Auth | PyJWT 2.10.1, Passlib 1.7.4 (bcrypt) | JWT HS256, 24h Verify-Token, 1h Reset-Token |
| DB | PostgreSQL 16 | Eigene DB `mopilot_ideen` auf gemeinsamem Server |
| E-Mail | smtplib, IONOS SMTP | Verifizierung, Passwort-Reset, Kommentar-Benachrichtigung |
| User-Sync | psycopg2 (direkt) | INSERT ON CONFLICT in mopilot-DB |
| Datei-Upload | python-multipart | Max 10 MB, JPG/PNG/PDF/DOCX |
| Migrations | Alembic 1.14.1 | DB-Schema-Versionierung |

### 4.3 Datenbank-Modelle (mopilot_ideen)

**Enums:**

| Enum | Werte |
|------|-------|
| UserType | `stakeholder`, `team`, `admin` |
| RoleCategory | `kundennah`, `betrieb`, `strategie` |
| IdeaStatus | `neu`, `in_diskussion`, `geplant`, `umgesetzt`, `abgelehnt` |

**Tabellen:**

| Tabelle | Felder | Beziehungen |
|---------|--------|-------------|
| **users** | id, email (unique), name, role_id (FK→roles), user_type, password_hash, email_verified, created_at | → Role, → Ideas, → Ratings, → Comments |
| **roles** | id, name (unique), slug (unique), category, description, email_alias, tagline | → Users, → Ideas |
| **ideas** | id, title, description, author_id (FK→users), role_id (FK→roles), status, created_at, updated_at | → Author, → Role, → Ratings, → Comments, → Attachments |
| **ratings** | id, idea_id (FK→ideas, cascade), user_id (FK→users), score (1-5), created_at | UniqueConstraint(idea_id, user_id) |
| **comments** | id, idea_id (FK→ideas, cascade), user_id (FK→users), text, created_at | |
| **attachments** | id, idea_id (FK→ideas, cascade), filename, original_filename, content_type, size, created_at | |
| **tags** | id, name (unique), slug (unique) | |
| **idea_tags** | id, idea_id (FK→ideas, cascade), tag_id (FK→tags, cascade) | UniqueConstraint(idea_id, tag_id) |

### 4.4 API-Endpunkte

**Auth (/api/auth)**

| Method | Pfad | Auth | Funktion |
|--------|------|------|----------|
| POST | /api/auth/register | Nein | Registrierung + Verify-Mail |
| POST | /api/auth/login | Nein | Login → JWT |
| GET | /api/auth/verify?token= | Nein | E-Mail-Verifizierung |
| POST | /api/auth/forgot-password | Nein | Reset-Mail senden |
| POST | /api/auth/reset-password | Nein | Passwort zurücksetzen |
| POST | /api/auth/resend-verification | Nein | Verify-Mail erneut senden |
| GET | /api/auth/me | JWT | Eigenes Profil |

**Ideas (/api/ideas)**

| Method | Pfad | Auth | Funktion |
|--------|------|------|----------|
| GET | /api/ideas | JWT | Liste (Filter: role, status; Sort: newest, best_rating, most_comments) |
| GET | /api/ideas/{id} | JWT | Detail mit Aggregaten |
| POST | /api/ideas | JWT | Erstellen (Rollenzugriff geprüft) |
| PUT | /api/ideas/{id} | JWT | Bearbeiten (Autor/Admin; Status nur Admin) |
| DELETE | /api/ideas/{id} | JWT (Admin) | Löschen |
| POST | /api/ideas/{id}/rate | JWT | Bewerten 1-5 (Upsert) |
| GET | /api/ideas/{id}/ratings | JWT | Bewertungsübersicht |
| POST | /api/ideas/{id}/comments | JWT | Kommentar + E-Mail-Benachrichtigung |
| GET | /api/ideas/{id}/comments | JWT | Kommentare auflisten |
| POST | /api/ideas/{id}/attachments | JWT | Datei hochladen (max 10MB) |
| GET | /api/ideas/{id}/attachments | JWT | Anhänge auflisten |
| DELETE | /api/ideas/{id}/attachments/{aid} | JWT | Anhang löschen |
| GET | /api/ideas/{id}/attachments/{aid}/download | Nein | Datei herunterladen |
| POST | /api/ideas/{id}/tags/{tid} | JWT | Tag zuweisen |
| DELETE | /api/ideas/{id}/tags/{tid} | JWT | Tag entfernen |
| GET | /api/ideas/{id}/tags | Nein | Tags der Idee |

**Weitere**

| Method | Pfad | Auth | Funktion |
|--------|------|------|----------|
| GET | /api/roles | Nein | Alle Rollen mit Ideen-Anzahl |
| GET | /api/roles/{slug} | Nein | Rollen-Detail |
| GET | /api/tags | Nein | Alle Tags |
| POST | /api/tags | JWT (Team/Admin) | Tag erstellen |
| DELETE | /api/tags/{id} | JWT (Admin) | Tag löschen |
| GET | /api/users | JWT (Admin) | Alle Benutzer |
| DELETE | /api/users/{id} | JWT (Admin) | Benutzer löschen (Cascade) |
| DELETE | /api/comments/{id} | JWT (Autor/Admin) | Kommentar löschen |
| GET | /api/export/ideas | JWT (Admin) | CSV-Export |
| GET | /api/export/stats | JWT (Admin) | Plattform-Statistiken |
| GET | /api/health | Nein | Health-Check |

### 4.5 Rollen und Zugriffskontrolle

**User-Typen:**

| Typ | Rechte |
|-----|--------|
| stakeholder | Sieht nur Ideen aus zugänglichen Rollenkategorien; muss eine Rolle haben |
| team | Sieht alle Ideen; kann Tags erstellen |
| admin | Vollzugriff: User verwalten, Status ändern, löschen, exportieren |

**Hierarchische Kategorie-Zugriffskontrolle:**

Stakeholder sehen Ideen aus ihrer eigenen Rollenkategorie plus alle darunterliegenden. Die Hierarchie ist: `strategie` > `betrieb` > `kundennah`.

| Benutzer-Kategorie | Sieht Ideen aus |
|---------------------|-----------------|
| kundennah | nur kundennah |
| betrieb | betrieb + kundennah |
| strategie | strategie + betrieb + kundennah (alles) |

**Rollen mit Taglines:**

| Slug | Name | Kategorie | Tagline |
|------|------|-----------|---------|
| endkunde | Endkunde | kundennah | "Ideen für bessere Mobilität im Alltag" |
| stationspate | Stationspate | kundennah | "Standorte verbessern, Community stärken" |
| hotline | Hotline | kundennah | "Erfahrungen aus dem direkten Kundenkontakt" |
| betreiber | Betreiber | betrieb | "Strategie und Weiterentwicklung gestalten" |
| flottenmanagement | Flottenmanagement | betrieb | "Fahrzeugflotte optimal einsetzen" |
| fahrzeugbetreuer | Fahrzeugbetreuer | betrieb | "Qualität und Verfügbarkeit sichern" |
| plattform-support | Plattform-Support | betrieb | "Technik und Prozesse verbessern" |
| projekttraeger | Projektträger | strategie | "Förderziele erreichen, Wirkung messen" |
| fahrzeugsteller | Fahrzeugsteller | strategie | "Integration und Partnerschaften stärken" |
| validierungsstelle | Validierungsstelle | strategie | "Compliance und Qualitätssicherung" |

### 4.6 E-Mail-Service (SMTP)

| Einstellung | Wert |
|-------------|------|
| SMTP-Host | smtp.ionos.de |
| SMTP-Port | 587 (STARTTLS) |
| SMTP-User | admin@mopilot.website |
| SMTP-Passwort | Verrueckte1Normalitaet |
| Absender | noreply@mopilot.website |
| BASE_URL | https://ideen.mopilot.website |

**Gesendete E-Mails:**

| Typ | Betreff | Trigger |
|-----|---------|---------|
| Verifizierung | "E-Mail-Adresse bestätigen – MoPilot Ideenplattform" | Registrierung |
| Passwort-Reset | "Passwort zurücksetzen – MoPilot Ideenplattform" | Forgot-Password |
| Kommentar-Benachrichtigung | "Neuer Kommentar zu Ihrer Idee: {Titel}" | Neuer Kommentar |

Alle E-Mails verwenden MoPilot-gebrandete HTML-Templates mit grünem Header (#2D6A4F).

### 4.7 Docker Compose und Traefik-Routing

**Datei:** `/opt/mopilot/ideen/docker-compose.yml`

```yaml
services:
  ideen-backend:
    build: ./backend
    expose: ["8000"]
    environment:
      DATABASE_URL: postgresql+psycopg2://mopilot:mopilot_secret_2026@postgres-ns8wok04s4sgkcggwg48okcg:5432/mopilot_ideen
      JWT_SECRET: <secret>
      CORS_ORIGINS: https://ideen.mopilot.website
      SMTP_HOST: smtp.ionos.de
      SMTP_PORT: "587"
      SMTP_USER: admin@mopilot.website
      SMTP_PASSWORD: <password>
      SMTP_FROM: noreply@mopilot.website
      BASE_URL: https://ideen.mopilot.website
    volumes: [uploads:/app/uploads]
    networks: [ideen-net, coolify]
    labels:
      - traefik.enable=true
      - traefik.docker.network=coolify
      - traefik.http.routers.ideen-backend.rule=Host(`ideen.mopilot.website`) && PathPrefix(`/api`)
      - traefik.http.routers.ideen-backend.priority=20
      - traefik.http.routers.ideen-backend.tls.certresolver=letsencrypt

  ideen-frontend:
    build: ./frontend
    expose: ["3000"]
    environment:
      BACKEND_URL: http://ideen-backend:8000
    networks: [ideen-net, coolify]
    labels:
      - traefik.enable=true
      - traefik.docker.network=coolify
      - traefik.http.routers.ideen-frontend.rule=Host(`ideen.mopilot.website`)
      - traefik.http.routers.ideen-frontend.priority=10
      - traefik.http.routers.ideen-frontend.tls.certresolver=letsencrypt

networks:
  ideen-net: { driver: bridge }
  coolify: { external: true }

volumes:
  uploads:
```

**Traefik-Routing-Logik:** PathPrefix `/api` → Backend (Priorität 20), alles andere → Frontend (Priorität 10). Beide auf derselben Domain `ideen.mopilot.website`.

**Wichtig:** Das Label `traefik.docker.network=coolify` ist erforderlich, da die Container in mehreren Netzwerken sind. Ohne dieses Label kann Traefik die IP-Adresse nicht finden (504 Gateway Timeout).

### 4.8 Frontend

| Eigenschaft | Wert |
|-------------|------|
| Framework | Next.js 14.2.21 (App Router) |
| UI | React 18.3, Tailwind CSS 3.4 |
| Sprache | TypeScript 5, deutschsprachig |
| Auth | Custom `useAuth` Hook (JWT in localStorage) |
| Branding | "MoPilot – Ideenplattform", Farbe `#2D6A4F` (mopilot-green) |
| Admin | Eigener `/admin`-Bereich (nur für user_type=admin sichtbar) |

**Wichtige Seiten:**
- `/` – Rollenübersicht mit Ideenanzahlen
- `/ideen` – Ideenliste mit Filtern
- `/idee/{id}` – Ideen-Detail mit Bewertungen, Kommentaren, Anhängen
- `/neue-idee` – Neue Idee einreichen
- `/login` – Login
- `/register` – Registrierung mit Rollenauswahl
- `/verify` – E-Mail-Verifizierung
- `/passwort-zuruecksetzen` – Passwort-Reset
- `/admin` – Admin-Bereich (Benutzer, Statistiken, Export)

### 4.9 Serverpfade und Dateien

| Pfad | Inhalt |
|------|--------|
| `/opt/mopilot/ideen/docker-compose.yml` | Docker Compose Konfiguration |
| `/opt/mopilot/ideen/.env` | Umgebungsvariablen (SMTP-Credentials etc.) |
| `/opt/mopilot/ideen/backend/app/main.py` | FastAPI App-Initialisierung, Seeding |
| `/opt/mopilot/ideen/backend/app/models.py` | SQLAlchemy Modelle |
| `/opt/mopilot/ideen/backend/app/schemas.py` | Pydantic Schemas (inkl. UserOut mit role_name) |
| `/opt/mopilot/ideen/backend/app/database.py` | DB-Session und Engine |
| `/opt/mopilot/ideen/backend/app/auth.py` | JWT-Hilfsfunktionen, Token-Erstellung |
| `/opt/mopilot/ideen/backend/app/email.py` | SMTP E-Mail-Service |
| `/opt/mopilot/ideen/backend/app/user_sync.py` | User-Sync in mopilot-DB |
| `/opt/mopilot/ideen/backend/app/routers/auth.py` | Auth-Endpunkte (Register, Login, Verify, Reset) |
| `/opt/mopilot/ideen/backend/app/routers/ideas.py` | Ideas CRUD + Ratings + Comments |
| `/opt/mopilot/ideen/backend/app/routers/roles.py` | Rollen-Endpunkte |
| `/opt/mopilot/ideen/backend/app/routers/tags.py` | Tags-Endpunkte |
| `/opt/mopilot/ideen/backend/app/routers/users.py` | User-Verwaltung (Admin) |
| `/opt/mopilot/ideen/backend/app/routers/export.py` | CSV-Export und Statistiken |
| `/opt/mopilot/ideen/backend/app/seed.py` | Rollen, Admin-User, 30 Seed-Ideen |
| `/opt/mopilot/ideen/frontend/src/lib/auth.tsx` | useAuth Hook, User Interface (inkl. role_name) |
| `/opt/mopilot/ideen/frontend/src/components/Header.tsx` | Header mit User-Anzeige |

---

## 5. Benutzerverwaltung und Authentifizierung – NEU in v0.7

### 5.1 Übersicht: Plattformübergreifende Authentifizierung

In v0.7 wurde ein plattformübergreifendes Authentifizierungssystem implementiert:

```
+---[ Registrierung ]---+
|  ideen.mopilot.website |  ← Einziger Ort für neue Accounts
|  /register             |
+-----------+------------+
            |
   (1) User in mopilot_ideen DB
   (2) Verify-E-Mail senden
   (3) Nach Verifizierung: Sync → mopilot DB
            |
+-----------v-------------------------------------------+
|              mopilot PostgreSQL DB                     |
|  User mit gleichem E-Mail + Passwort-Hash + Rolle     |
+-------+------------------+------------------+---------+
        |                  |                  |
   Login mit           Login mit           Login mit
   gleichen            gleichen            gleichen
   Credentials         Credentials         Credentials
        |                  |                  |
+-------v------+  +-------v-------+  +------v---------+
| mopilot      |  | ideen.mopilot |  | zeo-kunden /   |
| .website     |  | .website      |  | cc-kunden      |
| /login       |  | /login        |  | .mopilot       |
+--------------+  +---------------+  | .website/login |
                                     +----------------+
```

**Wichtig:** Dies ist **kein Single Sign-On (SSO)**. Benutzer müssen sich auf jeder Plattform separat anmelden, verwenden aber überall dieselben Zugangsdaten.

### 5.2 Registrierung (zentral über Ideenplattform)

Neue Benutzer registrieren sich ausschließlich auf `ideen.mopilot.website/register`:

1. Formular: E-Mail, Name, Passwort, Rolle (Dropdown mit allen 10 Rollen)
2. User wird in `mopilot_ideen.users` angelegt mit `email_verified=false`
3. Verifizierungs-E-Mail wird gesendet (Link gültig 24 Stunden)
4. Nach Klick auf Verify-Link: `email_verified=true` + User-Sync in mopilot-DB

Auf den Login-Seiten von mopilot.website, zeo-kunden.mopilot.website und cc-kunden.mopilot.website gibt es jeweils einen Link:
> "Noch kein Konto? Auf der Ideenplattform registrieren" → https://ideen.mopilot.website/register

### 5.3 E-Mail-Verifizierung und Passwort-Reset

**E-Mail-Verifizierung:**

| Schritt | Details |
|---------|---------|
| Trigger | Registrierung (wenn SMTP konfiguriert) |
| Token | JWT mit purpose="verify", 24h Gültigkeit |
| Link | `https://ideen.mopilot.website/verify?token=...` |
| Aktion | `email_verified=true` setzen, User-Sync auslösen |
| Anti-Enumeration | `/resend-verification` gibt immer 200 zurück |

**Passwort-Reset:**

| Schritt | Details |
|---------|---------|
| Trigger | POST /api/auth/forgot-password mit E-Mail |
| Token | JWT mit purpose="reset", 1h Gültigkeit |
| Link | `https://ideen.mopilot.website/passwort-zuruecksetzen?token=...` |
| Aktion | Neues Passwort setzen in Ideen-DB + Sync neuer Hash in mopilot-DB |
| Anti-Enumeration | Gibt immer 200 zurück, auch bei unbekannter E-Mail |

### 5.4 User-Sync (Ideenplattform → mopilot DB)

**Datei:** `/opt/mopilot/ideen/backend/app/user_sync.py`

Der User-Sync schreibt Benutzer aus der Ideenplattform in die mopilot-Datenbank, damit dieselben Zugangsdaten auf allen Plattformen funktionieren.

**Verbindung:** Direkte psycopg2-Verbindung zur mopilot-DB:
```
postgresql://mopilot:mopilot_secret_2026@postgres-ns8wok04s4sgkcggwg48okcg:5432/mopilot
```

**Rollen-Mapping (Ideen-Slug → mopilot PostgreSQL ENUM):**

| Ideen-Slug | mopilot-DB Enum (UPPERCASE!) |
|------------|------|
| endkunde | ENDKUNDE |
| stationspate | STATIONSPATE |
| hotline | HOTLINE |
| betreiber | BETREIBER |
| flottenmanagement | FLOTTENMANAGEMENT |
| fahrzeugbetreuer | FAHRZEUGBETREUER |
| plattform-support | PLATTFORM_SUPPORT |
| projekttraeger | PROJEKTTRAEGER |
| fahrzeugsteller | FAHRZEUGSTELLER |
| validierungsstelle | VALIDIERUNGSSTELLE |
| mopilot-team | MOPILOT_TEAM |

**Wichtig:** Die mopilot-DB verwendet PostgreSQL ENUM-Typen mit GROSSBUCHSTABEN. Ein Mismatch (z.B. `betreiber` statt `BETREIBER`) führt zu `InvalidTextRepresentation`-Fehlern.

**Sync-Funktionen:**

| Funktion | Trigger | SQL-Operation |
|----------|---------|---------------|
| `sync_user_to_mopilot(email, name, hash, role_slug, operator)` | Registrierung, E-Mail-Verifizierung, Passwort-Reset | INSERT ... ON CONFLICT(email) DO UPDATE |

**Regeln:**
- `admin@mopilot.website` wird automatisch als `MOPILOT_TEAM` synchronisiert (Sonderbehandlung seit v0.71)
- Andere User ohne Rolle werden NICHT synchronisiert
- Unbekannte Rollen-Slugs werden übersprungen
- Sync-Fehler sind nicht-blockierend (geloggt, aber kein Abbruch)
- bcrypt-Hashes sind direkt kompatibel (passlib in beiden Systemen)
- Default-Operator: `"zeo"`

### 5.5 Login auf mopilot.website (Real Auth + Demo-Fallback)

**Datei:** `/opt/mopilot/frontend/app/api/auth/login/route.ts`

Die Login-API-Route auf mopilot.website hat eine Dual-Path-Strategie:

```
Browser → POST /api/auth/login (Next.js API Route)
  |
  |── loginId enthält '@' → Proxy an mopilot-Backend
  |     |── Backend 200 OK → JWT + User + Cookie setzen
  |     |── Backend Fehler  → "E-Mail oder Passwort falsch"
  |
  |── loginId = 'mopilot' && PW = 'mopilot2027' → Demo-Login
  |     |── Cookie setzen, kein JWT
  |     |── User: { name: 'Demo User', role: 'demo' }
  |
  |── Sonst → "Ungültige Anmeldedaten"
```

**Login-Seite** (`/opt/mopilot/frontend/app/login/page.tsx`):
- Feld: "E-Mail oder Benutzername" (type="text")
- Sendet als `{ email }` wenn `@` enthalten, sonst als `{ username }`
- Bei Erfolg: Token + User in localStorage, Redirect zu `/` (Hauptmenü, geändert in v0.71)
- Link zu ideen.mopilot.website/register

**Rollenauswahl auf Home-Page** (`/opt/mopilot/frontend/app/page.tsx`):
- 10 Rollenkarten mit direktem Login
- Rufen `/api/auth/login` (Next.js API Route) auf → setzt `demo_auth` Cookie korrekt (geändert in v0.71)
- Verwenden Demo-E-Mails (z.B. `betreiber@mopilot.website`) + Passwort `mopilot2026`
- Endkunde-Karte verlinkt extern auf zeo-kunden.mopilot.website und cc-kunden.mopilot.website (erweitert in v0.72)
- Header: **Anmelden**-Button (wenn nicht eingeloggt) / **Abmelden**-Button (wenn eingeloggt) — NEU in v0.71

### 5.6 Login auf zeo-kunden.mopilot.website und cc-kunden.mopilot.website (Backend-Proxy)

**Dateien:**
- `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/api/auth/login/route.ts`
- `/opt/cc-kunden/frontend/src/app/api/auth/login/route.ts`

Gleiche Proxy-Architektur wie mopilot.website, aber ohne Demo-Fallback:

```
Browser → POST /api/auth/login (Next.js API Route)
  |
  |── Proxy an mopilot-Backend (AUTH_API_URL)
  |     |── Backend 200 OK → JWT + User + Cookie setzen
  |     |── Backend Fehler  → "Ungültige Anmeldedaten"
  |
  |── Backend nicht erreichbar → "Server nicht erreichbar"
```

**Umgebungsvariable:**
```
AUTH_API_URL=http://backend-ns8wok04s4sgkcggwg48okcg:8000
```

### 5.7 Middleware und Cookie-basierter Zugangschutz

Alle Kundenassistenten-Frontends (zeo-kunden, cc-kunden) verwenden dasselbe Middleware-Pattern:

**Cookie-Details:**

| Eigenschaft | Wert |
|-------------|------|
| Name | `demo_auth` |
| Wert | `mopilot_demo_authenticated` |
| httpOnly | true |
| secure | true (Production) |
| sameSite | lax |
| maxAge | 8 Stunden |

**Middleware-Logik:**
1. Erlaubte Pfade (kein Cookie nötig): `/login`, `/api/auth/*`, `/api/chat/*`, `/api/health`
2. Alle anderen Pfade: Cookie `demo_auth` muss den Wert `mopilot_demo_authenticated` haben
3. Fehlender/falscher Cookie → Redirect zu `/login`

**Wichtig:** Die Middleware prüft NICHT den JWT-Token. Sie ist ein einfacher Boolean-Gate. Die eigentliche Autorisierung (JWT-Prüfung) findet auf Backend-Ebene statt.

**Hinweis CC-Kunden:** Die Middleware erlaubt zusätzlich `/api/chat/*`, `/api/health`, `/api/tariffs` und `/embed/*` durch. `/api/chat/*` und `/api/health` werden über Next.js Rewrites an den Backend-Container proxied (siehe 11.4). `/api/tariffs` liefert Tarifdaten für die Embed-Seite. `/embed/*` sind öffentliche Seiten (ohne Login), die per iframe eingebettet werden können (z.B. `/embed/tarife` für die Tarifübersicht).

Die Ideenplattform (ideen.mopilot.website) hat ihre eigene Auth-Logik im Frontend (`useAuth` Hook), die direkt JWT-basiert arbeitet, ohne Cookie-Middleware.

### 8.8 Header-Anzeige des eingeloggten Users

Auf allen Plattformen wird der eingeloggte User im Header angezeigt:

**mopilot.website** (`/opt/mopilot/frontend/app/page.tsx`):
```
Rollenbasiertes Demo Cockpit · {name} ({Rolle})
```
- Liest `user` aus localStorage
- ROLE_LABELS-Mapping für deutsche Rollennamen

**ideen.mopilot.website** (`/opt/mopilot/ideen/frontend/src/components/Header.tsx`):
```
Ideenplattform · {name} ({role_name || user_type})
```
- Nutzt `useAuth` Hook, User-Objekt hat `role_name` Property
- role_name kommt vom Backend (UserOut Schema mit `role_name` Feld)

**zeo-kunden.mopilot.website** (`/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/components/Header.tsx`):
```
powered by MoPilot · {name} ({Rolle})
```

**cc-kunden.mopilot.website** (`/opt/cc-kunden/frontend/src/components/Header.tsx`):
```
CC Kundenassistent · {name} ({Rolle})
```

### 5.9 JWT-Token und Passwort-Hashing

**JWT-Konfiguration:**

| Eigenschaft | Hauptsystem | Ideenplattform |
|-------------|-------------|----------------|
| Bibliothek | python-jose | PyJWT |
| Algorithmus | HS256 | HS256 |
| Gültigkeit | 8 Stunden | (Standard) |
| Claims | sub, email, role, operator, name | sub (user-id), purpose |
| Secret Key | mopilot-jwt-secret-change-in-production | (aus .env) |

**Passwort-Hashing:**

Beide Systeme verwenden `passlib[bcrypt]` mit bcrypt-Hashing. Die Hashes sind **direkt kompatibel** — ein in der Ideenplattform gesetztes Passwort kann ohne Neuberechnung in der mopilot-DB verwendet werden.

### 5.10 Demo-Accounts (Seeded Users)

**In der mopilot-DB (seed.py):** 12 Demo-Accounts mit Passwort `mopilot2026`:

| Rolle | E-Mail | Name | Operator |
|-------|--------|------|----------|
| ENDKUNDE | endkunde@mopilot.website | Maria Muller | zeo |
| STATIONSPATE | stationspate@mopilot.website | Thomas Weber | zeo |
| HOTLINE | hotline@mopilot.website | Sarah Schmidt | zeo |
| BETREIBER | betreiber@mopilot.website | Christian Will | zeo |
| FLOTTENMANAGEMENT | flotte@mopilot.website | Michael Braun | zeo |
| FAHRZEUGBETREUER | fahrzeug@mopilot.website | Lisa Klein | zeo |
| PLATTFORM_SUPPORT | support@mopilot.website | Jan Neumann | zeo |
| PROJEKTTRAEGER | traeger@mopilot.website | Dr. Petra Lang | zeo |
| FAHRZEUGSTELLER | steller@mopilot.website | Frank Hoffmann | zeo |
| VALIDIERUNGSSTELLE | validierung@mopilot.website | Anna Fischer | zeo |
| ENDKUNDE | endkunde-cc@mopilot.website | Klaus Becker | cc |
| BETREIBER | betreiber-cc@mopilot.website | Sabine Richter | cc |

**In der mopilot_ideen-DB (seed.py):**
- 1 Admin-Account: admin@mopilot.website
- 10 Rollen mit Taglines
- 30 Seed-Ideen

**Demo-Login auf mopilot.website:**
- Benutzername: `mopilot` / Passwort: `mopilot2027` (setzt nur Cookie, kein JWT)
- Alternativ: jede der 12 Demo-E-Mails mit Passwort `mopilot2026`

### 5.11 Zusammenfassung: Auth-Architektur-Diagramm

```
+--[ Registrierung ]--------------------------------------+
|                                                          |
|  ideen.mopilot.website/register                          |
|  → User in mopilot_ideen DB (email_verified=false)       |
|  → Verify-Mail (IONOS SMTP)                              |
|  → Nach Verify: Sync → mopilot DB                        |
|                                                          |
+--[ Passwort-Reset ]--------------------------------------+
|                                                          |
|  ideen.mopilot.website/passwort-zuruecksetzen            |
|  → Neuer Hash in mopilot_ideen DB                        |
|  → Sync neuer Hash → mopilot DB                          |
|                                                          |
+--[ Login mopilot.website ]-------------------------------+
|                                                          |
|  /login (Next.js)                                        |
|  → API Route proxyt an mopilot-Backend                   |
|  → Fallback: Demo-Login (mopilot/mopilot2027)           |
|  → Setzt demo_auth Cookie + JWT in localStorage          |
|                                                          |
+--[ Login zeo-kunden / cc-kunden ]------------------------+
|                                                          |
|  /login (Next.js)                                        |
|  → API Route proxyt an mopilot-Backend                   |
|  → Setzt demo_auth Cookie + JWT in localStorage          |
|                                                          |
+--[ Login ideen.mopilot.website ]-------------------------+
|                                                          |
|  /login (React)                                          |
|  → Direkt an Ideen-Backend /api/auth/login               |
|  → JWT in localStorage (useAuth Hook)                    |
|  → Kein Cookie-Middleware (eigenes Auth-System)          |
|                                                          |
+--[ Datenbanken ]----------------------------------------+
|                                                          |
|  PostgreSQL 16 (1 Server, 2 Datenbanken):                |
|                                                          |
|  mopilot_ideen:                                          |
|    users (email, name, password_hash, role_id,           |
|           email_verified, user_type)                     |
|                                                          |
|  mopilot:                                                |
|    users (email, name, hashed_password, role [ENUM],     |
|           operator, is_active)                           |
|    → Seeded: 12 Demo-Accounts (PW: mopilot2026)         |
|    → Synced: Alle verifizierten Ideen-User               |
|                                                          |
+----------------------------------------------------------+
```

---

## 6. ZEO Kundenassistent – Entwicklung und Deployment

### 6.1 Projektbeschreibung und Ziel

Der ZEO Kundenassistent richtet sich ausschließlich an Endkunden von ZEO Carsharing. Er beantwortet alle ZEO-relevanten Fragen via KI-Chat (SSE-Streaming) und bietet fünf interaktive Module:

- **KI-Chat (Hero-Element)**: SSE-Streaming-Assistent mit ZEO-Systemkontext
- **Modul 1 – Kostenrechner**: Optimaler Tarif (eco vs. eco plus)
- **Modul 2 – ÖPNV-Karte**: Leaflet/OpenStreetMap mit 12 ZEO-Stationen
- **Modul 3 – Reichweiten-Guide**: Temperaturabhängige Reichweite für 9 Fahrzeugmodelle
- **Modul 4 – Fahrzeugkatalog**: Filterbare Kacheln mit Specs
- **Modul 5 – Onboarding**: 6-Schritt-Guide und FAQ-Akkordeon

### 6.2 Technische Architektur

| Komponente | Technologie | Details |
|------------|-------------|---------|
| Frontend | Next.js 14, TailwindCSS (custom zeo-Palette) | Cookie-Middleware, Auth-Proxy, HOSTNAME=0.0.0.0 |
| Backend | FastAPI (Python 3.11) | SSE-Streaming, /api/health Endpoint |
| KI-Modell | Claude claude-sonnet-4-6 | Anthropic API |
| Datenhaltung | Statische JSON-Dateien | vehicles, tariffs, stations, faq |
| Auth | Proxy an mopilot-Backend | AUTH_API_URL=http://backend-ns8wok04s4sgkcggwg48okcg:8000 |
| Secrets | `env_file: .env` für ANTHROPIC_API_KEY | Siehe Kapitel 12 |
| Reverse Proxy | Traefik (via Coolify) | SSL, Routing, traefik.docker.network=coolify |
| Deployment | Docker Compose | restart: unless-stopped, Health-Checks, ab v0.5 via CI/CD |

**ZEO Custom Tailwind-Palette:**
```
zeo-50: #f0fdf4, zeo-100: #dcfce7, ..., zeo-600: #00a651 (Primär), ..., zeo-800: #006b33, zeo-900: #14532d
```

### 6.3 Entwicklungsprozess

Die Applikation wurde in einer einzigen Session mit Claude Code entwickelt (35 Dateien, 2.736 Codezeilen). Datenbasis aus vier PDF-Dateien extrahiert.

### 6.4 Deployment-Ablauf

Ab v0.5 automatisch via CI/CD:
```
git push master
  → rsync MoPilot_ZEO_Kunden/ → /opt/zeo-kunden/
  → docker compose up -d --build
  → Live unter zeo-kunden.mopilot.website
```

### 6.5 Live-System

| Ort | Pfad / URL |
|-----|------------|
| Lokal | C:\Users\james\Projekte\MoPilot\MoPilot_ZEO_Kunden\ |
| GitHub | github.com/JamesMz05/mopilot (master) |
| Server (Git-Quelle) | /opt/mopilot/MoPilot_ZEO_Kunden/ |
| Server (laufend) | /opt/zeo-kunden/ |
| Frontend | https://zeo-kunden.mopilot.website |
| Backend | https://api.zeo-kunden.mopilot.website/api/health |

---

## 7. Benutzerverwaltung, Bugfixes und E-Mail-Optimierung – NEU in v0.71

### 7.1 Übersicht der Änderungen

| # | Änderung | Typ | Schwere |
|---|----------|-----|---------|
| 1 | User-Sync bei Passwort-Reset: UPSERT statt UPDATE | Bugfix | Kritisch |
| 2 | Hauptmenü als Startseite für alle User | UX-Verbesserung | Mittel |
| 3 | Login/Logout auf mopilot.website | Feature | Hoch |
| 4 | Admin-Seite: Benutzerverwaltung | Feature | Hoch |
| 5 | Neue Rolle: MOPILOT_TEAM | Feature | Mittel |
| 6 | Admin-User-Synchronisierung (Ideen → mopilot DB) | Bugfix | Hoch |
| 7 | E-Mail-Zustellbarkeit: Header, Plaintext, EHLO | Verbesserung | Hoch |
| 8 | DNS-Härtung: DKIM aktiviert, DMARC auf quarantine | Sicherheit | Hoch |

### 7.2 Bugfix: User-Sync bei Passwort-Reset (UPSERT statt UPDATE)

**Problem:** Benutzer, die sich auf `ideen.mopilot.website` registriert hatten, konnten sich nach Passwort-Reset nicht auf `zeo-kunden.mopilot.website` anmelden. Fehlermeldung: "E-Mail oder Passwort falsch".

**Ursache:** Die Funktion `update_password_in_mopilot()` in `user_sync.py` führte nur ein `UPDATE` aus. Benutzer, die vor Einführung des Sync-Codes registriert und verifiziert wurden, existierten nicht in der mopilot-DB. Das `UPDATE` auf eine nicht vorhandene Zeile hatte 0 betroffene Zeilen — ohne Fehlermeldung.

**Fix:** Im `reset_password`-Handler in `/opt/mopilot/ideen/backend/app/routers/auth.py` wird jetzt `sync_user_to_mopilot()` (UPSERT via `INSERT ... ON CONFLICT DO UPDATE`) statt `update_password_in_mopilot()` (reines UPDATE) aufgerufen.

### 7.3 Navigation: Hauptmenü als Startseite

Nach Login werden alle User jetzt auf das Hauptmenü (`/`) statt auf das rollenspezifische Dashboard (`/dashboard`) weitergeleitet.

### 7.4 Login/Logout auf mopilot.website

Im Header der Startseite (`/opt/mopilot/frontend/app/page.tsx`) wurden Buttons hinzugefügt:
- **Anmelden**: Link auf `/login` (Anmeldeseite mit E-Mail/Passwort-Formular)
- **Abmelden**: Löscht `user` und `token` aus localStorage, ruft `/api/auth/logout` auf (Cookie wird gelöscht)

### 7.5 Admin-Seite: Benutzerverwaltung

**Neue Seite:** `https://mopilot.website/admin` – nur für `admin@mopilot.website` zugänglich.

**Funktionen:**

| Funktion | Beschreibung |
|----------|--------------|
| User-Liste | Tabelle mit ID, Name, E-Mail, Rolle, Operator, Status |
| Rollen ändern | Dropdown pro User – ändert die Rolle sofort per PUT-Request |
| Zugriffschutz | Client: E-Mail-Check, Server: `require_admin` Dependency |

### 7.6 Neue Rolle: MOPILOT_TEAM

**Zweck:** Interne Rolle für das MoPilot-Projektteam. Diese Rolle wird **nicht** im Registrierungsformular auf ideen.mopilot.website angezeigt — sie kann nur über die Admin-Benutzerverwaltung zugewiesen werden.

### 7.7 Admin-User-Synchronisierung (Ideen → mopilot DB)

Sonderbehandlung für `admin@mopilot.website` in der Sync-Funktion: Admin wird als `MOPILOT_TEAM` synchronisiert, auch wenn `role_id=None`.

### 7.8 E-Mail-Zustellbarkeit verbessert

Verbesserte Header (From, Reply-To, Date, Message-ID), multipart/alternative mit Plaintext-Fallback, korrekter EHLO-Hostname (`mopilot.website`), 30s Timeout.

### 7.9 DNS-Härtung (DKIM, DMARC)

**DKIM aktiviert** — 3 CNAME-Records im IONOS DNS:

| Hostname | Typ | Ziel |
|----------|-----|------|
| `s1-ionos._domainkey` | CNAME | `s1-ionos._domainkeys1.dkim.ionos.com` |
| `s2-ionos._domainkey` | CNAME | `s2-ionos._domainkeys2.dkim.ionos.com` |
| `s42582890._domainkey` | CNAME | `s42582890._domainkeys42582890.dkim.ionos.com` |

**DMARC:** TXT-Record `v=DMARC1; p=quarantine; rua=mailto:admin@mopilot.website`

**SPF:** `v=spf1 include:_spf-eu.ionos.com ~all` (unverändert)

### 10.10 Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `/opt/mopilot/ideen/backend/app/routers/auth.py` | reset_password: UPSERT statt UPDATE |
| `/opt/mopilot/ideen/backend/app/user_sync.py` | Admin-Sonderbehandlung, MOPILOT_TEAM Mapping |
| `/opt/mopilot/ideen/backend/app/email.py` | Verbesserte Header, Plaintext-Fallback, EHLO, Timeout |
| `/opt/mopilot/backend/app/models/models.py` | MOPILOT_TEAM Enum-Wert |
| `/opt/mopilot/backend/app/main.py` | ALTER TYPE Migration, Admin-Router, ensure_admin_user |
| `/opt/mopilot/backend/app/core/auth.py` | require_admin Dependency |
| `/opt/mopilot/backend/app/core/seed.py` | ensure_admin_user() Funktion |
| `/opt/mopilot/backend/app/api/admin.py` | **NEU** – Admin-API (Users, Roles, Role-Change) |
| `/opt/mopilot/frontend/app/admin/page.tsx` | **NEU** – Admin-Seite (Benutzerverwaltung) |
| `/opt/mopilot/frontend/app/page.tsx` | Anmelden/Abmelden, Footer-Link, loginAs via API-Route, ROLE_LABELS |
| `/opt/mopilot/frontend/app/login/page.tsx` | Redirect nach Login: `/dashboard` → `/` |
| `/opt/mopilot/frontend/app/dashboard/page.tsx` | Hauptmenü-Link, ROLE_META für mopilot_team |

---

## 8. CC Kundenassistent – NEU in v0.72

### 8.1 Projektbeschreibung und Ziel

Der CC Kundenassistent (cc-kunden.mopilot.website) ist das zweite Kundenportal neben dem ZEO Kundenassistenten. Er richtet sich an Mitglieder und Interessenten der Car&RideSharing Community eG und bietet einen KI-Chat sowie fünf interaktive Module – analog zum ZEO Kundenassistenten, aber mit vollständig eigenem Branding, eigenen Inhalten und einem verbesserten API-Proxy-Pattern.

### 8.2 Betreiber: Car&RideSharing Community eG

| Eigenschaft | Wert |
|-------------|------|
| Name | Car&RideSharing Community eG (kurz: CC) |
| Rechtsform | Bürgergenossenschaft |
| Region | Overath, Oberbergischer Kreis, Rhein-Sieg-Kreis (NRW) |
| Standorte | 12 Stationen in der Region |
| Buchungsplattform | cc.evemo.app |
| RideSharing-Partner | goFlux (goflux.de) |
| Website | carsharing2go.net / sharing-community.de |
| Kontakt | cc-flottenmanagement@vianova.coop |
| Betriebspartner | Vianova eG |

**Tarife:**

| Tarif | Grundgebühr | Inklusivleistung | Besonderheit |
|-------|-------------|------------------|--------------|
| CC eco | 19 €/Monat | 5 Freistunden/Monat | Für regelmäßige Nutzer |
| CC go | 0 €/Monat | Keine | Flexibel, nutzungsbasiert |

### 8.3 Technische Architektur

| Komponente | Technologie | Details |
|------------|-------------|---------|
| Frontend | Next.js 14, TailwindCSS (custom cc-Palette) | Cookie-Middleware, Auth-Proxy, API-Proxy (Rewrites) |
| Backend | FastAPI (Python 3.11) | SSE-Streaming, JSON-Wissensbasis, /api/health |
| KI-Modell | Claude claude-sonnet-4-6 | Anthropic API, CC-spezifischer System-Prompt |
| Datenhaltung | Statische JSON-Dateien | vehicles, tariffs, stations, faq, cc_knowledge |
| Auth | Proxy an mopilot-Backend | AUTH_API_URL=http://backend-ns8wok04s4sgkcggwg48okcg:8000 |
| Secrets | `env_file: .env` für ANTHROPIC_API_KEY | Siehe Kapitel 12 |
| Reverse Proxy | Traefik (via Coolify) | SSL, Routing, traefik.docker.network=coolify |
| Deployment | Docker Compose (manuell) | restart: unless-stopped, Health-Checks |

**CC Custom Tailwind-Palette:**
```
cc-50: #f0fdf4, cc-100: #dcfce7, ..., cc-600: #00a651 (Primär), ..., cc-800: #006b33, cc-900: #14532d
```

**Backend-Wissensbasis (JSON-Dateien in `/opt/cc-kunden/backend/data/`):**

| Datei | Inhalt |
|-------|--------|
| `vehicles.json` | CC-Fahrzeugflotte mit Reichweiten und Specs |
| `stations.json` | 12 CC-Stationen mit Koordinaten |
| `tariffs.json` | CC eco und CC go Tarife |
| `faq.json` | 3 Kategorien CC-spezifischer FAQs |
| `cc_knowledge.json` | Zusätzliches Wissen über CC (Genossenschaft, Standortpaten, RideSharing) |

### 8.4 API-Proxy-Pattern (Next.js Rewrites)

Im Gegensatz zum ZEO Kundenassistent (der ein eigenes API-Subdomain `api.zeo-kunden.mopilot.website` hat) verwendet der CC Kundenassistent ein **API-Proxy-Pattern**: Chat- und Health-Anfragen werden über das Frontend an das Backend weitergeleitet.

**Vorteile:**
- Kein separater DNS-Eintrag für API-Subdomain nötig
- Kein separates TLS-Zertifikat für API-Domain
- Keine CORS-Konfiguration erforderlich (Same-Origin)
- Einfacheres Deployment

**Implementierung in `next.config.js`:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || '',
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://cc-kunden-backend:8000'
    return [
      {
        source: '/api/chat/:path*',
        destination: `${backendUrl}/api/chat/:path*`,
      },
      {
        source: '/api/health',
        destination: `${backendUrl}/api/health`,
      },
    ]
  },
}
module.exports = nextConfig
```

**Wichtig:** `NEXT_PUBLIC_BACKEND_URL` muss leer sein (nicht `http://localhost:8000`), damit relative URLs verwendet werden. JavaScript `||` behandelt leere Strings als falsy – daher muss der Fallback `''` sein, nicht ein localhost-URL:

```typescript
// RICHTIG:
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

// FALSCH (fetch würde an localhost gehen):
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
```

**Datenfluss:**

```
Browser (cc-kunden.mopilot.website)
  |
  |  POST /api/chat/stream  (relative URL)
  v
Next.js Frontend Container (:3000)
  |
  |  Rewrite → http://cc-kunden-backend:8000/api/chat/stream
  v
FastAPI Backend Container (:8000)
  |
  |  → Anthropic Claude API (extern)
  v
SSE-Stream zurück an Browser
```

### 8.5 Frontend-Module und Branding

| Modul | Komponente | CC-spezifische Anpassung |
|-------|-----------|--------------------------|
| KI-Chat | `HeroChat.tsx` | CC-Begrüßung, 6 CC-Vorschlagsfragen, CC-Fehlermeldung |
| Kostenrechner | `CostCalculator.tsx` | CC eco (19€/Monat) vs. CC go (0€/Monat), Schlüsselfakten |
| ÖPNV-Karte | `MapInner.tsx` | Kartenzentrum Overath (50.93, 7.28), Zoom 10, evemo.app-Links |
| Stationen | `TransitMap.tsx` | "CC-Stationen", 12 Standorte in Oberbergischem Kreis und Rhein-Sieg |
| Reichweiten-Guide | `RangeGuide.tsx` | Ziele ab Overath: Köln (28km), Bonn (35km), Siegburg (18km) etc. |
| Fahrzeugkatalog | `VehicleCards.tsx` | "CC-Fahrzeuge" |
| Onboarding | `OnboardingGuide.tsx` | 6 Schritte: Quiz → evemo.app → Führerschein → Station → Öffnen → Rückgabe |
| Tarifübersicht | `TariffOverview.tsx` | Detaillierte Tarifvergleichstabelle (CC eco vs. CC go), Fahrzeugklassen, km-Staffelpreise, basierend auf `tariffs-detailed.json` |
| FAQ | `faq.json` | 3 Kategorien CC-spezifischer FAQs |
| Footer | `Footer.tsx` | CC-Links: carsharing2go.net, sharing-community.de, cc.evemo.app, goflux.de |
| Header | `Header.tsx` | "CC Kundenassistent", Registrierung via cc.evemo.app/admin/signup |
| Login | `login/page.tsx` | CC-Branding |
| Layout | `layout.tsx` | CC-Metadaten (title, description, keywords, openGraph) |

### 8.6 Docker Compose Konfiguration

**Datei:** `/opt/cc-kunden/docker-compose.yml`

```yaml
services:
  cc-kunden-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_BACKEND_URL=
    environment:
      - NEXT_PUBLIC_BACKEND_URL=
      - AUTH_API_URL=http://backend-ns8wok04s4sgkcggwg48okcg:8000
      - HOSTNAME=0.0.0.0
      - BACKEND_INTERNAL_URL=http://cc-kunden-backend:8000
    restart: unless-stopped
    expose:
      - "3000"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3000/"]
      interval: 10s
      timeout: 5s
      retries: 3
    depends_on:
      - cc-kunden-backend
    networks:
      - cc-net
      - coolify
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=coolify"
      - "traefik.http.routers.cc-kunden-frontend.rule=Host(`cc-kunden.mopilot.website`)"
      - "traefik.http.routers.cc-kunden-frontend.tls=true"
      - "traefik.http.routers.cc-kunden-frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.cc-kunden-frontend.loadbalancer.server.port=3000"

  cc-kunden-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file: .env
    expose:
      - "8000"
    healthcheck:
      test: ["CMD-SHELL", "python3 -c \"import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health')\""]
      interval: 10s
      timeout: 5s
      retries: 3
    environment:
      - CLAUDE_MODEL=${CLAUDE_MODEL:-claude-sonnet-4-6}
      - CORS_ORIGINS=${CORS_ORIGINS:-https://cc-kunden.mopilot.website,http://localhost:3000}
      - ENVIRONMENT=${ENVIRONMENT:-production}
    networks:
      - cc-net
      - coolify
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=coolify"
      - "traefik.http.routers.cc-kunden-backend.rule=Host(`api.cc-kunden.mopilot.website`)"
      - "traefik.http.routers.cc-kunden-backend.tls=true"
      - "traefik.http.routers.cc-kunden-backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.cc-kunden-backend.loadbalancer.server.port=8000"

networks:
  cc-net:
    driver: bridge
  coolify:
    external: true
```

**Hinweis:** Die Backend-Traefik-Labels für `api.cc-kunden.mopilot.website` sind vorhanden, werden aber aktuell nicht genutzt (kein DNS-Eintrag). Der gesamte API-Verkehr läuft über das Frontend-Proxy-Pattern (11.4).

### 8.7 Live-System und Serverpfade

| Ort | Pfad / URL |
|-----|------------|
| Git-Quelle (Monorepo, NEU v0.74) | /opt/mopilot/cc-kunden/ |
| Server (laufende Instanz) | /opt/cc-kunden/ |
| Server Frontend | /opt/cc-kunden/frontend/ |
| Server Backend | /opt/cc-kunden/backend/ |
| Docker Compose | /opt/cc-kunden/docker-compose.yml |
| Secrets | /opt/cc-kunden/.env |
| Frontend | https://cc-kunden.mopilot.website |
| API Health (via Proxy) | https://cc-kunden.mopilot.website/api/health |

**Wichtige Frontend-Dateien:**

| Datei | Funktion |
|-------|----------|
| `frontend/next.config.js` | API-Proxy-Rewrites, NEXT_PUBLIC_BACKEND_URL |
| `frontend/src/middleware.ts` | Auth-Middleware mit `/api/chat`, `/api/health`, `/api/tariffs` und `/embed` Ausnahmen |
| `frontend/src/components/HeroChat.tsx` | KI-Chat mit SSE-Streaming |
| `frontend/src/components/CostCalculator.tsx` | Kostenrechner CC eco / CC go |
| `frontend/src/components/MapInner.tsx` | Leaflet-Karte, Zentrum Overath |
| `frontend/src/components/OnboardingGuide.tsx` | 6-Schritt-Registrierung |
| `frontend/src/components/Footer.tsx` | CC-Links und Kontakt |
| `frontend/src/data/faq.json` | CC-FAQs (3 Kategorien) |
| `frontend/src/data/tariffs-detailed.json` | Detaillierte Tarifdaten (Fahrzeugklassen, km-Staffelpreise) für TariffOverview |
| `frontend/src/components/TariffOverview.tsx` | Tarifvergleichs-Komponente (CC eco vs. CC go, Fahrzeugklassen) |
| `frontend/src/app/embed/tarife/page.tsx` | Öffentliche Embed-Seite für Tarifübersicht (ohne Login) |
| `frontend/src/app/embed/tarife/layout.tsx` | Minimales Layout für Embed-Seite (ohne Header/Footer) |
| `frontend/Dockerfile` | Multi-Stage Build, NEXT_PUBLIC_BACKEND_URL= (leer) |

### 8.8 Unterschiede zu ZEO Kundenassistent

| Aspekt | ZEO Kundenassistent | CC Kundenassistent |
|--------|--------------------|--------------------|
| API-Zugriff | Eigenes Subdomain `api.zeo-kunden...` | Proxy via Next.js Rewrites (kein eigenes API-Subdomain) |
| DNS-Einträge | 2 (Frontend + API) | 1 (nur Frontend) |
| CORS | Konfiguriert (cross-origin) | Nicht nötig (same-origin) |
| `NEXT_PUBLIC_BACKEND_URL` | `https://api.zeo-kunden.mopilot.website` | Leer (`''`) |
| CSS-Prefix | `zeo-*` (Brand) + `primary-*`, `surface-*` (Shared) | `cc-*` (Brand) + `primary-*`, `surface-*` (Shared) |
| Tailwind-Palette | Grüntöne (ZEO-Branding) + Shared Design System | Blautöne (CC-Branding) + Shared Design System |
| Design System | shared-ui Tailwind-Preset, font-display/font-body, shadow-warm-* | shared-ui Tailwind-Preset, font-display/font-body, shadow-warm-* |
| Region | Bruchsal (Landkreis Karlsruhe, BW) | Overath (Oberbergischer Kreis, NRW) |
| Standorte | 71 Stationen, 18 Gemeinden | 12 Stationen |
| Tarife | eco (0€/Monat) + eco plus (9,90€/Monat) | eco (19€/Monat) + go (0€/Monat) |
| Buchungsplattform | "mein zeo" App | cc.evemo.app |
| Backend-Wissensbasis | System-Prompt (inline) | System-Prompt + JSON-Dateien (vehicles, stations, tariffs, faq, cc_knowledge) |
| Git-Quelle | `/opt/mopilot/MoPilot_ZEO_Kunden/` | `/opt/mopilot/cc-kunden/` (NEU v0.74) |
| CI/CD | Automatisch (GitHub Actions + rsync) | Manuell, rsync aus Monorepo möglich (NEU v0.74) |

---

## 9. API-Key-Verwaltung und Secrets-Management – NEU in v0.72

### 9.1 Einheitliches Pattern für alle Projekte

Ab v0.72 verwenden alle Sub-Projekte mit Anthropic-API-Zugriff das gleiche Pattern für die API-Key-Verwaltung:

**Pattern:**

```
.env                     ← Enthält Secrets (ANTHROPIC_API_KEY=sk-ant-...)
docker-compose.yml       ← Backend-Service: env_file: .env
                         ← environment: nur für NICHT-sensitive Defaults
```

**Umsetzung in docker-compose.yml:**

```yaml
services:
  backend:
    build: ./backend
    env_file: .env              # ← Secrets aus .env laden
    environment:                # ← NUR nicht-sensitive Defaults
      - CLAUDE_MODEL=${CLAUDE_MODEL:-claude-sonnet-4-6}
      - CORS_ORIGINS=${CORS_ORIGINS:-https://xxx.mopilot.website}
      - ENVIRONMENT=${ENVIRONMENT:-production}
```

**Inhalt der `.env`-Datei:**

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Aktueller Stand:**

| Projekt | `.env`-Pfad | `env_file: .env` | Pattern konsistent |
|---------|-------------|-------------------|--------------------|
| ZEO-Kunden | `/opt/zeo-kunden/.env` | ✅ Ja | ✅ Ja (seit v0.72) |
| CC-Kunden | `/opt/cc-kunden/.env` | ✅ Ja | ✅ Ja |
| Hauptsystem | Coolify-managed | (Coolify UI) | ✅ Ja |
| Ideenplattform | `/opt/mopilot/ideen/.env` | — | Kein Anthropic-Key nötig |

### 9.2 Regeln für docker-compose.yml

1. **Secrets (API-Keys, Passwörter) → `env_file: .env`**
   - ANTHROPIC_API_KEY gehört in `.env`, NICHT in `environment:`
   - `.env`-Datei muss im selben Verzeichnis wie `docker-compose.yml` liegen

2. **Nicht-sensitive Defaults → `environment:` mit Fallback**
   - `CLAUDE_MODEL`, `CORS_ORIGINS`, `ENVIRONMENT` etc.
   - Syntax: `${VAR:-default}` für optionale Überschreibung

3. **ANTHROPIC_API_KEY NICHT in `environment:` aufnehmen**
   - `environment:` überschreibt `env_file` für gleichnamige Variablen
   - Wenn Docker Compose die `${ANTHROPIC_API_KEY}` Shell-Variable nicht auflösen kann, wird der Fallback-Wert (z.B. `sk-placeholder`) in den Container geschrieben – und überschreibt den echten Key aus `.env`

4. **Frontend-Env-Vars als Build-Args**
   - `NEXT_PUBLIC_*` Variablen werden zur Build-Zeit eingebettet
   - In `docker-compose.yml` als `args:` UND `environment:` setzen
   - Für CC-Kunden: `NEXT_PUBLIC_BACKEND_URL=` (leer, nicht weglassen!)

### 9.3 Bekannte Fallstricke

| Problem | Ursache | Lösung |
|---------|---------|--------|
| API-Key `sk-placeholder` trotz .env | `environment: ANTHROPIC_API_KEY=${...:-sk-placeholder}` überschreibt `env_file` | ANTHROPIC_API_KEY aus `environment:` entfernen |
| Doppelte Container (alte + neue) | `docker compose up` mit anderem Projektverzeichnis oder -namen erzeugt neue Container, alte laufen weiter | Alle alten Container mit `docker stop` + `docker rm` entfernen |
| Backend liefert 401 Authentication Error | ANTHROPIC_API_KEY ist `sk-placeholder` oder abgelaufen | `docker exec <container> env \| grep ANTHROPIC` prüfen |
| Chat-Fehlermeldung "nicht erreichbar" | Frontend-JS enthält `http://localhost:8000` | `NEXT_PUBLIC_BACKEND_URL` auf `''` setzen (nicht weglassen), Frontend neu bauen |
| `docker compose up` lädt .env nicht | Docker Compose liest `.env` für Interpolation, aber `environment:` hat Vorrang | `env_file: .env` explizit setzen, Secret-Variablen aus `environment:` entfernen |
| JavaScript `\|\|` Fallback auf localhost | Leerer String ist falsy in JS: `'' \|\| 'http://localhost:8000'` → localhost | Fallback muss `''` sein, nicht ein URL |

### 9.4 Checkliste für neue Sub-Projekte

Bei der Erstellung eines neuen Kundenassistenten (z.B. hotline.mopilot.website):

- [ ] `.env`-Datei mit `ANTHROPIC_API_KEY=sk-ant-...` anlegen
- [ ] `docker-compose.yml`: `env_file: .env` beim Backend-Service
- [ ] `docker-compose.yml`: ANTHROPIC_API_KEY **NICHT** in `environment:` aufnehmen
- [ ] `docker-compose.yml`: `HOSTNAME=0.0.0.0` beim Frontend
- [ ] `docker-compose.yml`: `traefik.docker.network=coolify` bei allen Services
- [ ] `docker-compose.yml`: `restart: unless-stopped` bei allen Services
- [ ] `docker-compose.yml`: Health-Checks für Frontend und Backend
- [ ] `docker-compose.yml`: `networks: coolify: external: true`
- [ ] Frontend: `NEXT_PUBLIC_BACKEND_URL=` (leer) wenn API-Proxy-Pattern
- [ ] Frontend: `BACKEND_INTERNAL_URL=http://<backend-service>:8000`
- [ ] Frontend: Middleware erlaubt `/api/chat/*` und `/api/health`
- [ ] Frontend: `next.config.js` Rewrites für API-Proxy
- [ ] Frontend: Fallback in Code: `process.env.NEXT_PUBLIC_BACKEND_URL || ''`
- [ ] Nach `docker compose up -d --build`: API-Key mit `docker exec <container> env | grep ANTHROPIC` verifizieren
- [ ] Test: `curl -s https://<domain>/api/health` → `{"status":"ok"}`
- [ ] Uptime Kuma: Monitore für Frontend und API hinzufügen

---

## 13. UI/UX-Redesign & Shared Design System – NEU in v0.73

### 13.1 Übersicht und Motivation

Das UI/UX-Redesign überführt alle 4 MoPilot-Plattformen von einem Prototyp-Look in ein professionelles, fördergeber-taugliches Design. Zentrales Element ist ein **Shared Design System**, das plattformübergreifend einheitliche Farben, Typografie, Schatten, Animationen und wiederverwendbare Komponenten bereitstellt.

**Ziele:**
- Einheitliches, professionelles Erscheinungsbild über alle 4 Plattformen
- Konsistente Design-Tokens (Farben, Schatten, Schriften, Abstände)
- Wiederverwendbare TSX-Komponenten für schnellere Entwicklung
- Accessibility-Grundlagen (Skip-Navigation, Focus-Visible, ARIA-Labels)
- SEO-Grundlagen (Open-Graph-Metadaten, SVG-Favicons)

### 13.2 Shared Design System (shared-ui)

**Pfad:** `/opt/mopilot/shared-ui/`

| Datei/Ordner | Inhalt |
|-------------|--------|
| `tailwind.preset.js` | Tailwind-Preset mit Farben, Fonts, Schatten, Animationen |
| `globals.css` | Google Fonts Import, Base-Styles, CSS-Animationen (typing-dot, cursor-blink, scrollbar-thin, card-hover, glass, text-gradient) |
| `components/ChatBubble.tsx` | Chat-Bubble + TypingIndicator mit Gradient-Avatar |
| `components/Header.tsx` | Glassmorphism-Header mit Scroll-Shadow, Nav-Underlines, User-Dropdown |
| `components/Footer.tsx` | Einheitlicher Footer mit font-display |
| `components/Button.tsx` | Gradient-Button mit Varianten |
| `components/Card.tsx` | Karten-Komponente mit card-hover |
| `components/Badge.tsx` | Status-Badge |
| `components/Input.tsx` | Form-Input mit Focus-Ring |
| `components/MoPilotLogo.tsx` | SVG-Logo-Komponente |
| `components/LoadingSpinner.tsx` | Lade-Animation |
| `components/TopographyBg.tsx` | Dekorativer Hintergrund |
| `components/PageTransition.tsx` | Seitenübergangs-Animation |
| `hooks/useScrollReveal.ts` | Scroll-Reveal mit IntersectionObserver |

**Integration in Frontends:**

```javascript
// tailwind.config.js in jedem Frontend
module.exports = {
  presets: [require('./shared-ui/tailwind.preset.js')],
  // ...
}
```

```css
/* globals.css in jedem Frontend */
@import '../shared-ui/globals.css';
/* oder @import './shared-ui/globals.css'; je nach Pfad */
```

### 13.3 Tailwind-Preset und Farbpalette

| Farbkategorie | CSS-Klasse | Hex-Werte | Verwendung |
|--------------|------------|-----------|------------|
| Primary (Petrol/Teal) | `primary-50` bis `primary-950` | #F0FDFA → #0A3D38 (Kernton: #0F766E) | Hauptfarbe, CTAs, Links, Branding |
| Accent (Amber) | `accent-50` bis `accent-900` | #FFFBEB → #78350F (Kernton: #F59E0B) | Akzente, Highlights, Logos |
| Surface (Warm Grays) | `surface-50` bis `surface-900` | #FAFAF5 → #171717 | Hintergründe, Text, Borders |
| ZEO Brand | `zeo-*` | Grüntöne | ZEO-spezifisches Branding (Header, Footer, Chat) |
| CC Brand | `cc-*` | Blautöne | CC-spezifisches Branding (Header, Footer, Chat) |

**Schatten (Box-Shadow):**

| Klasse | Wert | Verwendung |
|--------|------|------------|
| `shadow-warm-sm` | `0 1px 3px rgba(15, 118, 110, 0.08)` | Karten, Badges |
| `shadow-warm-md` | `0 4px 12px rgba(15, 118, 110, 0.1)` | Hover-Effekte |
| `shadow-warm-lg` | `0 8px 30px rgba(15, 118, 110, 0.12)` | Modale, Chat-Container |
| `shadow-warm-xl` | `0 20px 50px rgba(15, 118, 110, 0.15)` | Hero-Elemente |

### 13.4 Typografie

| Klasse | Schriftfamilie | Gewichte | Verwendung |
|--------|---------------|----------|------------|
| `font-display` | Plus Jakarta Sans | 400–800 | Überschriften (h1–h4), Logo, Zahlen, Branding |
| `font-body` | DM Sans | 400–700 | Fließtext, Labels, Buttons, Chat-Nachrichten |

Beide Fonts werden via Google Fonts CDN geladen (in `globals.css`).

### 13.5 Phasen-Übersicht des Redesigns

| Phase | Beschreibung | Geänderte Plattformen |
|-------|-------------|----------------------|
| 0 | Shared Design System erstellt (Tailwind-Preset, globals.css, TSX-Komponenten) | shared-ui |
| 1 | Login-Seiten: Glassmorphism, MoPilot-Logo, Gradient-Buttons | mopilot, ZEO, CC |
| 2 | Header & Navigation: Glassmorphism, User-Avatar, animierte Underlines | mopilot |
| 3 | Hauptseiten: Rollenauswahl, Ideen-Board, Admin-Dashboard, ZEO/CC Bulk-Migration (gray→surface, shadow→shadow-warm) | alle 4 |
| 4 | KI-Chat: Gradient-Avatare, typing-dot, animate-fade-in-up, scrollbar-thin | mopilot, ZEO, CC |
| 5 | Polish: SVG-Favicons, OG-Metadaten, Skip-Nav, font-display-Headings, Middleware-Fix | alle 4 |

### 13.6 Geänderte Dateien

**Mopilot Hauptsystem (frontend/):**

| Datei | Änderungen |
|-------|-----------|
| `app/layout.tsx` | metadataBase, OG-Tags, keywords, Skip-Nav |
| `app/page.tsx` | ZONE_STYLES, farbcodierte Rollenkarten, font-body/display, id="main-content" |
| `app/dashboard/page.tsx` | Glassmorphism-Header, Gradient-Avatare im Chat, typing-dot, scrollbar-thin |
| `app/login/page.tsx` | Glassmorphism-Card, MoPilot-Logo-SVG, Gradient-Button |
| `app/globals.css` | Import shared-ui globals.css |
| `app/icon.svg` | SVG-Favicon (Routen-Motiv mit Petrol + Amber) |
| `middleware.ts` | icon.svg in Matcher-Exclusion |
| `tailwind.config.js` | Preset: shared-ui/tailwind.preset.js |

**Ideenplattform (ideen/frontend/):**

| Datei | Änderungen |
|-------|-----------|
| `src/app/layout.tsx` | metadataBase, OG-Tags, keywords, Skip-Nav |
| `src/app/page.tsx` | CATEGORY_STYLES, farbige Badges, Gradient-CTA |
| `src/app/admin/page.tsx` | Stats-Karten, Tabellen mit Design-Tokens |
| `src/app/client-layout.tsx` | id="main-content" |
| `src/app/icon.svg` | SVG-Favicon (Glühbirne) |

**ZEO Kundenassistent (zeo-kunden/frontend/):**

| Datei | Änderungen |
|-------|-----------|
| `src/app/layout.tsx` | metadataBase, OG-Tags erweitert, Skip-Nav |
| `src/app/page.tsx` | id="main-content" |
| `src/app/icon.svg` | SVG-Favicon (grünes "ZEO") |
| `src/middleware.ts` | icon.svg in Matcher-Exclusion |
| `src/components/HeroChat.tsx` | Gradient-Avatare, typing-dot, font-body/display, shadow-warm-lg, animate-fade-in-up, Gradient-Senden |
| `src/components/Header.tsx` | font-display, Glassmorphism |
| `src/components/Footer.tsx` | font-display |
| `src/components/*.tsx` (alle) | gray→surface, shadow-sm→shadow-warm-sm, font-extrabold→font-bold font-display |

**CC Kundenassistent (cc-kunden/frontend/):**

| Datei | Änderungen |
|-------|-----------|
| Identisch zu ZEO | Gleiche Änderungen mit `cc-*` statt `zeo-*` Branding |

### 13.7 Build-Workflow mit sync-shared-ui.sh

Da Docker-Builds keine Symlinks aus übergeordneten Verzeichnissen unterstützen, wird das Shared Design System vor jedem Build physisch in die Frontends kopiert:

**Script: `/opt/mopilot/sync-shared-ui.sh`**

```bash
#!/bin/bash
# Kopiert shared-ui in alle 4 Frontends
TARGETS=(
  "/opt/mopilot/frontend/shared-ui"
  "/opt/mopilot/ideen/frontend/shared-ui"
  "/opt/zeo-kunden/frontend/shared-ui"
  "/opt/cc-kunden/frontend/shared-ui"
)
for target in "${TARGETS[@]}"; do
  rm -rf "$target"
  cp -r /opt/mopilot/shared-ui "$target"
  echo "Synced shared-ui → $target"
done
```

**Build-Reihenfolge:**

```bash
# 1. Shared-UI synchronisieren
bash /opt/mopilot/sync-shared-ui.sh

# 2. Frontends bauen (parallel möglich)
cd /data/coolify/services/ns8wok04s4sgkcggwg48okcg && docker compose build frontend
cd /opt/mopilot/ideen && docker compose build ideen-frontend
cd /opt/zeo-kunden && docker compose build frontend
cd /opt/cc-kunden && docker compose build cc-kunden-frontend

# 3. Deployen
docker compose up -d <service>
```

---

## 15. CC-Kunden Monorepo-Integration & Bugfix – NEU in v0.74

### 15.1 Übersicht

In v0.74 wird der CC-Kunden-Quellcode ins Git-Monorepo aufgenommen. Bisher existierte der Code ausschließlich auf dem Server unter `/opt/cc-kunden/` und war nicht versioniert. Zusätzlich wird ein durch `git reset --hard` verlorener Enum-Wert im Backend-Datenmodell wiederhergestellt.

### 15.2 CC-Kunden ins Git-Monorepo aufgenommen

**Motivation:** Der CC Kundenassistent wurde in v0.72 direkt auf dem Server entwickelt und war nicht im Git-Repository enthalten. Das bedeutete: keine Versionierung, kein Code-Review, kein reproduzierbares Deployment aus dem Repository heraus. Mit der Monorepo-Integration ist der gesamte MoPilot-Quellcode nun an einem Ort versioniert.

**Umsetzung:** Der vollständige CC-Kunden-Quellcode (Frontend, Backend, Docker Compose, Datenfiles) wurde unter `cc-kunden/` ins Monorepo aufgenommen:

```
/opt/mopilot/
├── frontend/                    # Hauptsystem
├── backend/                     # Hauptsystem
├── ideen/                       # Ideenplattform
├── MoPilot_ZEO_Kunden/          # ZEO-Kunden (Git-Quelle)
├── cc-kunden/                   # CC-Kunden (NEU v0.74)
│   ├── frontend/
│   │   ├── src/
│   │   ├── shared-ui/
│   │   ├── Dockerfile
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tailwind.config.js
│   ├── backend/
│   │   ├── main.py
│   │   ├── data/                # JSON-Wissensbasis
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── docker-compose.yml
│   ├── .env.example
│   └── .gitignore
├── shared-ui/                   # Shared Design System
├── docker-compose.yml           # Hauptsystem
└── sync-shared-ui.sh
```

**Deployment-Pfade (analog zu ZEO-Kunden):**

| Aspekt | ZEO-Kunden | CC-Kunden (ab v0.74) |
|--------|-----------|---------------------|
| Git-Quelle | `/opt/mopilot/MoPilot_ZEO_Kunden/` | `/opt/mopilot/cc-kunden/` |
| Laufende Instanz | `/opt/zeo-kunden/` | `/opt/cc-kunden/` |
| Sync-Methode | rsync (via GitHub Actions) | rsync (manuell, CI/CD-Integration vorbereitet) |
| Secrets (.env) | `/opt/zeo-kunden/.env` | `/opt/cc-kunden/.env` (nicht im Git) |

### 15.3 Aktualisierte Pfadstruktur

Die Serverpfad-Tabelle (Kapitel 2.2) wurde um die Git-Quelle für CC-Kunden erweitert:

| System | Pfad | Bemerkung |
|--------|------|-----------|
| CC-Kunden (Git-Quelle) | `/opt/mopilot/cc-kunden/` | NEU in v0.74 – versionierter Quellcode |
| CC-Kunden (laufende Instanz) | `/opt/cc-kunden/` | Wie bisher – Docker Compose läuft hier |

**Wichtig:** Die `.env`-Datei mit dem `ANTHROPIC_API_KEY` liegt weiterhin nur in `/opt/cc-kunden/.env` (laufende Instanz) und wird nicht ins Git committed. Die Datei `cc-kunden/.env.example` im Repository dient als Vorlage.

### 15.4 Bugfix: MOPILOT_TEAM Enum wiederhergestellt

**Problem:** Durch ein `git reset --hard` auf dem Server ging der Enum-Wert `MOPILOT_TEAM` in der `UserRole`-Klasse verloren. Dieser war in v0.71 eingeführt worden (siehe Kapitel 10.6).

**Fix:** Der Enum-Wert wurde in `backend/app/models/models.py` wiederhergestellt:

```python
class UserRole(str, enum.Enum):
    ENDKUNDE = "endkunde"
    STATIONSPATE = "stationspate"
    HOTLINE = "hotline"
    BETREIBER = "betreiber"
    FLOTTENMANAGEMENT = "flottenmanagement"
    FAHRZEUGBETREUER = "fahrzeugbetreuer"
    PLATTFORM_SUPPORT = "plattform-support"
    PROJEKTTRAEGER = "projekttraeger"
    FAHRZEUGSTELLER = "fahrzeugsteller"
    VALIDIERUNGSSTELLE = "validierungsstelle"
    MOPILOT_TEAM = "mopilot_team"          # ← wiederhergestellt in v0.74
```

**Auswirkung:** Ohne diesen Enum-Wert konnten Benutzer mit der Rolle `MOPILOT_TEAM` sich nicht einloggen bzw. erhielten Validierungsfehler im Backend.

### 15.5 Auswirkungen auf Deployment

**Aktuell (v0.74):** CC-Kunden wird weiterhin manuell deployed. Der rsync-Befehl kann nun aber aus dem Monorepo erfolgen:

```bash
# Quellcode aus Monorepo synchronisieren (ohne .env und Build-Artefakte)
rsync -av --delete \
  --exclude .env \
  --exclude node_modules \
  --exclude __pycache__ \
  --exclude .next \
  /opt/mopilot/cc-kunden/ /opt/cc-kunden/

# Rebuild
cd /opt/cc-kunden && docker compose down && docker compose up -d --build
```

**Geplant:** Integration in die GitHub Actions Pipeline analog zu ZEO-Kunden (rsync + automatischer Rebuild bei Push auf master).

### 15.6 Geänderte Dateien

| Commit | Datei(en) | Änderung |
|--------|----------|----------|
| `ca5e8fe` | `cc-kunden/**` (61 Dateien, +5629 Zeilen) | CC-Kunden komplett ins Monorepo aufgenommen |
| `d2018ab` | `backend/app/models/models.py` (+1 Zeile) | MOPILOT_TEAM Enum wiederhergestellt |
| `b753857`, `3e93fda` | `CLAUDE.md` (+2 Zeilen) | Infrastruktur-Notizen aktualisiert |

---


# Kapitel 16 & 17: MoPilot v0.8 – User-Sync Fix, Login Self-Service & Dashboard Vianova

---

## Kapitel 16: User-Sync Fix, Login Self-Service & Dashboard Vianova – NEU in v0.8

### 16.1 Übersicht der Änderungen

| # | Änderung | Typ | Schwere |
|---|----------|-----|---------|
| 1 | User-Sync: Erweitertes Logging und DB-Konnektivitätstest in user_sync.py | Bugfix | Kritisch |
| 2 | User-Sync: Differenzierte Fehlerbehandlung (OperationalError, InvalidTextRepresentation) | Bugfix | Hoch |
| 3 | ZEO Login: "Passwort vergessen?" Link zu ideen.mopilot.website/passwort-vergessen | Feature | Mittel |
| 4 | ZEO Login: "Noch kein Konto? Jetzt registrieren" Link zu ideen.mopilot.website/register | Feature | Mittel |
| 5 | CC Login: Gleiche Links wie ZEO | Feature | Mittel |
| 6 | Dashboard: "Beispiel Vianova Fahrzeugverwaltung" Abschnitt mit Screenshot + Link | Feature | Mittel |
| 7 | Dashboard: Bild 260405_BeispielCCfuhrpark_dashboard.jpg in public/images/ | Asset | Niedrig |
| 8 | ZEO docker-compose.yml: Healthcheck Quoting-Bug behoben | Bugfix | Niedrig |
| 9 | Hauptsystem: Fehlende leaflet/react-leaflet Dependencies ergänzt | Bugfix | Niedrig |

### 16.2 User-Sync: Verbessertes Logging und Fehlerbehandlung

Die Datei `/opt/mopilot/ideen/backend/app/user_sync.py` wurde mit erweiterten Diagnosefunktionen und präziserer Fehlerbehandlung aktualisiert:

**Neue Funktion: `test_mopilot_db_connection()`**
- Führt Konnektivitätstests durch, um DB-Probleme frühzeitig zu erkennen
- Ermöglicht diagnostische Überprüfungen ohne produktive Syncs zu beeinflussen

**Erweiterte `sync_user_to_mopilot()` Funktion:**
- `logger.info()` Einträge bei Start und erfolgreicher Durchführung jedes Syncs
- Separate Exception-Handler für `psycopg2.errors.InvalidTextRepresentation` (ENUM-Typkonflikt bei Rollen)
- Separate Exception-Handler für `psycopg2.OperationalError` (Verbindungsfehler)
- Aussagekräftige Fehlermeldungen mit spezifischen Lösungsvorschlägen

**ROLE_MAPPING bleibt unverändert:**
- Alle 11 Rollen aus dem Hauptsystem werden konsistent gemappt
- Einschließlich `mopilot-team` → `MOPILOT_TEAM`

**SQL-Logik unverändert:**
- INSERT ON CONFLICT DO UPDATE Pattern bleibt bestehen

### 16.3 Login-Seiten: Self-Service-Funktionen

Beide Login-Seiten (ZEO und CC Kunden) zeigen nun Self-Service-Links:

**"Passwort vergessen?"**
- Verlinkt zu: `https://ideen.mopilot.website/passwort-vergessen`
- Dies ist die **Anforderungsseite**, nicht die Token-Reset-Seite
- User geben E-Mail ein und erhalten Reset-Link per Mail

**"Noch kein Konto? Jetzt registrieren"**
- Verlinkt zu: `https://ideen.mopilot.website/register`
- Zentrale Registrierungsseite der MoPilot-Ideenplattform

**Footer-Hinweis:**
"Die Registrierung erfolgt zentral auf der MoPilot-Ideenplattform."

**Geänderte Dateien:**
- `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/login/page.tsx`
- `/opt/mopilot/cc-kunden/frontend/src/app/login/page.tsx`

**Wichtige Unterscheidung bei der Ideenplattform:**

| Seite | URL | Zweck |
|-------|-----|-------|
| Passwort-vergessen | `/passwort-vergessen` | User gibt E-Mail ein → erhält Reset-Link per Mail (POST /api/auth/forgot-password) |
| Passwort-zurücksetzen | `/passwort-zuruecksetzen?token=...` | User setzt neues Passwort nach Klick auf E-Mail-Link |

### 16.4 Dashboard: Vianova Fahrzeugverwaltung Beispiel

Neuer Abschnitt im Dashboard (`/opt/mopilot/frontend/app/dashboard/page.tsx`) direkt nach der Begrüßung:

**Design & Layout:**
- Card mit Glasmorphismus-Effekt (`bg-white/80 backdrop-blur-sm`)
- Responsive Grid-Layout mit Bild und Text

**Inhalte:**
- **Titel:** "Beispiel: Vianova Fahrzeugverwaltung"
- **Beschreibungstext:** Informationen zum CC Fuhrpark Dashboard
- **Screenshot:** Bild aus `/images/260405_BeispielCCfuhrpark_dashboard.jpg`
- **Externer Link:** https://ccfuhrpark.vianova.website/
- **Gradient-Button:** "Dashboard öffnen" mit externem Link-Icon
- **Klassen:** Verwendet das shared Design System (`shadow-warm-lg`, `primary-*`, `font-display`)

**Neue Datei:**
- `/opt/mopilot/frontend/public/images/260405_BeispielCCfuhrpark_dashboard.jpg`

### 16.5 Geänderte Dateien – Übersicht

| Datei | Änderung |
|-------|----------|
| `/opt/mopilot/ideen/backend/app/user_sync.py` | Erweitertes Logging, `test_mopilot_db_connection()`, differenzierte Fehlerbehandlung |
| `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/login/page.tsx` | Passwort-vergessen + Registrierung Links, Design-Update |
| `/opt/mopilot/cc-kunden/frontend/src/app/login/page.tsx` | Passwort-vergessen + Registrierung Links, Design-Update |
| `/opt/mopilot/frontend/app/dashboard/page.tsx` | Vianova Fahrzeugverwaltung Beispiel-Abschnitt |
| `/opt/mopilot/frontend/public/images/260405_BeispielCCfuhrpark_dashboard.jpg` | NEU – Screenshot |
| `/opt/zeo-kunden/docker-compose.yml` | Healthcheck Quoting-Bug behoben |
| `/opt/mopilot/frontend/package.json` | `leaflet` + `react-leaflet` Dependencies ergänzt |

---

## Kapitel 17: Hotfix v0.8.1 – Login-Route Fix & Passwort-Link Korrektur

### 17.1 Übersicht der Probleme und Fixes

| # | Problem | Ursache | Fix |
|---|---------|--------|-----|
| 1 | "Passwort vergessen?" zeigt "Ungültiger Link" | Link zeigte auf `/passwort-zuruecksetzen` (Token-Reset-Seite) statt `/passwort-vergessen` (E-Mail-Anforderungsseite) | URL in ZEO- und CC-Kunden Login korrigiert |
| 2 | Login mit registriertem User (tom15@pydna.de) scheitert auf ZEO | ZEO-Kunden hatte NUR Demo-Login (hardcoded mopilot/mopilot2027), KEINE DB-Authentifizierung | Login-Route auf DB-Auth umgebaut (Proxy an Hauptsystem-Backend) |
| 3 | Coolify Sentinel "Out Of Sync" | UFW DROP-Policy blockierte Docker→Host Traffic | 2x "Sync" in Coolify UI geklickt |

### 17.2 ZEO-Kunden Login-Route: Umbau auf DB-Authentifizierung

**Kritische Erkenntnis:** Die Login-Route unter `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/api/auth/login/route.ts` überprüfte NUR die hardcodierten Demo-Credentials (Benutzername: mopilot, Passwort: mopilot2027). Es gab KEINE echte DB-Authentifizierung durch Proxy zum Hauptsystem-Backend.

**Umsetzter Fix in route.ts:**

```typescript
// Die Route wurde komplett umgebaut für echte DB-Authentifizierung
// 1. Email als Login-Identifier akzeptieren (statt Username)
// 2. Authentication-Requests an Hauptsystem-Backend proxyen
//    via AUTH_API_URL (http://backend-ns8wok04s4sgkcggwg48okcg:8000)
// 3. Bei Erfolg: JWT Token + User-Daten in Response setzen + demo_auth Cookie
// 4. Bei Fehler: "Ungültige Anmeldedaten" zurückgeben
// 5. Pattern entspricht nun dokumentiertem CC-Kunden-Verhalten aus v0.72
```

**Verhalten nach dem Fix:**
- Login akzeptiert E-Mail-Adresse als Benutzerkennzeichen
- Authentifizierung erfolgt gegen die zentrale Hauptsystem-Datenbank
- JWT-Token wird gesetzt und in Response zurückgegeben
- Benutzer wird korrekt authentifiziert, unabhängig vom Demo-Account

**Eingabefeld-Update:**
- Eingabe-Label und Placeholder wurden von "Benutzername" auf "E-Mail" aktualisiert
- Entspricht dem realistischen Authentifizierungsfluss

### 17.3 Passwort-vergessen URL-Korrektur

**Änderung in beiden Login-Seiten:**
- **ALT:** `https://idien.mopilot.website/passwort-zuruecksetzen` ❌ (Token-Reset-Bestätigung)
- **NEU:** `https://ideen.mopilot.website/passwort-vergessen` ✓ (E-Mail-Anforderung)

Diese Korrektur wurde in folgenden Dateien vorgenommen:
- `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/login/page.tsx`
- `/opt/mopilot/cc-kunden/frontend/src/app/login/page.tsx`

**Architektur der Ideenplattform Passwort-Funktionalität:**

| Funktionalität | URL | API-Endpoint | Benutzerfluss |
|---|---|---|---|
| Passwort-vergessen (Anforderung) | `/passwort-vergessen` | POST `/api/auth/forgot-password` | User gibt E-Mail ein → erhält Reset-Link per Mail |
| Passwort-zurücksetzen (Bestätigung) | `/passwort-zuruecksetzen?token=...` | POST `/api/auth/reset-password` | User validiert Token und setzt neues Passwort |

### 17.4 Geänderte Dateien – Hotfix v0.8.1

| Datei | Änderung | Detailstufe |
|-------|----------|------------|
| `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/api/auth/login/route.ts` | Komplett umgebaut: Demo-only Hardcoding → DB-Auth Proxy zum Hauptsystem | Kritisch |
| `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/login/page.tsx` | Passwort-vergessen URL korrigiert (`/passwort-zuruecksetzen` → `/passwort-vergessen`), Eingabefeld auf E-Mail umgestellt | Hoch |
| `/opt/mopilot/cc-kunden/frontend/src/app/login/page.tsx` | Passwort-vergessen URL korrigiert | Mittel |

### 17.5 Zusätzliche Systemverbessering

**Coolify Sentinel Synchronisationsproblem:**
- Symptom: "Out Of Sync" Status im Coolify Dashboard
- Ursache: UFW (Uncomplicated Firewall) DROP-Policy blockierte Docker-Container→Host-Traffic
- Lösung: Zweimaliges Klicken des "Sync" Buttons in der Coolify UI
- Status: Bestätigt behoben, alle Sentinel-Verbindungen aktiv

---

---

## Kapitel 18: Rollenspezifische Dashboards & Landing Page – NEU in v0.9

### 18.1 Übersicht der Änderungen

| # | Änderung | Typ | Schwere |
|---|----------|-----|---------|
| 1 | Demo-Login entfernt – nur noch DB-Authentifizierung per E-Mail/Passwort | Breaking Change | Kritisch |
| 2 | Landing Page (`/`) als öffentliche Startseite mit Rollenkarten | Feature | Hoch |
| 3 | Gemeinsames Dashboard-Layout mit Header, KI-Chat und Sidebar | Feature | Hoch |
| 4 | 10 rollenspezifische Dashboard-Seiten mit individuellen Schnellaktionen | Feature | Hoch |
| 5 | `/dashboard` leitet automatisch zur rollenspezifischen URL weiter | Feature | Mittel |
| 6 | Login leitet nach Erfolg zur Landing Page (`/`) statt direkt zum Dashboard | Feature | Mittel |
| 7 | Willkommenstext zeigt Seitenname der aktuellen Rolle | Feature | Niedrig |
| 8 | Middleware: Landing Page als öffentlicher Pfad konfiguriert | Feature | Mittel |

### 18.2 Landing Page: Öffentliche Startseite mit Rollenkarten

Die bisherige Startseite (`/`) wurde zur öffentlichen Landing Page umgebaut. Sie zeigt:

- **MoPilot-Branding** mit Beschreibung des Projekts
- **10 Rollenkarten** in 3 Zonen (Kundennah/Betrieb/Strategie) mit farbcodierten Stilen
- **Klickbare Karten:** Jede Rolle verlinkt auf `/dashboard/{slug}` (z.B. `/dashboard/endkunde`)
- **Eingeloggter User:** Anzeige von Name und Rolle im Header mit Logout-Button
- **Zonenstile:** Kundennah=Emerald, Betrieb=Blue, Strategie=Amber

**Datei:** `frontend/app/page.tsx`

### 18.3 Login: Nur DB-Auth, kein Demo-Login

- **Entfernt:** Demo-Credentials (mopilot/mopilot2027) aus der Login-Route
- **Nur noch:** E-Mail + Passwort gegen Hauptsystem-Backend (via `AUTH_API_URL`)
- **Redirect:** Nach erfolgreichem Login → `/` (Landing Page) statt `/dashboard`
- **Demo-Zugang** bleibt über Seed-Accounts möglich (z.B. endkunde@mopilot.website / mopilot2026)

**Datei:** `frontend/app/login/page.tsx`, `frontend/app/api/auth/login/route.ts`

### 18.4 Dashboard-Layout mit KI-Chat und Sidebar

Neues gemeinsames Layout (`layout.tsx`) für alle Dashboard-Seiten:

- **Header:** MoPilot-Logo, Rollenname mit Icon, Seitenname, Logout-Button
- **Hauptbereich:** KI-Chat mit Streaming (SSE), Markdown-Rendering, Auto-Scroll
- **Sidebar (rechts):** Rollenspezifische Inhalte aus der jeweiligen Unterseite
- **DashboardContext:** React Context für `setInput()` – Schnellaktionen füllen das Chat-Eingabefeld
- **Responsive:** Sidebar als ausklappbares Panel auf mobilen Geräten

**Datei:** `frontend/app/dashboard/layout.tsx`

### 18.5 10 rollenspezifische Dashboard-Seiten

Jede Rolle erhält eine eigene Seite unter `/dashboard/{slug}`:

| Rolle | URL-Slug | Schnellaktionen |
|-------|----------|-----------------|
| Endkunde | `/dashboard/endkunde` | Buchung, Kosten, Standorte, E-Auto laden + Links zu ZEO/CC Kundenportalen |
| Stationspate | `/dashboard/stationspate` | Stationsmeldungen, Ladezustand, Kontakt |
| Hotline | `/dashboard/hotline` | Gesprächsleitfaden, häufige Probleme, Eskalation |
| Betreiber | `/dashboard/betreiber` | Nutzungszahlen, Tarifvergleich, Standortplanung |
| Flottenmanagement | `/dashboard/flottenmanagement` | Fahrzeugstatus, Wartungsplan, Zuweisung + Vianova-Dashboard-Link |
| Fahrzeugbetreuer | `/dashboard/fahrzeugbetreuer` | Zustandsprüfung, Ladeprotokoll, Schadenmeldung |
| Plattform-Support | `/dashboard/plattform-support` | Systemstatus, offene Tickets, Nutzerfeedback |
| Projektträger | `/dashboard/projekttraeger` | KPIs, Fördernachweis, Strategiepapier |
| Fahrzeugsteller | `/dashboard/fahrzeugsteller` | Fahrzeugstatus, Vertragslaufzeiten, Integration |
| Validierungsstelle | `/dashboard/validierungsstelle` | Offene Prüfungen, Führerscheinprüfung, Dokumentenstatus |

**Architektur:** Jede Seite importiert `useDashboard()` aus dem Layout-Context und nutzt `setInput()` für Schnellaktionen.

### 18.6 Middleware: Landing Page öffentlich

Die Middleware wurde erweitert, um die Landing Page (`/`) und Dashboard-Unterrouten korrekt zu handhaben:

- **Öffentliche Pfade:** `/`, `/login`, `/api/auth`, `/impressum`, `/datenschutz`, `/doku`
- **Geschützte Pfade:** `/dashboard/*` – erfordern `demo_auth` Cookie
- **Dashboard-Redirect:** `/dashboard` → `/dashboard/{user-role-slug}` (clientseitig via Layout)

**Datei:** `frontend/middleware.ts`

### 18.7 Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `frontend/app/page.tsx` | Komplett umgebaut: Landing Page mit Rollenkarten |
| `frontend/app/login/page.tsx` | Nur E-Mail-Login, Redirect zu `/` |
| `frontend/app/api/auth/login/route.ts` | Demo-Credentials entfernt, nur DB-Auth |
| `frontend/app/dashboard/layout.tsx` | NEU – Gemeinsames Layout mit Header, Chat, Sidebar |
| `frontend/app/dashboard/page.tsx` | Redirect zur rollenspezifischen URL |
| `frontend/app/dashboard/endkunde/page.tsx` | NEU – Schnellaktionen + Kundenportal-Links |
| `frontend/app/dashboard/stationspate/page.tsx` | NEU – Schnellaktionen Stationspate |
| `frontend/app/dashboard/hotline/page.tsx` | NEU – Schnellaktionen Hotline |
| `frontend/app/dashboard/betreiber/page.tsx` | NEU – Schnellaktionen Betreiber |
| `frontend/app/dashboard/flottenmanagement/page.tsx` | NEU – Schnellaktionen + Vianova-Link |
| `frontend/app/dashboard/fahrzeugbetreuer/page.tsx` | NEU – Schnellaktionen Fahrzeugbetreuer |
| `frontend/app/dashboard/plattform-support/page.tsx` | NEU – Schnellaktionen Support |
| `frontend/app/dashboard/projekttraeger/page.tsx` | NEU – Schnellaktionen Projektträger |
| `frontend/app/dashboard/fahrzeugsteller/page.tsx` | NEU – Schnellaktionen Fahrzeugsteller |
| `frontend/app/dashboard/validierungsstelle/page.tsx` | NEU – Schnellaktionen Validierungsstelle |
| `frontend/middleware.ts` | Landing Page als öffentlicher Pfad, Dashboard geschützt |

---

## Kapitel 19: Infrastruktur-Vereinheitlichung – NEU in v1.0

### 19.1 Motivation

In v0.9 bestand die Infrastruktur aus drei verschiedenen Deployment-Methoden (Coolify, CI/CD mit rsync, manuell), 5+ verstreuten `.env`-Dateien und einem manuellen Design-System-Sync (`sync-shared-ui.sh`). Diese Fragmentierung verursachte:

- **ENV-Chaos:** Doppelte API-Keys, Fallback auf Platzhalter-Werte, Coolify überschrieb ENV-Variablen
- **Sync-Risiko:** Vergessenes `sync-shared-ui.sh` führte zu veralteten Design-System-Kopien
- **Deployment-Inkonsistenz:** `rsync --delete` löschte Dateien, CC-Kunden hatte kein CI/CD

### 19.2 Lösung: Einheitliches Docker Compose Monorepo

| Aspekt | v0.9 (vorher) | v1.0 (nachher) |
|--------|---------------|----------------|
| Docker Compose | 4 separate Dateien | 1 zentrale `docker-compose.yml` |
| ENV-Dateien | 5+ verstreut | 1 zentrale `.env` |
| Deployment | Coolify + rsync + manuell | `docker compose up -d` |
| Design-System | `sync-shared-ui.sh` (manuell) | Docker Build-Stage (automatisch) |
| CI/CD | rsync + Coolify API | `git pull && docker compose build` |
| Coolify-Rolle | Service-Management + Traefik | Nur noch Traefik-Proxy |
| Runtime-Verzeichnisse | `/opt/zeo-kunden/`, `/opt/cc-kunden/` | Entfallen (alles in `/opt/mopilot/`) |

### 19.3 Neue Architektur

**10 Services in einem Compose:**
```
docker-compose.yml
├── postgres (externes Volume, shared)
├── redis
├── main-backend + main-frontend (mopilot.website)
├── ideen-backend + ideen-frontend (ideen.mopilot.website)
├── zeo-backend + zeo-frontend (zeo-kunden.mopilot.website)
└── cc-backend + cc-frontend (cc-kunden.mopilot.website)
```

**Shared-UI via Docker Build-Stage:**
Statt manueller Dateikopie nutzt jedes Frontend `context: .` (Repo-Root) im Build. Das Dockerfile kopiert `shared-ui/` direkt:
```dockerfile
COPY shared-ui/ ./shared-ui/
COPY frontend/ .
```

**Zentrale `.env`-Datei:**
Alle Secrets an einem Ort mit klaren Prefixen (MAIN_, IDEEN_, ZEO_, CC_). Keine Fallback-Werte – fehlt ein Wert, startet der Container nicht (fail fast).

### 19.4 CI/CD Pipeline (vereinfacht)

```
GitHub Push → SSH → git pull → docker compose build → docker compose up -d
```

Was entfällt:
- `sync-shared-ui.sh` (Docker Build macht das)
- `rsync -a --delete` (keine Runtime-Verzeichnisse mehr)
- Separater Coolify-Frontend-Rebuild
- Zwei verschiedene Deploy-Pfade

### 19.5 Migration

Die Migration erfolgte als Single Cutover mit ~30 Sekunden Downtime:
1. Alle neuen Images vorgebaut (kein Downtime)
2. Alle alten Container gestoppt (ZEO, CC, Ideen, dann Coolify-Hauptsystem)
3. Neue Container gestartet (`docker compose up -d`)
4. Postgres-Volume beibehalten (kein Datenverlust)

### 19.6 Entfernte Dateien

- `sync-shared-ui.sh` – ersetzt durch Docker Build-Stage
- `deploy-zeo.sh` – veraltet
- `ideen/docker-compose.yml` – ersetzt durch zentrale Compose
- `MoPilot_ZEO_Kunden/docker-compose.yml` – ersetzt durch zentrale Compose
- `MoPilot_CC_Kunden/docker-compose.yml` – ersetzt durch zentrale Compose
- `/opt/zeo-kunden/` – Runtime-Kopie gelöscht
- `/opt/cc-kunden/` – Runtime-Kopie gelöscht

### 19.7 Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `docker-compose.yml` | NEU – zentrale Compose für alle 10 Services |
| `.env` / `.env.example` | NEU – zentrale Secrets-Verwaltung |
| `postgres/init.sql` | NEU – Multi-DB Setup |
| `frontend/Dockerfile` | Root-Context + shared-ui COPY |
| `ideen/frontend/Dockerfile` | Root-Context + shared-ui COPY |
| `MoPilot_ZEO_Kunden/frontend/Dockerfile` | Root-Context + shared-ui COPY |
| `MoPilot_CC_Kunden/frontend/Dockerfile` | Root-Context + shared-ui COPY + BACKEND_INTERNAL_URL |
| `MoPilot_ZEO_Kunden/frontend/tsconfig.json` | `@shared/*` Path-Alias hinzugefügt |
| `MoPilot_ZEO_Kunden/frontend/tailwind.config.js` | Shared Preset integriert |
| `MoPilot_CC_Kunden/frontend/tsconfig.json` | `@shared/*` Path-Alias hinzugefügt |
| `MoPilot_CC_Kunden/frontend/tailwind.config.js` | Shared Preset integriert |
| `.github/workflows/deploy.yml` | Vereinfacht (kein rsync, kein sync) |
| `scripts/health-check-all.sh` | Container-Name `mopilot-postgres` |

---

*Erstellt mit Claude (Anthropic) | v1.0 – 6. April 2026*
