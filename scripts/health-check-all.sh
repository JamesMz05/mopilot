#!/bin/bash
# ============================================================
# Health Check for all services on this server
# Usage: bash /opt/mopilot/scripts/health-check-all.sh
# ============================================================

echo "============================================"
echo "  Server Health Check – $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================"
echo ""

# Check all web services
SERVICES=(
  "MoPilot Hauptsystem|https://mopilot.website"
  "MoPilot Ideenplattform|https://ideen.mopilot.website/api/health"
  "ZEO Kundenassistent|https://zeo-kunden.mopilot.website/api/health"
  "CC Kundenassistent|https://cc-kunden.mopilot.website/api/health"
  "CC Fuhrpark|https://ccfuhrpark.vianova.website/api/health"
  "VIANOVA Verwaltung|https://verwaltung.vianova.website/api/health"
)

ERRORS=0

for SERVICE in "${SERVICES[@]}"; do
  NAME="${SERVICE%%|*}"
  URL="${SERVICE##*|}"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL" 2>/dev/null)

  if [[ "$STATUS" =~ ^(200|301|302|307|308)$ ]]; then
    printf "  ✅ %-25s → HTTP %s\n" "$NAME" "$STATUS"
  else
    printf "  ❌ %-25s → HTTP %s\n" "$NAME" "$STATUS"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""

# Check PostgreSQL
if docker exec postgres-ns8wok04s4sgkcggwg48okcg pg_isready -U mopilot -q 2>/dev/null; then
  echo "  ✅ PostgreSQL               → accepting connections"
else
  echo "  ❌ PostgreSQL               → NOT responding"
  ERRORS=$((ERRORS + 1))
fi

# Check disk
DISK_PCT=$(df / | awk 'NR==2{gsub(/%/,""); print $5}')
if [ "$DISK_PCT" -gt 90 ]; then
  echo "  ❌ Disk                     → ${DISK_PCT}% (KRITISCH!)"
  ERRORS=$((ERRORS + 1))
elif [ "$DISK_PCT" -gt 80 ]; then
  echo "  ⚠️  Disk                     → ${DISK_PCT}% (Warnung)"
else
  echo "  ✅ Disk                     → ${DISK_PCT}%"
fi

# Check RAM
RAM_PCT=$(free | awk '/Mem/{printf "%.0f", $3/$2*100}')
echo "  ℹ️  RAM                      → ${RAM_PCT}% belegt"

echo ""
echo "============================================"
if [ $ERRORS -gt 0 ]; then
  echo "  ⚠️  $ERRORS Problem(e) gefunden!"
else
  echo "  ✅ Alle Services OK"
fi
echo "============================================"

exit $ERRORS
