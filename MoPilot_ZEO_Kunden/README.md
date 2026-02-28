# ZEO Kundenassistent – powered by MoPilot

KI-gestützter Kundenassistent für ZEO E-Carsharing (Bruchsal). Prototyp im Rahmen des MoPilot-Projekts.

**Live:** https://zeo-kunden.mopilot.website

## Stack

- **Frontend:** Next.js 14, TailwindCSS, Leaflet.js
- **Backend:** FastAPI (Python 3.11), Anthropic Claude API
- **Deployment:** Docker Compose auf Hetzner CX33 (via Coolify)

## Module

| # | Modul | Beschreibung |
|---|-------|-------------|
| – | KI-Chat | Assistent mit ZEO-Kontext (Claude claude-sonnet-4-6) |
| 1 | Kostenrechner | Tarif-Empfehlung basierend auf Nutzungsverhalten |
| 2 | ÖPNV-Karte | Leaflet-Karte mit Stationen + ÖPNV-Anbindung |
| 3 | Reichweiten-Guide | Temperaturabhängige Reichweite aller Modelle |
| 4 | Fahrzeuge | Filterbare Fahrzeugübersicht |
| 5 | Onboarding | Step-by-Step Guide + FAQ-Akkordeon |

## Lokale Entwicklung

```bash
# 1. Umgebungsvariablen
cp .env.example .env
# ANTHROPIC_API_KEY in .env eintragen

# 2. Backend starten
cd backend
pip install -r requirements.txt
ANTHROPIC_API_KEY=sk-... uvicorn main:app --reload --port 8000

# 3. Frontend starten
cd frontend
npm install
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 npm run dev
```

Öffnen: http://localhost:3000

## Deployment (Coolify)

```bash
# Docker Compose deployen
docker compose up -d --build

# Logs prüfen
docker compose logs -f

# Nur Backend neu bauen
docker compose up -d --build backend
```

### Coolify-Einstellungen

- **Service:** Neues Docker Compose Service
- **Repo:** dieses Repository
- **ENV:** `ANTHROPIC_API_KEY` und `NEXT_PUBLIC_BACKEND_URL` in Coolify UI setzen
- **Domain Frontend:** `zeo-kunden.mopilot.website` → Port 3000
- **Domain Backend:** `api.zeo-kunden.mopilot.website` → Port 8000

## Datenpflege

Alle ZEO-Inhaltsdaten sind als JSON-Dateien im Frontend hinterlegt:

| Datei | Inhalt |
|-------|--------|
| `frontend/src/data/vehicles.json` | Alle 9 Fahrzeugmodelle |
| `frontend/src/data/tariffs.json` | eco & eco plus Tarife |
| `frontend/src/data/stations.json` | 12 Musterstationen mit ÖPNV |
| `frontend/src/data/faq.json` | FAQs in 3 Kategorien |

Der System-Prompt des KI-Assistenten ist in `frontend/src/lib/zeo-context.ts` und `backend/main.py` definiert.

## Hinweise

- Preise und Daten basieren auf zeo-carsharing.de (Stand Feb. 2026)
- Stationsliste ist eine Auswahl der 71 realen ZEO-Standorte
- Keine Gewähr auf Aktualität – offizielle Preise auf zeo-carsharing.de
