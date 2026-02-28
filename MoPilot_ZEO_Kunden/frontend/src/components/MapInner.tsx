'use client'
import { useEffect, useRef } from 'react'
import stationsData from '@/data/stations.json'

type Station = typeof stationsData[0]

interface Props {
  filter: 'all' | 'bahn' | 'tram' | 'bus'
}

export default function MapInner({ filter }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  const filteredStations = stationsData.filter(s => {
    if (filter === 'all') return true
    return s.transit.some((t: any) => t.type === filter)
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    import('leaflet').then(L => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      if (!mapRef.current) return

      const map = L.map(mapRef.current, {
        center: [49.15, 8.55],
        zoom: 11,
        zoomControl: true,
      })

      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      const createIcon = (transit: any[]) => {
        const hasRail = transit.some((t: any) => t.type === 'bahn' || t.type === 'tram')
        const hasBus = transit.some((t: any) => t.type === 'bus')
        const bgColor = hasRail ? '#00a651' : hasBus ? '#22c55e' : '#86efac'

        return L.divIcon({
          className: '',
          html: `<div style="
            width: 28px; height: 28px;
            background: ${bgColor};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; line-height: 1;
          ">⚡</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        })
      }

      filteredStations.forEach((station: Station) => {
        const marker = L.marker([station.lat, station.lng], {
          icon: createIcon(station.transit),
        }).addTo(map)

        const transitList = station.transit
          .map((t: any) => {
            const icons: Record<string, string> = { bahn: '🚆', tram: '🚊', bus: '🚌' }
            return `<div style="margin: 3px 0; font-size: 12px;">
              ${icons[t.type] || '🚏'} <strong>${t.line}</strong> ${t.direction}
              <span style="color:#888; font-size:11px;"> – ${t.interval}</span>
            </div>`
          })
          .join('')

        const popup = L.popup({ maxWidth: 280 }).setContent(`
          <div style="font-family: Inter, sans-serif; padding: 4px;">
            <div style="font-weight: 700; font-size: 14px; color: #006b33; margin-bottom: 4px;">
              ⚡ ${station.name}
            </div>
            <div style="font-size: 11px; color: #666; margin-bottom: 8px;">${station.address}</div>
            <div style="font-size: 12px; color: #444; font-weight: 600; margin-bottom: 4px;">Verfügbare Fahrzeuge:</div>
            ${station.vehicles.map((v: string) => `<span style="display:inline-block; background:#dcfce7; color:#006b33; font-size:11px; padding:2px 6px; border-radius:999px; margin:2px 2px 2px 0;">${v}</span>`).join('')}
            <div style="font-size: 12px; color: #444; font-weight: 600; margin: 8px 0 4px;">ÖPNV-Anschluss:</div>
            ${transitList}
            <a
              href="${station.transitLink}"
              target="_blank"
              rel="noopener noreferrer"
              style="display:block; margin-top:8px; background:#00a651; color:white; text-align:center; padding:5px 10px; border-radius:6px; font-size:12px; text-decoration:none; font-weight:600;"
            >
              🔍 ÖPNV-Verbindung suchen
            </a>
          </div>
        `)

        marker.bindPopup(popup)
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [filter])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        crossOrigin="anonymous"
      />
      <div ref={mapRef} style={{ height: '450px', width: '100%', borderRadius: '12px' }} />
    </>
  )
}
