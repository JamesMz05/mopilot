import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import paramiko

HOST = "142.132.232.211"
USER = "root"
PASS = "Alles1xSonnenschein"
LOCAL_BASE = r"C:\Projekte\MoPilot\MoPilot_ZEO_Kunden"
REMOTE_BASE = "/opt/zeo-kunden/MoPilot_ZEO_Kunden"

def run(client, cmd, timeout=600):
    print(f"> {cmd[:120]}")
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors="replace").strip()
    err = stderr.read().decode(errors="replace").strip()
    if out: print(out[-2000:])
    if err: print(f"[err] {err[-500:]}")
    return out

def sftp_mkdir_p(sftp, remote_dir):
    parts = remote_dir.lstrip("/").split("/")
    path = ""
    for part in parts:
        path += "/" + part
        try:
            sftp.mkdir(path)
        except IOError:
            pass

def sftp_upload_dir(sftp, local_dir, remote_dir):
    sftp_mkdir_p(sftp, remote_dir)
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir + "/" + item
        if os.path.isdir(local_path):
            if item in ("node_modules", ".next", "__pycache__", ".git"):
                continue
            sftp_upload_dir(sftp, local_path, remote_path)
        else:
            if item.endswith(".pdf"):
                continue  # skip large PDFs
            sftp.put(local_path, remote_path)
            print(f"  uploaded: {remote_path}")

# Connect
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Verbinde mit Server...")
client.connect(HOST, username=USER, password=PASS, timeout=15)
print("Verbunden!\n")

# 1. Verzeichnis prüfen
run(client, f"ls {REMOTE_BASE} 2>/dev/null || echo 'MISSING'")

# 2. Projektdateien hochladen
print("\nLade Projektdateien hoch...")
sftp = client.open_sftp()
sftp_upload_dir(sftp, LOCAL_BASE, REMOTE_BASE)
sftp.close()
print("Upload abgeschlossen!")

# 3. .env schreiben
print("\nSchreibe .env...")
run(client, f"""cat > {REMOTE_BASE}/.env << 'ENVEOF'
ANTHROPIC_API_KEY=DEIN_API_KEY_HIER
CLAUDE_MODEL=claude-sonnet-4-6
NEXT_PUBLIC_BACKEND_URL=https://api.zeo-kunden.mopilot.website
CORS_ORIGINS=https://zeo-kunden.mopilot.website,http://localhost:3000
ENVIRONMENT=production
ENVEOF""")

# 4. Stoppe alte Container
run(client, f"cd {REMOTE_BASE} && docker compose down 2>&1 || true")

# 5. Build & Start
print("\nBaue Images (dauert 3-5 Min.)...")
run(client, f"cd {REMOTE_BASE} && docker compose up -d --build 2>&1", timeout=600)

# 6. Status
print("\n--- Container Status ---")
run(client, f"cd {REMOTE_BASE} && docker compose ps")

print("\nFertig! Prüfe in 30s:")
print("  https://zeo-kunden.mopilot.website")
print("  https://api.zeo-kunden.mopilot.website/api/health")
client.close()
