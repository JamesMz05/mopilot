# MoPilot v0.9 – Design Spec

> Datum: 2026-04-06
> Plattform: mopilot.website (Hauptsystem)
> Basis: v0.8.1

## Ziel

Rollenbasierte Dashboard-Seiten mit eigenen URLs, Entfernung des Demo-Logins, und Header der ausschließlich echte DB-authentifizierte Benutzer anzeigt.

---

## 1. Kopfzeile – Nur echte Benutzer

### Aktuell
- Header zeigt Benutzernamen + Rollen-Badge aus `localStorage.user`
- Demo-Login mit `mopilot/mopilot2027` möglich
- Demo-Fallback in `/api/auth/login/route.ts`

### Neu (v0.9)
- Header zeigt ausschließlich DB-authentifizierte Benutzer (Name, Rolle, Initialen)
- Demo-Credentials werden komplett entfernt
- `localStorage.user` enthält nur echte User-Daten aus der mopilot-DB
- Benutzer werden zentral auf `ideen.mopilot.website/admin` verwaltet

### Entfernt
- Demo-Credentials `mopilot/mopilot2027` aus `api/auth/login/route.ts`
- Demo-Fallback-Logik im Login-Handler

---

## 2. Routing & Seitenstruktur

### Neue Verzeichnisstruktur

```
app/dashboard/
├── page.tsx                    → Redirect: liest Rolle, leitet zu /dashboard/[rolle]
├── layout.tsx                  → Shared DashboardLayout (Header + Chat + Sidebar)
├── endkunde/page.tsx
├── stationspate/page.tsx
├── hotline/page.tsx
├── betreiber/page.tsx
├── flottenmanagement/page.tsx
├── fahrzeugbetreuer/page.tsx
├── plattform-support/page.tsx
├── projekttraeger/page.tsx
├── fahrzeugsteller/page.tsx
└── validierungsstelle/page.tsx
```

### Ablauf

1. User loggt sich via `/login` ein (DB-Auth)
2. Erfolgreicher Login → Redirect zu `/dashboard`
3. `/dashboard/page.tsx` liest Rolle aus `localStorage.user` → `router.push(/dashboard/${rolle})`
4. Jede Rollen-Seite nutzt `layout.tsx` (Header, Chat, Sidebar-Grundgerüst)
5. Falls Rolle nicht mit URL übereinstimmt → Redirect auf korrekte Rollen-Seite

### Shared DashboardLayout (layout.tsx)

Gemeinsame Komponente für alle Rollen-Seiten:
- Header mit echtem Benutzernamen + Rollen-Badge + Initialen
- KI-Chat-Bereich (Nachrichten-Anzeige + Input-Feld)
- Sidebar mit Tab-Navigation (Chat / Info)
- Slot für rollenspezifische Schnellaktionen (children)

---

## 3. Rollenspezifische Seiteninhalte

Jede Seite enthält: Sidebar mit Schnellaktionen + KI-Chat.

### Endkunde (`/dashboard/endkunde`)
- Schnellaktionen: Wie buche ich ein Fahrzeug?, Was kostet eine Fahrt?, Wo ist die nächste Station?
- Links zu ZEO-Kundenportal (https://zeo-kunden.mopilot.website)
- Links zu CC-Kundenportal (https://cc-kunden.mopilot.website)
- Kein Flottenmanagement

### Stationspate (`/dashboard/stationspate`)
- Schnellaktionen: Was sind meine Aufgaben?, Wie melde ich einen Schaden?, Wer ist mein Ansprechpartner?
- Kein Flottenmanagement

### Hotline (`/dashboard/hotline`)
- Schnellaktionen: Kunde kann Fahrzeug nicht öffnen, Preisauskunft für Neukunden, Fahrzeug hat Schaden – was tun?
- Kein Flottenmanagement

### Betreiber (`/dashboard/betreiber`)
- Schnellaktionen: Aktuelle Nutzungszahlen, Tarifvergleich Eco vs. Eco-plus, Neue Standorte planen
- Kein Flottenmanagement

### Flottenmanagement (`/dashboard/flottenmanagement`)
- Schnellaktionen: Fahrzeugstatus aller Stationen, Wartung fällig?, Fahrzeug umsetzen
- Einzige Rolle MIT Flottenmanagement-Bereich in der Sidebar
- Link zu Stationen & Fahrzeuge live (`/stationen`)

### Fahrzeugbetreuer (`/dashboard/fahrzeugbetreuer`)
- Schnellaktionen: Checkliste Fahrzeugprüfung, Ladezustand melden, Schadensbericht erstellen
- Kein Flottenmanagement

### Plattform-Support (`/dashboard/plattform-support`)
- Schnellaktionen: Systemstatus prüfen, Bekannte Störungen, Ticket erstellen
- Kein Flottenmanagement

### Projektträger (`/dashboard/projekttraeger`)
- Schnellaktionen: KPI-Übersicht Q1, CO₂-Einsparung berechnen, Vergleich ZEO vs. CC
- Kein Flottenmanagement

### Fahrzeugsteller (`/dashboard/fahrzeugsteller`)
- Schnellaktionen: Technische Anforderungen, Hardware-Integration, Vertragskonditionen
- Kein Flottenmanagement

### Validierungsstelle (`/dashboard/validierungsstelle`)
- Schnellaktionen: Offene Validierungen, Dokumentenanforderungen, Prozess Führerscheinprüfung
- Kein Flottenmanagement

---

## 4. Landingpage & Login-Flow

### Landingpage (`/`)
- Rollen-Karten bleiben als **Info-Karten** (Icon, Rollenname, Kurzbeschreibung)
- Karten sind **nicht klickbar** (kein Demo-Login)
- Neuer prominenter **"Anmelden"-Button** → `/login`
- Registrierungs-Hinweis: "Noch kein Konto? Registrieren auf ideen.mopilot.website/register"

### Login-Seite (`/login`)
- E-Mail/Username + Passwort (unverändert)
- Nur DB-Auth – kein Demo-Fallback
- Erfolgreicher Login → `/dashboard` → automatischer Redirect zu `/dashboard/[rolle]`

### Entfernt
- Demo-Credentials `mopilot/mopilot2027`
- Klick-Login auf Rollen-Karten der Landingpage
- Demo-Cookie-Logik (falls nicht mehr benötigt)

---

## 5. Technische Details

### Betroffene Dateien

| Datei | Aktion |
|-------|--------|
| `app/dashboard/page.tsx` | Umbauen: nur noch Redirect-Logik |
| `app/dashboard/layout.tsx` | Neu: Shared DashboardLayout |
| `app/dashboard/[rolle]/page.tsx` | Neu: 10 Rollen-Seiten |
| `app/page.tsx` | Anpassen: Info-Karten + Anmelden-Button |
| `app/api/auth/login/route.ts` | Demo-Fallback entfernen |
| `app/login/page.tsx` | Ggf. Demo-Hinweise entfernen |
| `middleware.ts` | Ggf. anpassen für neue Routen |

### Nicht betroffen
- Backend (FastAPI) – keine Änderungen
- Ideenplattform – keine Änderungen
- ZEO/CC-Kundenassistenten – keine Änderungen
- Shared UI Komponenten – werden wiederverwendet
- Datenbank-Schema – keine Änderungen

### Rollenzuordnung URL-Slugs

| Rolle (DB) | URL-Slug |
|-------------|----------|
| endkunde | `/dashboard/endkunde` |
| stationspate | `/dashboard/stationspate` |
| hotline | `/dashboard/hotline` |
| betreiber | `/dashboard/betreiber` |
| flottenmanagement | `/dashboard/flottenmanagement` |
| fahrzeugbetreuer | `/dashboard/fahrzeugbetreuer` |
| plattform_support | `/dashboard/plattform-support` |
| projekttraeger | `/dashboard/projekttraeger` |
| fahrzeugsteller | `/dashboard/fahrzeugsteller` |
| validierungsstelle | `/dashboard/validierungsstelle` |
| mopilot_team | `/dashboard/flottenmanagement` (Vollzugriff) |

> Hinweis: `plattform_support` (DB) wird zu `plattform-support` (URL) gemappt.
> `mopilot_team` wird auf Flottenmanagement-Seite geleitet (hat Vollzugriff).
