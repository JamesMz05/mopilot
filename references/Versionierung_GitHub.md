# MoPilot – Versionierung & Deployment mit GitHub

## Lokaler Workflow (Windows)

1. Code ändern in `C:\Users\james\Projekte\MoPilot`
2. `git add <dateien>` → `git commit -m "Beschreibung"`
3. `git push origin master`

## Was dann automatisch passiert (CI/CD)

GitHub Actions Workflow (`.github/workflows/deploy.yml`) wird ausgelöst:

1. Verbindet sich per SSH zum Hetzner-Server (142.132.232.211)
2. `git fetch origin master` → `git merge --ff-only FETCH_HEAD` (sicherer Pull)
3. `bash /opt/mopilot/sync-shared-ui.sh` (Design System an alle Frontends verteilen)
4. ZEO-Kunden: rsync + Docker rebuild
5. Hauptsystem: Coolify API Rebuild (Frontend + Backend)
6. Health-Check: `curl https://mopilot.website`

## Versionsnummer

- Zentral definiert in `frontend/lib/version.ts` → `APP_VERSION = "0.73"`
- Wird angezeigt in: Dashboard, Impressum, Datenschutz
- Bei neuer Version: nur diese Datei ändern

## Wichtige Regeln

- NIEMALS `git reset --hard` im CI/CD (hat v0.73 zerstört, jetzt gefixt)
- ALLE Änderungen committen bevor Deployment — was nicht in Git ist, geht beim nächsten Deploy verloren
- GitHub Push braucht Classic PAT mit `repo` + `workflow` Scopes (kein Passwort)

## Manuelles Deployment (wenn CI/CD nicht reicht)

```bash
ssh root@142.132.232.211
cd /opt/mopilot && git pull origin master
bash /opt/mopilot/sync-shared-ui.sh
cd /data/coolify/services/ns8wok04s4sgkcggwg48okcg
docker compose build frontend && docker compose up -d frontend
```

## Sub-Projekte (manuelles Deployment)

| Projekt | Befehle |
|---------|---------|
| CC-Kunden | `cd /opt/cc-kunden && docker compose down && docker compose up -d --build` |
| Ideenplattform | `cd /opt/mopilot/ideen && docker compose up -d --build` |
