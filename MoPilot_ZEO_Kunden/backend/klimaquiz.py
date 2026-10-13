"""Klimaquiz statistics ("So haben andere getippt").

Stores ONLY sums over all finished games in a JSON file on a persistent volume:
no IP address, no cookies, no single answers.

    GET  /api/klimaquiz/statistik -> current sums
    POST /api/klimaquiz/statistik -> count one finished game {"d":[0|1 x5], "s":[kg, kg], "r":[0|1 x5]}

File layout: n = games; duell[i] = [correct, total]; schaetz[i] = {log: sum ln(guess), n};
reihe[i] = correct answers on rank i. Interface identical to quiz-statistik.php from the package.
"""
import fcntl
import json
import math
import os
from typing import List

from fastapi import APIRouter, Response
from pydantic import BaseModel, Field, StrictInt, field_validator

router = APIRouter()

DATEI = os.getenv("KLIMAQUIZ_DATEI", "/data/klimaquiz.json")
DUELLE, SCHAETZ, PLAETZE = 5, 2, 5
NO_STORE = {"Cache-Control": "no-store", "X-Robots-Tag": "noindex"}


def leer() -> dict:
    return {
        "n": 0,
        "duell": [[0, 0] for _ in range(DUELLE)],
        "schaetz": [{"log": 0.0, "n": 0} for _ in range(SCHAETZ)],
        "reihe": [0] * PLAETZE,
    }


def _parse(roh: str) -> dict:
    try:
        d = json.loads(roh) if roh else None
    except json.JSONDecodeError:
        d = None
    if isinstance(d, dict) and all(k in d for k in ("n", "duell", "schaetz", "reihe")):
        return d
    return leer()


class Spiel(BaseModel):
    d: List[StrictInt] = Field(min_length=DUELLE, max_length=DUELLE)
    s: List[float] = Field(min_length=SCHAETZ, max_length=SCHAETZ)
    r: List[StrictInt] = Field(min_length=PLAETZE, max_length=PLAETZE)

    @field_validator("d", "r")
    @classmethod
    def nur_null_oder_eins(cls, v: List[int]) -> List[int]:
        if any(x not in (0, 1) for x in v):
            raise ValueError("nur 0 oder 1")
        return v

    @field_validator("s")
    @classmethod
    def kg_bereich(cls, v: List[float]) -> List[float]:
        if any(not (5 <= x <= 4000) for x in v):
            raise ValueError("kg zwischen 5 und 4000")
        return v


@router.get("/api/klimaquiz/statistik")
def lesen(response: Response):
    response.headers.update(NO_STORE)
    try:
        with open(DATEI, encoding="utf-8") as f:
            fcntl.flock(f, fcntl.LOCK_SH)
            return _parse(f.read())
    except FileNotFoundError:
        return leer()


@router.post("/api/klimaquiz/statistik")
def zaehlen(spiel: Spiel, response: Response):
    response.headers.update(NO_STORE)
    os.makedirs(os.path.dirname(DATEI), exist_ok=True)
    fd = os.open(DATEI, os.O_RDWR | os.O_CREAT, 0o640)
    with os.fdopen(fd, "r+", encoding="utf-8") as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        d = _parse(f.read())
        d["n"] += 1
        for i in range(DUELLE):
            d["duell"][i][0] += spiel.d[i]
            d["duell"][i][1] += 1
        for i in range(SCHAETZ):
            d["schaetz"][i]["log"] += math.log(spiel.s[i])
            d["schaetz"][i]["n"] += 1
        for i in range(PLAETZE):
            d["reihe"][i] += spiel.r[i]
        f.seek(0)
        f.truncate()
        json.dump(d, f)
        f.flush()
        os.fsync(f.fileno())
    return {"ok": True}
