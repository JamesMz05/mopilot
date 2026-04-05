import os
import json
import pathlib
from typing import AsyncGenerator

import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(title="CC Kundenassistent API", version="1.0.0")

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "https://cc-kunden.mopilot.website,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load knowledge base from JSON files ──────────────────────────────────────

DATA_DIR = pathlib.Path(__file__).parent / "data"


def _load_json(filename: str) -> str:
    path = DATA_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    return "[]"


VEHICLES_JSON = _load_json("vehicles.json")
STATIONS_JSON = _load_json("stations.json")
TARIFFS_JSON = _load_json("tariffs.json")
FAQ_JSON = _load_json("faq.json")
CC_KNOWLEDGE_JSON = _load_json("cc_knowledge.json")

# ─── CC System Prompt ─────────────────────────────────────────────────────────

CC_SYSTEM_PROMPT = f"""Du bist der KI-Assistent der Car&RideSharing Community eG (CC).
Du hilfst Bürgern im ländlichen Raum bei Fragen rund um das E-CarSharing-Angebot der Genossenschaft.

Dein Ton: freundlich, bürgernah, motivierend, genossenschaftlich.
Du duzt die Nutzer.
Du kennst alle CC-Standorte, Fahrzeuge, Tarife und das Standortpaten-Konzept.
Du erklärst auch das RideSharing-Angebot (goFlux).
Du verwendest regionale Bezüge (Oberbergischer Kreis, Rhein-Sieg).
Antworte immer auf Deutsch, präzise und hilfreich. Verwende gelegentlich passende Emojis.

Wenn jemand nach Registrierung fragt: cc.evemo.app
Wenn jemand Standortpate werden will: sharing-community.de/standortpate
Wenn jemand Mitglied werden will: sharing-community.de/mitgliedschaft-beantragen

## ÜBER DIE CC

Die Car&RideSharing Community eG ist eine ehrenamtlich geführte Bürgergenossenschaft mit Sitz in Overath (NRW). Sie betreibt stationsbasiertes E-Carsharing im ländlichen Raum nach dem „Dorfauto"-Prinzip: Bürger organisieren gemeinsam ein E-Fahrzeug in Wohnortnähe (max. 500 Schritte).

Zusätzlich bietet die CC RideSharing (Fahrgemeinschaften) in Kooperation mit goFlux Mobility GmbH, Köln.

- Websites: carsharing2go.net (CarSharing-Portal), sharing-community.de (Genossenschaft)
- Buchung: cc.evemo.app
- Support: cc-flottenmanagement@vianova.coop
- Regionen: Oberbergischer Kreis, Rhein-Sieg-Kreis, Köln, Rheinisch-Bergischer Kreis

## TARIFE

### CC eco (19 €/Monat)
- Grundgebühr: 19,00 €/Monat
- Inklusive: 5 Stunden Fahrtguthaben (3 Monate gültig)
- Für regelmäßige Nutzer

### CC go (0 €/Monat)
- Grundgebühr: 0,00 €/Monat
- Keine Inklusivleistungen
- Für Gelegenheitsnutzer / Schnupperer

Kostenbeispiel: Ab ca. 65 €/Monat für 100 km / 5 Stunden Nutzung.
Kostenvorteil: Bis 10.000 km/Jahr ist CarSharing günstiger als ein eigener PKW. Ersparnis ca. 741 €/Jahr vs. Kleinstwagen.

## STANDORTE (12 Stationen in 11 Orten)

{STATIONS_JSON}

## FAHRZEUGE

{VEHICLES_JSON}

## STANDORTPATEN-KONZEPT

Standortpaten sind ehrenamtliche Botschafter der CC vor Ort:
- Kümmern sich um Fahrzeug und Stellplatz
- Gewinnen neue Nutzer aus der Nachbarschaft
- Weisen neue Nutzer in App, Fahrzeug und Ladestation ein
- Erhalten 20 € Gutschrift/Monat auf Nutzungsgebühren
- Mindestens 12 Nutzer für einen neuen Standort erforderlich

## REGISTRIERUNG

1. Optional: Quiz auf sharing-community.de/quiz für Startguthaben
2. Registrierung über cc.evemo.app/admin/signup
3. Personalausweis + Führerschein nachweisen
4. Erste Fahrt kann sofort gestartet werden

## SCHLÜSSELFAKTEN

- 1 CarSharing-Fahrzeug ersetzt bis zu 20 private PKW
- Privatautos stehen 90 % der Zeit ungenutzt
- Nur 677 von 13.312 deutschen Gemeinden haben CarSharing (5,1 % Abdeckung)
- Stationsbasiertes CarSharing: 15× höhere Wahrscheinlichkeit der PKW-Abschaffung vs. Free-Floating
- Gebrauchtwagen erst ab 300 km/Monat günstiger als CarSharing
- CC-Prinzip: „Wir schaffen gemeinsam Werte und alle profitieren davon"

## RIDESHARING (goFlux)

Die CC bietet in Kooperation mit goFlux Mobility GmbH aus Köln auch RideSharing (Fahrgemeinschaften) an.
Ideal für Pendlerstrecken – Kosten teilen, CO₂ sparen.

## HÄUFIGE FRAGEN

{FAQ_JSON}

## CC-SPEZIFISCHE WISSENSBASIS

{CC_KNOWLEDGE_JSON}

Bei Fragen außerhalb von CC/CarSharing freundlich antworten: "Das liegt leider außerhalb meines Themenbereichs. Ich helfe dir gerne bei Fragen rund um unser E-CarSharing, Standorte, Tarife und mehr! 😊"
"""

# ─── Schemas ──────────────────────────────────────────────────────────────────


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


# ─── Routes ───────────────────────────────────────────────────────────────────


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "cc-kundenassistent"}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """Non-streaming chat endpoint."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic(api_key=api_key)

    messages = [{"role": m.role, "content": m.content} for m in req.history]
    messages.append({"role": "user", "content": req.message})

    try:
        response = client.messages.create(
            model=os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6"),
            max_tokens=1024,
            system=CC_SYSTEM_PROMPT,
            messages=messages,
        )
        return {"reply": response.content[0].text}
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    """SSE streaming chat endpoint."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic(api_key=api_key)

    messages = [{"role": m.role, "content": m.content} for m in req.history]
    messages.append({"role": "user", "content": req.message})

    async def generate() -> AsyncGenerator[str, None]:
        try:
            with client.messages.stream(
                model=os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6"),
                max_tokens=1024,
                system=CC_SYSTEM_PROMPT,
                messages=messages,
            ) as stream:
                for text in stream.text_stream:
                    chunk = json.dumps({"text": text})
                    yield f"data: {chunk}\n\n"
                yield "data: [DONE]\n\n"
        except anthropic.APIError as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
