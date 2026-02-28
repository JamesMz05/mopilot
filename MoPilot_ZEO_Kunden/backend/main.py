import os
import json
import asyncio
from typing import AsyncGenerator

import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(title="ZEO Kundenassistent API", version="1.0.0")

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "https://zeo-kunden.mopilot.website,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ZEO System Prompt ────────────────────────────────────────────────────────

ZEO_SYSTEM_PROMPT = """Du bist der ZEO Kundenassistent – ein freundlicher, kompetenter KI-Assistent für ZEO E-Carsharing in der Region Bruchsal (Landkreis Karlsruhe).

Du beantwortest ausschließlich Fragen rund um ZEO Carsharing: Tarife, Fahrzeuge, Stationen, Buchungsprozess, Reichweite, Laden, Versicherung und allgemeines Carsharing-Wissen. Bei Themen außerhalb dieses Bereichs weist du freundlich darauf hin und bietest an, bei ZEO-relevanten Fragen zu helfen.

Antworte immer auf Deutsch, freundlich und präzise. Verwende gelegentlich passende Emojis.

## ÜBER ZEO CARSHARING

ZEO Carsharing ist ein nachhaltiges E-Carsharing-Projekt in der Region Bruchsal (nördlicher Landkreis Karlsruhe, Baden-Württemberg). Betrieben von der Regionalen Wirtschaftsförderung Bruchsal und der Vianova eG.

- 71 Standorte in 18 Gemeinden (von Dettenheim bis Sulzfeld)
- 4.500+ Nutzer*innen (Stand 2024), 184 Tonnen CO₂ eingespart
- App "mein zeo" (kostenlos, iOS & Android)
- Hotline: 0 61 31 83 832 333 | E-Mail: service@zeo-carsharing.de
- Integration in KVV.regiomove-App

## TARIFE

### ZEO eco (ohne Grundgebühr)
- Registrierungsgebühr: €15 (inkl. €15 Startguthaben)
- Grundgebühr: €0/Monat | Kündigung: 1 Monat
- Kleinwagen: €0,29/km, €1,90/h, €0,70/h Nacht (23–6h), €22,90/Tag, €0,90/Buchung
- Kompakt/HDK: €0,31/km, €1,90/h, €0,70/h Nacht, €22,90/Tag, €0,90/Buchung

### ZEO eco plus (für Vielfahrer)
- Registrierungsgebühr: €0 | Grundgebühr: €9,90/Monat | Kündigung: 6 Monate
- 6 Freistunden/Monat (Wert €10,20), bis 6 Monate ansparbar
- Kleinwagen: bis 50km €0,27/km, ab 51km €0,19/km, €1,70/h, €0,60/h Nacht, €19,90/Tag
- Kompakt/HDK: bis 50km €0,29/km, ab 51km €0,21/km, €1,70/h, €0,60/h Nacht, €19,90/Tag

## FAHRZEUGE (alle elektrisch)
1. Renault Zoe R 240 – 5 Sitze, 90–128 km Reichweite (Kurzstrecke)
2. Renault Zoe ZE 40 – 5 Sitze, 176–252 km (Mittelstrecke)
3. Renault Zoe ZE 50 – 5 Sitze, 221–316 km (Langstrecke)
4. DFSK Seres 3 – Kompakt-SUV, 5 Sitze, 169–241 km
5. Fiat E-Doblò – Hochdachkombi, 5 Sitze, Anhängerkupplung, 177–253 km
6. Fiat E-Ulysse – Kleinbus, 7 Sitze, 157–224 km
7. Fiat E-Scudo – Kleinbus, 8–9 Sitze, 177–253 km
8. Opel Vivaro Electric – Kleinbus, 9 Sitze, 185–264 km
9. Ford E-Transit – Transporter, 3 Sitze, 133–190 km

Reichweite sinkt im Winter (0°C: ~75%, -10°C: ~60%). Strom ist inklusive.

## BUCHUNG & ÖFFNEN
- App "mein zeo" (iOS/Android) oder Webportal
- ZEO-Card: €7,90 in Bürgerbüros (kontaktloses Öffnen)
- Stationsbasiertes Carsharing: Rückgabe an Ausleihstation

## ONBOARDING
1. Registrierung auf zeo-carsharing.de
2. Führerschein & Identität verifizieren
3. App "mein zeo" herunterladen
4. Station finden & Fahrzeug buchen
5. Fahrzeug per App öffnen & losfahren
6. Rückgabe an Station & ans Ladekabel anschließen

Bei Fragen außerhalb von ZEO/Carsharing freundlich antworten: "Das liegt leider außerhalb meines Themenbereichs. Ich helfe gerne bei ZEO E-Carsharing – Tarife, Fahrzeuge, Buchung und mehr! 😊"
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
    return {"status": "ok", "service": "zeo-kundenassistent"}


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
            system=ZEO_SYSTEM_PROMPT,
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
                system=ZEO_SYSTEM_PROMPT,
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
