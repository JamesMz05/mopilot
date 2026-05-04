# CC Mobilitats-Check (Quiz) — Anwenderhandbuch

**Quiz-Feature der Car&RideSharing Community eG**
Dokument-Version 1.0 | Software-Version 1.2 | Stand: 3. Mai 2026

> **Änderungshistorie:**
> - v1.0 (03.05.2026): Erstversion

---

## Teil A: Management-Zusammenfassung

### Was ist der Mobilitats-Check?

Der Mobilitats-Check ist ein interaktives Online-Quiz mit 14 Fragen rund um das Carsharing-Angebot der Car&RideSharing Community eG. Besucher beantworten Fragen zu Tarifen, Registrierung, Umwelt und Nutzung und erhalten bei erfolgreichem Abschluss einen **Gutscheincode (ECOBONUS26)** fur 20 Stunden Startguthaben.

**Adresse:** https://cc-kunden.mopilot.website/quiz

### Warum gibt es den Mobilitats-Check?

Das Quiz schliesst eine **Tracking-Lucke**: Bisher war nicht nachvollziehbar, wie viele Interessenten den Quiz auf sharing-community.de abschlossen und einen Gutscheincode erhielten. Jetzt wird jeder erfolgreiche Abschluss automatisch per E-Mail an register@sharing-community.de gemeldet — unabhangig davon, ob der Code anschliessend eingelost wird.

### Wie funktioniert der Conversion-Trichter?

```
Besucher kommt auf Quiz-Seite (z.B. uber sharing-community.de)
    |
    v
14 Fragen beantworten (Sofort-Feedback pro Frage)
    |
    v
Quiz abgeschlossen → Gutscheincode ECOBONUS26 angezeigt
    |                  + E-Mail-Notification an Register-Team
    v
Link zur Registrierung (cc.evemo.app/registration)
    |
    v
Registrierung + Einweisung durch Standortpaten
```

### Wie sehe ich die Auswertungen?

Das **Admin-Dashboard** unter https://mopilot.website/admin/quiz-stats zeigt alle Kennzahlen in Echtzeit:

- Wie viele Besucher haben das Quiz gestartet?
- Wie viele haben es abgeschlossen?
- Welche Fragen sind besonders schwer?
- Woher kommen die Besucher (Referrer)?
- Welche Gerate werden genutzt (Handy/Desktop)?

### Wer kann das Dashboard sehen?

Das Dashboard ist **rollengeschutzt**. Nur folgende Rollen haben Zugriff:

| Rolle | Zugriff |
|-------|---------|
| Plattform-Support | Ja |
| Projektrager | Ja |
| Fahrzeugsteller | Ja |
| Validierungsstelle | Ja |
| Admin | Ja |
| Betreiber | Nein (aber Link im Dashboard) |
| Endkunde, Stationspate, Hotline u.a. | Nein |

Der Link zum Dashboard findet sich auch im **Betreiber-Dashboard** unter "CC Carsharing Quiz mit Gutschein".

---

## Teil B: Anwenderhandbuch

### 1. Anmeldung am Dashboard

1. Offne https://mopilot.website und melde dich mit deinen Zugangsdaten an
2. Navigiere uber die Sidebar zu **Admin > Quiz Stats** oder nutze den direkten Link: https://mopilot.website/admin/quiz-stats
3. Alternativ: Im Betreiber-Dashboard findest du den Link "CC Carsharing Quiz mit Gutschein"

### 2. KPI-Kacheln verstehen

Die oberen Kacheln zeigen die wichtigsten Kennzahlen auf einen Blick:

| Kachel | Bedeutung |
|--------|-----------|
| **Sessions gesamt** | Anzahl aller gestarteten Quiz-Durchlaufe |
| **Abgeschlossen** | Anzahl der Quiz, die bis zum Ende durchgespielt wurden |
| **Abschlussrate** | Anteil abgeschlossener Quiz an allen gestarteten (z.B. 0.72 = 72%) |
| **Durchschnittsscore** | Mittlere Anzahl richtig beantworteter Fragen (von 14) |
| **Gutscheine ausgegeben** | Gleich der Anzahl abgeschlossener Quiz (jeder Abschluss = 1 Code) |
| **Nach Gerat** | Aufschlusselung: Mobile, Desktop, Tablet |
| **Nach Referrer** | Woher kamen die Besucher (z.B. sharing-community.de, direkt) |

### 3. Trichter-Diagramm interpretieren

Das Trichter-Diagramm zeigt **pro Frage**, wie viele Teilnehmer sie erreicht und richtig/falsch beantwortet haben.

**Typische Erkenntnisse:**
- Starker Abfall bei einer Frage → diese Frage konnte Besucher abschrecken
- Gleichmassiger Verlauf → gute Fragenbalance
- Hohe Fehlerquote bei bestimmten Fragen → Inhalte sind moglicherweise missverstandlich

### 4. Heatmap nutzen

Die Antwort-Heatmap zeigt fur **jede Frage**, wie sich die gewahlten Antworten verteilen.

**So liest du die Heatmap:**
- Die korrekte Antwort ist markiert
- Je haufiger eine falsche Antwort gewahlt wurde, desto intensiver die Farbung
- Besonders beliebte Falschantworten deuten auf verbreitete Missverstandnisse hin

**Beispiel-Interpretation:**
> Bei Frage 7 ("Wie viele Privat-PKW ersetzt ein Sharing-Auto?") wahlen 40% der Teilnehmer "uber 100" statt "Bis zu 15" → Die Zahl uberrascht viele Besucher, was ein guter Gesprachsanlass fur Stationspaten ist.

### 5. CSV-Export fur Excel

1. Klicke auf den Button **"CSV-Export"** im Dashboard
2. Die heruntergeladene Datei kann direkt in Excel geoffnet werden
3. Trennzeichen: Semikolon (`;`)

**Spalten im Export:**

| Spalte | Beschreibung |
|--------|-------------|
| Session-ID | Anonyme Kennung (kein Personenbezug) |
| Datum | Start-Zeitpunkt |
| Score | Richtige Antworten |
| Total | Gesamtfragen (14) |
| Gerat | mobile / desktop / tablet |
| Referrer | Herkunftsseite |
| Abgeschlossen | Ja / Nein / Abgebrochen |
| Dauer (s) | Bearbeitungszeit in Sekunden |

### 6. Filter nutzen

Du kannst die Auswertungen filtern nach:

- **Zeitraum:** Von-Datum und Bis-Datum wahlen
- **Gerat:** Nur Mobile, nur Desktop oder alle
- **Referrer:** Nur Besucher von bestimmten Seiten

Die Filter wirken auf alle vier Bereiche gleichzeitig (KPIs, Trichter, Heatmap, CSV).

### 7. Haufige Fragen (FAQ)

**Kann ich sehen, wer das Quiz gemacht hat?**
Nein. Das Quiz ist vollstandig anonym. Es werden keine Namen, E-Mail-Adressen oder IP-Adressen gespeichert.

**Kann jemand das Quiz mehrfach machen?**
Innerhalb von 30 Tagen nicht. Ein Cookie im Browser merkt sich, dass das Quiz bereits abgeschlossen wurde, und zeigt direkt den Gutscheincode an. Nach 30 Tagen kann das Quiz erneut gespielt werden.

**Wird der Gutscheincode personalisiert?**
Nein. Alle Teilnehmer erhalten denselben Code (ECOBONUS26). Individuelle Codes sind fur eine spatere Phase geplant.

**Wer bekommt die E-Mail-Benachrichtigung?**
Die E-Mail geht an register@sharing-community.de. Der Empfanger ist in der Datenbank konfigurierbar, ohne Code-Anderung.

**Kann ich die Fragen andern?**
Aktuell nur uber einen Datenbank-Eintrag. Eine Administrationsoberflache fur Quiz-Inhalte ist als Folge-Phase geplant. Wende dich an den Plattform-Support.

**Wie wird das Quiz auf sharing-community.de eingebunden?**
Per iframe mit der URL https://cc-kunden.mopilot.website/embed/quiz. Die Einbettung ist technisch bereits vorbereitet.

### 8. Datenschutz: Was wird getrackt, was nicht?

| Getrackt (anonymisiert) | NICHT getrackt |
|------------------------|----------------|
| Session-UUID (zufallig, kein Personenbezug) | Name, E-Mail, Adresse |
| Gerateklasse (mobile/desktop/tablet) | IP-Adresse |
| Referrer (woher kam der Besucher) | Vollstandiger User-Agent |
| Score und Antwortverteilung | Standortdaten |
| Zeitstempel (Start, Ende, Dauer) | Personenbezogene Daten |

Der Quiz-Cookie (`mopilot_quiz_session`) ist ein **Funktionscookie** — er dient ausschliesslich dazu, die Quiz-Sitzung aufrechtzuerhalten und einen Missbrauch durch mehrfache Code-Ausgabe zu verhindern. Es handelt sich nicht um einen Tracking-Cookie im Sinne der ePrivacy-Richtlinie.

---

*Erstellt im Rahmen des MoPilot-Projekts | v1.2 — 3. Mai 2026*
