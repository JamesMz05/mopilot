# Claude Code Prompt – Ideenplattform: Inhalte & Seed-Ideen

> **Anleitung:** Übergib diesen Prompt an Claude Code via `@`-Referenz.
> Voraussetzung: Phase 2 (Backend API) ist bereits deployed.

---

## Auftrag

Du bist Entwickler der MoPilot-Ideenplattform (`ideen.mopilot.website`).
Führe folgende zwei Aufgaben aus:

### Aufgabe 1 – Header-Texte in der Rollenübersicht

Jede der 10 Rollenkarten auf der Startseite (`/`) erhält unter dem Rollennamen einen kurzen, inspirierenden Untertitel. Dieser soll die Stakeholder motivieren, Ideen einzubringen. Implementiere diese Texte als `tagline`-Feld in der Datenbank (Tabelle `roles`, neues Feld `tagline VARCHAR(200)`) und zeige sie auf der Rollenkarte im Frontend an.

Hier sind die exakten Texte:

| Rolle              | Tagline                                                              |
|--------------------|----------------------------------------------------------------------|
| Endkunde           | Gestalte die Mobilität, die zu Deinem Leben passt. |
| Stationspate       | Du kennst Dein Umfeld am besten – mache jede Station zum Treffpunkt der Zukunft. |
| Hotline            | Deine Idee wird zur Verbesserung für alle. |
| Betreiber          | Deine Strategie formt die Mobilität von morgen. |
| Flottenmanagement  | Dein Ideen bringen die Flotte in Bewegung. |
| Fahrzeugbetreuer   | Deine Praxisnähe macht den Unterschied. |
| Plattform-Support  | Deine technischen Ideen zählen. |
| Projektträger      | Von der Kennzahl zur Wirkung. |
| Fahrzeugsteller    | Vom Vertrag zur Innovationen. |
| Validierungsstelle | Deine Ideen machen Prüfprozesse schlauer. |

**Implementierung:**

1. Erstelle eine Alembic-Migration, die `tagline` zur Tabelle `roles` hinzufügt.
2. Aktualisiere das Seed-Script, sodass die Taglines beim Seeding gesetzt werden.
3. Erweitere den API-Endpunkt `GET /api/roles`, sodass `tagline` im Response enthalten ist.
4. Im Frontend: Zeige die Tagline kursiv unter dem Rollennamen auf jeder Rollenkarte an.

---

### Aufgabe 2 – Seed-Ideen einfügen

Füge pro Rolle **3 Beispiel-Ideen** in die Datenbank ein. Diese dienen als Inspiration und zeigen den Stakeholdern, welche Art von Ideen gewünscht ist. Erstelle dafür einen System-User `ideengeber@mopilot.website` (user_type: `team`) als Autor.

Jede Idee hat ein **Label** im Titel-Prefix:
- 🚀 = herausfordernd / visionär
- 🤖 = gut umsetzbar mit KI

**Wichtig:** Setze den Status aller Seed-Ideen auf `in_diskussion`, damit sie sofort sichtbar und kommentierbar sind.

---

#### Rolle: Endkunde

**🚀 Idee 1 – Multimodale Reiseplanung von Tür zu Tür**
> Titel: `🚀 Multimodale Reiseplanung von Tür zu Tür`
>
> Beschreibung: Eine integrierte Routenplanung, die E-Carsharing nahtlos mit Bus, Bahn und Fahrrad kombiniert. Der Nutzer gibt Start und Ziel ein und erhält einen Gesamtplan inklusive Buchung, Umstiegszeiten und CO₂-Bilanz – alles in einer App. Dafür wäre eine tiefe Integration mit ÖPNV-Schnittstellen und Echtzeitdaten nötig.

**🤖 Idee 2 – KI-Chat für Buchungsfragen rund um die Uhr**
> Titel: `🤖 KI-Chat für Buchungsfragen rund um die Uhr`
>
> Beschreibung: Ein intelligenter Chatbot auf der MoPilot-Website, der häufige Fragen beantwortet: „Wo ist die nächste Station?", „Wie storniere ich?", „Was kostet eine Stunde?". Der Bot lernt aus echten FAQ-Daten und kann bei komplexen Fällen an die Hotline weiterleiten. Reduziert Wartezeiten und entlastet das Team.

**🤖 Idee 3 – Smarte Standortvorschläge basierend auf Nutzungsverhalten**
> Titel: `🤖 Smarte Standortvorschläge basierend auf Nutzungsverhalten`
>
> Beschreibung: Die App analysiert anonymisiert, welche Stationen zu welchen Zeiten stark nachgefragt werden, und schlägt dem Nutzer proaktiv die beste Station und den besten Zeitpunkt vor. „Um 8:15 Uhr ist an Station Marktplatz mit hoher Wahrscheinlichkeit ein Fahrzeug frei." Basiert auf historischen Buchungsdaten und einfachem ML-Modell.

---

#### Rolle: Stationspate

**🚀 Idee 1 – Digitaler Zwilling jeder Station**
> Titel: `🚀 Digitaler Zwilling jeder Station`
>
> Beschreibung: Ein 3D-Modell jeder Carsharing-Station im Verwaltungsportal, das Echtzeit-Infos zeigt: Belegung, Ladezustand der Fahrzeuge, Zustand der Infrastruktur (Ladesäule, Beschilderung, Sauberkeit). Stationspaten könnten direkt im Modell Mängel markieren. Technisch sehr anspruchsvoll, aber langfristig ein Gamechanger für die Stationsbetreuung.

**🤖 Idee 2 – KI-gestützte Zustandserkennung per Foto**
> Titel: `🤖 KI-gestützte Zustandserkennung per Foto`
>
> Beschreibung: Der Stationspate fotografiert die Station mit dem Smartphone. Eine Bilderkennung (KI) erkennt automatisch Probleme: verschmutzte Ladesäule, beschädigtes Schild, zugeparkter Stellplatz. Der Befund wird automatisch als Meldung mit Kategorie und Dringlichkeit erstellt. Spart Zeit und standardisiert die Dokumentation.

**🤖 Idee 3 – Automatische Wochenberichte per KI-Zusammenfassung**
> Titel: `🤖 Automatische Wochenberichte per KI-Zusammenfassung`
>
> Beschreibung: Statt manueller Berichte fasst eine KI alle Zustandsmeldungen der Woche zu einem kurzen Report zusammen: Was wurde gemeldet? Was ist offen? Was hat sich verbessert? Der Bericht wird automatisch an den Betreiber geschickt. Basiert auf einfacher Textgenerierung aus strukturierten Meldungsdaten.

---

#### Rolle: Hotline

**🚀 Idee 1 – Echtzeit-Stimmungsanalyse während des Gesprächs**
> Titel: `🚀 Echtzeit-Stimmungsanalyse während des Gesprächs`
>
> Beschreibung: Ein KI-System analysiert während des Hotline-Gesprächs die Stimme des Anrufers in Echtzeit und zeigt dem Mitarbeiter an, ob der Kunde frustriert, verwirrt oder zufrieden ist. Bei eskalierender Stimmung erscheinen automatisch De-Eskalations-Tipps. Technisch komplex (Sprach-KI + Echtzeit-Verarbeitung), aber enormes Potenzial für die Gesprächsqualität.

**🤖 Idee 2 – KI-Gesprächsleitfaden mit dynamischen Vorschlägen**
> Titel: `🤖 KI-Gesprächsleitfaden mit dynamischen Vorschlägen`
>
> Beschreibung: Der bestehende Gesprächsleitfaden wird intelligent: Basierend auf dem Anliegen des Kunden (Buchungsproblem, Fahrzeugdefekt, Storno etc.) schlägt die KI dem Hotline-Mitarbeiter die passenden nächsten Schritte, Textbausteine und Lösungen vor. Lernfähig aus abgeschlossenen Fällen. Gut umsetzbar mit einem RAG-System auf den bestehenden Leitfäden.

**🤖 Idee 3 – Automatische Gesprächsprotokollierung und Kategorisierung**
> Titel: `🤖 Automatische Gesprächsprotokollierung und Kategorisierung`
>
> Beschreibung: Nach jedem Hotline-Gespräch erstellt eine KI automatisch ein strukturiertes Protokoll: Anliegen, Lösung, offene Punkte, Kategorie (z. B. „Buchung", „Technik", „Beschwerde"). Das spart dem Mitarbeiter die manuelle Nachbereitung und liefert wertvolle Daten für die Verbesserung des Services.

---

#### Rolle: Betreiber

**🚀 Idee 1 – Prädiktives Nachfragemodell für strategische Standortplanung**
> Titel: `🚀 Prädiktives Nachfragemodell für strategische Standortplanung`
>
> Beschreibung: Ein KI-Modell, das auf Basis von Bevölkerungsdaten, ÖPNV-Abdeckung, Pendlerströmen und bisherigen Buchungen vorhersagt, wo neue Carsharing-Stationen den größten Effekt hätten. Inklusive Simulation: „Was passiert, wenn wir Station X eröffnen?" Erfordert umfangreiche Datenintegration, wäre aber ein strategischer Meilenstein.

**🤖 Idee 2 – KI-Dashboard mit automatischen Handlungsempfehlungen**
> Titel: `🤖 KI-Dashboard mit automatischen Handlungsempfehlungen`
>
> Beschreibung: Das Management-Dashboard zeigt nicht nur Kennzahlen, sondern eine KI generiert täglich konkrete Empfehlungen: „Auslastung Station Ost unter 20 % seit 2 Wochen – Preisanpassung oder Standortverlegung prüfen." Basiert auf Regelwerk + einfachem ML auf bestehenden KPIs. Sofort umsetzbar.

**🤖 Idee 3 – Automatisierte Monatsberichte für Fördermittelgeber**
> Titel: `🤖 Automatisierte Monatsberichte für Fördermittelgeber`
>
> Beschreibung: Eine KI erstellt monatlich einen formatierten Bericht mit den wichtigsten KPIs, Nutzungstrends und Meilensteinen – im Format, das Fördermittelgeber erwarten. Der Betreiber prüft und gibt frei, statt stundenlang selbst zu schreiben. Basiert auf Template-Generierung und automatischer Datenaufbereitung.

---

#### Rolle: Flottenmanagement

**🚀 Idee 1 – Autonome Fahrzeugumverteilung per Relocation-Algorithmus**
> Titel: `🚀 Autonome Fahrzeugumverteilung per Relocation-Algorithmus`
>
> Beschreibung: Ein Algorithmus erkennt Nachfrage-Ungleichgewichte zwischen Stationen und beauftragt automatisch Fahrzeugumverteilungen – inklusive optimierter Routenplanung für Relocation-Fahrer. Langfristig sogar mit autonomen Fahrzeugen denkbar. Komplex, aber würde das Grundproblem ungleicher Fahrzeugverteilung im ländlichen Raum adressieren.

**🤖 Idee 2 – KI-basierte Wartungsvorhersage pro Fahrzeug**
> Titel: `🤖 KI-basierte Wartungsvorhersage pro Fahrzeug`
>
> Beschreibung: Anhand von Kilometern, Ladedaten, Buchungshäufigkeit und Alter des Fahrzeugs prognostiziert eine KI, wann die nächste Wartung fällig wird – bevor ein Problem auftritt. „Fahrzeug E-Golf #7 – Bremsenwartung empfohlen in ca. 2 Wochen." Spart ungeplante Ausfälle und verlängert die Fahrzeuglebensdauer.

**🤖 Idee 3 – Intelligente Ladezeitoptimierung nach Stromtarif**
> Titel: `🤖 Intelligente Ladezeitoptimierung nach Stromtarif`
>
> Beschreibung: Die Fahrzeuge werden bevorzugt dann geladen, wenn der Strompreis niedrig ist (z. B. nachts oder bei Solarüberschuss). Eine KI berücksichtigt dabei die Buchungen des nächsten Tages: Welches Fahrzeug braucht wann welchen Ladestand? Einfache Optimierung mit großem Einsparpotenzial.

---

#### Rolle: Fahrzeugbetreuer

**🚀 Idee 1 – AR-Brille für geführte Fahrzeuginspektion**
> Titel: `🚀 AR-Brille für geführte Fahrzeuginspektion`
>
> Beschreibung: Eine Augmented-Reality-Brille führt den Fahrzeugbetreuer Schritt für Schritt durch die Inspektion: Prüfpunkte werden im Sichtfeld eingeblendet, Fotos automatisch aufgenommen, Checkliste per Sprachbefehl abgehakt. Technisch ambitioniert (AR-Hardware + Softwareentwicklung), aber würde die Inspektionsqualität und -geschwindigkeit erheblich steigern.

**🤖 Idee 2 – KI-Schadenserkennung durch Fahrzeugfotos**
> Titel: `🤖 KI-Schadenserkennung durch Fahrzeugfotos`
>
> Beschreibung: Der Betreuer fotografiert das Fahrzeug nach jeder Rückgabe. Eine Bilderkennung vergleicht automatisch mit dem Zustand bei der Ausgabe und markiert neue Schäden: Kratzer, Dellen, Verschmutzungen. Das spart die manuelle Prüfung und dokumentiert den Schadensverlauf lückenlos.

**🤖 Idee 3 – Intelligente Reinigungs- und Servicetouren-Planung**
> Titel: `🤖 Intelligente Reinigungs- und Servicetouren-Planung`
>
> Beschreibung: Eine KI plant die tägliche Tour des Fahrzeugbetreuers optimal: Welche Fahrzeuge brauchen Reinigung? Welche haben niedrigen Ladestand? Wo steht eine Sichtprüfung an? Die Route wird nach Dringlichkeit und Entfernung optimiert. Spart Fahrzeit und stellt sicher, dass kein Fahrzeug vergessen wird.

---

#### Rolle: Plattform-Support

**🚀 Idee 1 – Selbstheilendes System mit automatischer Fehlerbehebung**
> Titel: `🚀 Selbstheilendes System mit automatischer Fehlerbehebung`
>
> Beschreibung: Eine KI überwacht alle Systemkomponenten und behebt bekannte Fehler automatisch: Neustart hängender Services, Bereinigung voller Logs, Skalierung bei Lastspitzen. Bei unbekannten Fehlern erstellt sie automatisch ein Diagnose-Ticket mit Log-Analyse. Erfordert tiefe Systemintegration, wäre aber ein Quantensprung für die Betriebssicherheit.

**🤖 Idee 2 – KI-gestütztes Log-Monitoring mit Anomalieerkennung**
> Titel: `🤖 KI-gestütztes Log-Monitoring mit Anomalieerkennung`
>
> Beschreibung: Statt manuell Logs zu durchsuchen, erkennt eine KI automatisch ungewöhnliche Muster: plötzlicher Anstieg von 500-Fehlern, ungewöhnliche Login-Versuche, Performance-Einbrüche. Alerts werden mit Kontext geliefert: „Was ist passiert?", „Welche Nutzer sind betroffen?", „Mögliche Ursache." Gut umsetzbar mit bestehenden ML-Tools.

**🤖 Idee 3 – Chatbot für First-Level-IT-Support intern**
> Titel: `🤖 Chatbot für First-Level-IT-Support intern`
>
> Beschreibung: Ein interner KI-Chatbot beantwortet technische Fragen der Teammitglieder: „Wie setze ich ein Passwort zurück?", „Warum ist die Synchronisation fehlgeschlagen?", „Wo finde ich die API-Dokumentation?" Trainiert auf den internen Wissensdokumenten. Entlastet den Support und beschleunigt die Problemlösung.

---

#### Rolle: Projektträger

**🚀 Idee 1 – KI-Wirkungsmodell: Gesellschaftlicher Impact in Echtzeit**
> Titel: `🚀 KI-Wirkungsmodell: Gesellschaftlicher Impact in Echtzeit`
>
> Beschreibung: Ein Modell, das den gesellschaftlichen Nutzen von MoPilot quantifiziert: eingesparte CO₂-Tonnen, erschlossene Mobilitätsräume, vermiedene PKW-Neuanschaffungen, Effekt auf die lokale Wirtschaft. Die KI verknüpft Nutzungsdaten mit sozioökonomischen Daten und erstellt ein „Impact-Dashboard" für Förderanträge und Öffentlichkeitsarbeit.

**🤖 Idee 2 – Automatisches KPI-Tracking mit Zielerreichungs-Alerts**
> Titel: `🤖 Automatisches KPI-Tracking mit Zielerreichungs-Alerts`
>
> Beschreibung: Die definierten Projekt-KPIs werden automatisch getrackt. Eine KI erkennt Trends: „Nutzerzuwachs liegt 15 % unter Plan – Gegenmaßnahmen empfohlen" oder „CO₂-Einsparung übertrifft Jahresziel bereits im Oktober." Alerts gehen per E-Mail an den Projektträger. Basiert auf einfachen Schwellenwerten und Trendanalyse.

**🤖 Idee 3 – KI-generierte Förderantrags-Entwürfe**
> Titel: `🤖 KI-generierte Förderantrags-Entwürfe`
>
> Beschreibung: Auf Basis der aktuellen KPIs, Meilensteine und Wirkungsdaten generiert eine KI Entwürfe für Zwischen- und Abschlussberichte an Fördermittelgeber. Der Projektträger ergänzt und finalisiert. Spart erheblich Zeit bei der oft aufwändigen Förderdokumentation.

---

#### Rolle: Fahrzeugsteller

**🚀 Idee 1 – Dynamisches Vertragsmodell mit nutzungsbasierter Vergütung**
> Titel: `🚀 Dynamisches Vertragsmodell mit nutzungsbasierter Vergütung`
>
> Beschreibung: Statt fixer Leasingraten ein KI-gestütztes Modell, bei dem die Vergütung an die tatsächliche Auslastung des Fahrzeugs gekoppelt ist. Höhere Nutzung = höhere Vergütung für den Fahrzeugsteller, niedrigere Nutzung = geringere Kosten für den Betreiber. Erfordert neue Vertragsstrukturen und Echtzeit-Nutzungsdaten, wäre aber ein Win-Win-Modell.

**🤖 Idee 2 – KI-Matching: Optimale Fahrzeugtypen pro Standort**
> Titel: `🤖 KI-Matching: Optimale Fahrzeugtypen pro Standort`
>
> Beschreibung: Eine KI analysiert Buchungsmuster und empfiehlt, welcher Fahrzeugtyp an welchem Standort am besten passt: Kleinwagen für Kurzstrecken in der Stadt, Kombi für Familien am Ortsrand, Transporter am Gewerbegebiet. Unterstützt den Fahrzeugsteller bei der Flottenplanung und maximiert die Auslastung.

**🤖 Idee 3 – Automatisierte Vertragsverlängerungs-Empfehlungen**
> Titel: `🤖 Automatisierte Vertragsverlängerungs-Empfehlungen`
>
> Beschreibung: Vor Vertragsende analysiert eine KI die Nutzungsdaten des Fahrzeugs und empfiehlt: Verlängern (hohe Auslastung), Ersetzen (häufige Wartung, niedrige Zufriedenheit) oder Standortwechsel (bessere Auslastung anderswo). Der Fahrzeugsteller erhält datenbasierte Entscheidungshilfen statt Bauchgefühl.

---

#### Rolle: Validierungsstelle

**🚀 Idee 1 – Vollautomatische Identitätsprüfung mit Biometrie**
> Titel: `🚀 Vollautomatische Identitätsprüfung mit Biometrie`
>
> Beschreibung: Ein System, das Identität und Führerschein vollautomatisch prüft: Foto-Abgleich mit Ausweisbild (Face Match), Echtheitsprüfung des Dokuments per KI (Hologramme, Sicherheitsmerkmale), Abfrage von Sperrdatenbanken. Der Nutzer macht alles per Smartphone-Kamera – ohne manuellen Prüfaufwand. Regulatorisch und technisch sehr anspruchsvoll, aber Standard-Ziel der Branche.

**🤖 Idee 2 – KI-Vorprüfung hochgeladener Führerscheinfotos**
> Titel: `🤖 KI-Vorprüfung hochgeladener Führerscheinfotos`
>
> Beschreibung: Bevor ein Mitarbeiter den Führerschein manuell prüft, analysiert eine KI das hochgeladene Foto: Ist das Bild scharf genug? Ist es ein Führerschein (kein Personalausweis)? Sind alle Pflichtfelder lesbar? Ist das Ablaufdatum gültig? Offensichtliche Fehler werden sofort zurückgewiesen mit Hinweis zur Korrektur. Reduziert den manuellen Prüfaufwand um bis zu 60 %.

**🤖 Idee 3 – Automatische Erinnerung bei ablaufenden Dokumenten**
> Titel: `🤖 Automatische Erinnerung bei ablaufenden Dokumenten`
>
> Beschreibung: Eine KI überwacht die Gültigkeitsdaten aller hinterlegten Führerscheine und Ausweise. 8 Wochen vor Ablauf erhält der Nutzer eine freundliche Erinnerung per E-Mail und App-Benachrichtigung. Bei Ablauf wird die Buchungsfunktion automatisch gesperrt, bis ein neues Dokument hochgeladen ist. Einfach und wirkungsvoll.

---

## Implementierungsanweisungen

### 1. Datenbank-Migration

```bash
# Neue Migration erstellen
alembic revision --autogenerate -m "add_tagline_to_roles"
```

Das neue Feld:
```python
# In models.py – Role-Modell erweitern
tagline = Column(String(200), nullable=True)
```

### 2. Seed-Script erweitern

Erstelle eine Datei `backend/app/seed_content.py`:

```python
"""
Seed-Script für Taglines und Beispiel-Ideen.
Ausführung: python -m app.seed_content
"""

# 1. System-User anlegen (oder finden):
#    email: ideengeber@mopilot.website
#    name: "MoPilot Ideengeber"
#    user_type: team
#    role: None (Team sieht alle)

# 2. Taglines in die roles-Tabelle schreiben (UPDATE by slug)

# 3. Pro Rolle 3 Ideen einfügen:
#    - author_id = System-User
#    - role_id = jeweilige Rolle
#    - status = "in_diskussion"
#    - Titel und Beschreibung exakt wie oben definiert

# 4. Idempotent: Prüfe vor dem Einfügen, ob Ideen mit gleichem Titel
#    bereits existieren (kein doppeltes Seeding).
```

### 3. Frontend-Anpassung

In der Rollenkarte (Startseite `/`):

```tsx
{/* Rollenname */}
<h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>

{/* NEU: Tagline */}
<p className="text-sm italic text-gray-500 mt-1">{role.tagline}</p>

{/* Kurzbeschreibung */}
<p className="text-sm text-gray-600 mt-2">{role.description}</p>
```

### 4. Ideen-Labels im Frontend

Die Emoji-Prefixes (🚀 und 🤖) sind Bestandteil des Titels. Ergänze optional eine visuelle Hervorhebung:

```tsx
{/* In der Ideenliste: Badge basierend auf Titel-Prefix */}
{idea.title.startsWith("🚀") && (
  <span className="badge bg-orange-100 text-orange-700">Visionär</span>
)}
{idea.title.startsWith("🤖") && (
  <span className="badge bg-green-100 text-green-700">KI-umsetzbar</span>
)}
```

### 5. Prüfkriterien

- [ ] Alle 10 Rollen haben eine Tagline in der Datenbank
- [ ] Taglines werden auf der Startseite unter dem Rollennamen angezeigt
- [ ] System-User `ideengeber@mopilot.website` existiert
- [ ] Genau 30 Seed-Ideen (3 pro Rolle) sind vorhanden
- [ ] Alle Seed-Ideen haben den Status `in_diskussion`
- [ ] Seed-Script ist idempotent (mehrfaches Ausführen erzeugt keine Duplikate)
- [ ] Badges „Visionär" und „KI-umsetzbar" werden korrekt angezeigt
- [ ] Ideen sind bewertbar und kommentierbar

### 6. Ausführungsreihenfolge

```bash
cd /opt/mopilot/ideen

# 1. Migration
docker compose exec ideen-backend alembic upgrade head

# 2. Seeding
docker compose exec ideen-backend python -m app.seed_content

# 3. Verify
curl -s https://ideen.mopilot.website/api/roles | jq '.[0].tagline'
curl -s https://ideen.mopilot.website/api/ideas?role=endkunde | jq '.[].title'

# 4. Frontend rebuild
docker compose up -d --build ideen-frontend
```
