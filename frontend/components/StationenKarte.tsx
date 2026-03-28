// components/StationenKarte.tsx
// Interaktive Leaflet-Karte mit ZEO-Stationen
// WICHTIG: Muss mit next/dynamic geladen werden (kein SSR)
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Typen ────────────────────────────────────────────

interface FahrzeugTyp {
  id: string;
  name: string;
  hersteller: string;
  modell: string;
  reichweiteKm: number;
  sitzplaetze: number;
}

interface StationFahrzeug {
  typId: string;
  anzahl: number;
  typ: FahrzeugTyp | null;
}

interface Station {
  id: string;
  name: string;
  lat: number;
  lon: number;
  adresse: string;
  plz: string;
  verfuegbar: number;
  istAktiv: boolean;
  fahrzeuge: StationFahrzeug[];
}

interface StationenKarteProps {
  stationen: Station[];
  ausgewaehlteStation: string | null;
  onStationKlick: (id: string) => void;
}

// ── Hilfsfunktionen ──────────────────────────────────

function erstelleMarkerIcon(verfuegbar: number, istAusgewaehlt: boolean): L.DivIcon {
  const farbe =
    verfuegbar === 0 ? '#dc2626' : verfuegbar === 1 ? '#d97706' : '#4f46e5';
  const groesse = istAusgewaehlt ? 20 : verfuegbar >= 2 ? 14 : verfuegbar === 1 ? 12 : 10;
  const ring = istAusgewaehlt
    ? `box-shadow:0 0 0 4px rgba(79,70,229,0.3);`
    : '';

  return L.divIcon({
    className: '',
    html: `<div style="
      width:${groesse}px;
      height:${groesse}px;
      border-radius:50%;
      background:${farbe};
      border:2.5px solid #fff;
      box-shadow:0 1px 6px rgba(0,0,0,0.35);
      ${ring}
      transition:all 0.2s;
    "></div>`,
    iconSize: [groesse, groesse],
    iconAnchor: [groesse / 2, groesse / 2],
    popupAnchor: [0, -groesse / 2 - 4],
  });
}

function erstellePopupHtml(station: Station): string {
  const fahrzeugeHtml = station.fahrzeuge
    .filter((f) => f.anzahl > 0)
    .map(
      (f) =>
        `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;">
          <span>${f.typ?.hersteller || '?'} ${f.typ?.modell || ''}</span>
          <span style="font-weight:600;color:#4f46e5">${f.anzahl}×</span>
        </div>`
    )
    .join('');

  const statusBadge =
    station.verfuegbar === 0
      ? '<span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">Leer</span>'
      : `<span style="background:#e0e7ff;color:#4338ca;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">${station.verfuegbar} verfügbar</span>`;

  return `
    <div style="font-family:'Segoe UI',system-ui,sans-serif;min-width:220px">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:8px;margin-bottom:6px">
        <div style="font-weight:600;font-size:14px;color:#3730a3;line-height:1.3">${station.name}</div>
        ${statusBadge}
      </div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:8px">${station.adresse}</div>
      ${
        fahrzeugeHtml
          ? `<div style="border-top:1px solid #e5e7eb;padding-top:6px">${fahrzeugeHtml}</div>`
          : '<div style="color:#9ca3af;font-size:12px;font-style:italic">Keine Fahrzeuge an dieser Station</div>'
      }
    </div>
  `;
}

// ── Komponente ───────────────────────────────────────

export default function StationenKarte({
  stationen,
  ausgewaehlteStation,
  onStationKlick,
}: StationenKarteProps) {
  const karteRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Karte initialisieren
  useEffect(() => {
    if (!karteRef.current || mapRef.current) return;

    const karte = L.map(karteRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([49.14, 8.60], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(karte);

    mapRef.current = karte;

    return () => {
      karte.remove();
      mapRef.current = null;
    };
  }, []);

  // Marker aktualisieren wenn Daten sich ändern
  useEffect(() => {
    const karte = mapRef.current;
    if (!karte) return;

    markersRef.current.forEach((marker) => karte.removeLayer(marker));
    markersRef.current.clear();

    stationen.forEach((station) => {
      const istAusgewaehlt = station.id === ausgewaehlteStation;
      const icon = erstelleMarkerIcon(station.verfuegbar, istAusgewaehlt);

      const marker = L.marker([station.lat, station.lon], { icon })
        .bindPopup(erstellePopupHtml(station), { maxWidth: 320 })
        .on('click', () => onStationKlick(station.id))
        .addTo(karte);

      markersRef.current.set(station.id, marker);
    });
  }, [stationen, ausgewaehlteStation, onStationKlick]);

  // Zur ausgewählten Station fliegen
  useEffect(() => {
    if (!ausgewaehlteStation || !mapRef.current) return;
    const station = stationen.find((s) => s.id === ausgewaehlteStation);
    const marker = markersRef.current.get(ausgewaehlteStation);
    if (station && marker) {
      mapRef.current.flyTo([station.lat, station.lon], 14, { duration: 0.8 });
      marker.openPopup();
    }
  }, [ausgewaehlteStation, stationen]);

  return (
    <div
      ref={karteRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
}
