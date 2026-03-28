// app/stationen/page.tsx
// ZEO GBFS Live-Dashboard — Stationenübersicht mit Karte
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const StationenKarte = dynamic(() => import('@/components/StationenKarte'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
      <div className="text-gray-400 text-sm">Karte wird geladen...</div>
    </div>
  ),
});

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

interface GbfsDaten {
  aktualisiert: string;
  ttl: number;
  zusammenfassung: {
    stationenGesamt: number;
    fahrzeugeVerfuegbar: number;
    stationenLeer: number;
    stationenMitFahrzeug: number;
    fahrzeugTypenAnzahl: number;
  };
  fahrzeugTypen: FahrzeugTyp[];
  stationen: Station[];
}

type FilterTyp = 'alle' | 'verfuegbar' | 'leer' | 'mehrere';

// ── KPI-Karte ────────────────────────────────────────

function KpiKarte({
  icon,
  wert,
  label,
  akzent,
}: {
  icon: string;
  wert: number | string;
  label: string;
  akzent?: 'indigo' | 'amber' | 'rot';
}) {
  const farbKlassen = {
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
    rot: 'bg-red-50 text-red-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
      <div
        className={`p-2.5 rounded-lg text-xl ${
          akzent ? farbKlassen[akzent] : 'bg-gray-100 text-gray-600'
        }`}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 tracking-tight">
          {wert}
        </div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          {label}
        </div>
      </div>
    </div>
  );
}

// ── Stations-Listeneintrag ───────────────────────────

function StationsEintrag({
  station,
  istAusgewaehlt,
  onClick,
}: {
  station: Station;
  istAusgewaehlt: boolean;
  onClick: () => void;
}) {
  const fahrzeugText = station.fahrzeuge
    .filter((f) => f.anzahl > 0)
    .map((f) => `${f.anzahl}× ${f.typ?.name || 'Unbekannt'}`)
    .join(', ');

  const punktFarbe =
    station.verfuegbar === 0
      ? 'bg-red-500'
      : station.verfuegbar === 1
        ? 'bg-amber-500'
        : 'bg-indigo-500';

  const badgeFarbe =
    station.verfuegbar === 0
      ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
      : station.verfuegbar === 1
        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
        : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
        istAusgewaehlt
          ? 'bg-indigo-50 ring-1 ring-indigo-300'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${punktFarbe}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {station.name}
        </div>
        <div className="text-xs text-gray-400 truncate">
          {fahrzeugText || 'Keine Fahrzeuge'}
        </div>
      </div>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeFarbe}`}
      >
        {station.verfuegbar}
      </span>
      <span className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors">›</span>
    </button>
  );
}

// ── Hauptkomponente ──────────────────────────────────

export default function StationenSeite() {
  const [daten, setDaten] = useState<GbfsDaten | null>(null);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTyp>('alle');
  const [suchbegriff, setSuchbegriff] = useState('');
  const [ausgewaehlteStation, setAusgewaehlteStation] = useState<string | null>(
    null
  );

  // Daten laden
  const datenLaden = useCallback(async () => {
    try {
      setLaden(true);
      setFehler(null);
      const res = await fetch('/api/gbfs');
      if (!res.ok) throw new Error('GBFS-Abruf fehlgeschlagen');
      const json: GbfsDaten = await res.json();
      json.stationen.sort((a, b) => a.name.localeCompare(b.name, 'de'));
      setDaten(json);
    } catch (err) {
      setFehler('Daten konnten nicht geladen werden');
      console.error('GBFS-Fehler:', err);
    } finally {
      setLaden(false);
    }
  }, []);

  // Erstladen + Auto-Refresh alle 5 Minuten
  useEffect(() => {
    datenLaden();
    const intervall = setInterval(datenLaden, 300_000);
    return () => clearInterval(intervall);
  }, [datenLaden]);

  // Gefilterte Stationen
  const gefilterteStationen = useMemo(() => {
    if (!daten) return [];
    let ergebnis = daten.stationen;

    if (suchbegriff) {
      const q = suchbegriff.toLowerCase();
      ergebnis = ergebnis.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.adresse.toLowerCase().includes(q) ||
          s.plz.includes(q)
      );
    }

    switch (filter) {
      case 'verfuegbar':
        ergebnis = ergebnis.filter((s) => s.verfuegbar > 0);
        break;
      case 'leer':
        ergebnis = ergebnis.filter((s) => s.verfuegbar === 0);
        break;
      case 'mehrere':
        ergebnis = ergebnis.filter((s) => s.verfuegbar >= 2);
        break;
    }

    return ergebnis;
  }, [daten, filter, suchbegriff]);

  // Zeitstempel formatieren
  const zeitstempel = daten?.aktualisiert
    ? new Date(daten.aktualisiert).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

  // Auslastung berechnen
  const auslastung = daten
    ? Math.round(
        (daten.zusammenfassung.stationenLeer /
          daten.zusammenfassung.stationenGesamt) *
          100
      )
    : 0;

  // ── Render ────────────────────────────────────────

  if (fehler && !daten) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
            ← Zurück zum Dashboard
          </Link>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <span className="text-5xl block mb-4">⚠️</span>
              <p className="text-gray-600 mb-4">{fehler}</p>
              <button
                onClick={datenLaden}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
            ← Zurück zum Dashboard
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📍 ZEO Stationen und Fahrzeuge live Status
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                ZEO Carsharing — Live-Verfügbarkeit via GBFS
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                Aktualisiert: {zeitstempel}
              </span>
              <button
                onClick={datenLaden}
                disabled={laden}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {laden ? '⏳' : '🔄'} Aktualisieren
              </button>
            </div>
          </div>
        </div>

        {/* KPI-Karten */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiKarte
            icon="📍"
            wert={daten?.zusammenfassung.stationenGesamt ?? '—'}
            label="Stationen"
            akzent="indigo"
          />
          <KpiKarte
            icon="🚗"
            wert={daten?.zusammenfassung.fahrzeugeVerfuegbar ?? '—'}
            label="Fahrzeuge verf."
            akzent="indigo"
          />
          <KpiKarte
            icon="⚠️"
            wert={daten?.zusammenfassung.stationenLeer ?? '—'}
            label="Stationen leer"
            akzent={
              (daten?.zusammenfassung.stationenLeer ?? 0) > 10 ? 'rot' : 'amber'
            }
          />
          <KpiKarte
            icon="⚡"
            wert={`${auslastung}%`}
            label="Leerstandsquote"
            akzent={auslastung > 30 ? 'rot' : auslastung > 15 ? 'amber' : 'indigo'}
          />
        </div>

        {/* Karte + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4" style={{ height: '520px' }}>
          {/* Karte */}
          <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {laden && !daten && (
              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  ⏳ Lade GBFS-Daten...
                </div>
              </div>
            )}
            <StationenKarte
              stationen={gefilterteStationen}
              ausgewaehlteStation={ausgewaehlteStation}
              onStationKlick={(id) => setAusgewaehlteStation(id)}
            />
          </div>

          {/* Sidebar: Stationsliste */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            {/* Suchfeld */}
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="🔍 Station suchen..."
                value={suchbegriff}
                onChange={(e) => setSuchbegriff(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Filter-Tabs */}
            <div className="flex gap-1.5 px-3 py-2 border-b border-gray-100 overflow-x-auto">
              {(
                [
                  ['alle', 'Alle'],
                  ['verfuegbar', 'Verfügbar'],
                  ['leer', 'Leer'],
                  ['mehrere', '2+ Fzg'],
                ] as [FilterTyp, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                    filter === key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Stationszähler */}
            <div className="px-3 py-1.5 text-xs text-gray-400 border-b border-gray-50">
              {gefilterteStationen.length} Station
              {gefilterteStationen.length !== 1 ? 'en' : ''}
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto px-1.5 py-1">
              {gefilterteStationen.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  Keine Stationen gefunden
                </div>
              ) : (
                gefilterteStationen.map((station) => (
                  <StationsEintrag
                    key={station.id}
                    station={station}
                    istAusgewaehlt={station.id === ausgewaehlteStation}
                    onClick={() => setAusgewaehlteStation(station.id)}
                  />
                ))
              )}
            </div>

            {/* Legende */}
            <div className="px-3 py-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Verfügbar
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 1 Fzg
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Leer
              </span>
              <span className="ml-auto text-[10px]">GBFS 2.3</span>
            </div>
          </div>
        </div>

        {/* Fahrzeugtypen-Übersicht */}
        {daten && daten.fahrzeugTypen.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Fahrzeugtypen in der Flotte
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {daten.fahrzeugTypen.map((typ) => {
                const verfuegbar = daten.stationen.reduce(
                  (sum, s) =>
                    sum +
                    s.fahrzeuge
                      .filter((f) => f.typId === typ.id)
                      .reduce((s2, f) => s2 + f.anzahl, 0),
                  0
                );
                const anStationen = daten.stationen.filter((s) =>
                  s.fahrzeuge.some((f) => f.typId === typ.id && f.anzahl > 0)
                ).length;

                return (
                  <div
                    key={typ.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      {typ.hersteller} {typ.modell}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">{typ.name}</div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        ⚡ {typ.reichweiteKm} km
                      </span>
                      <span className="flex items-center gap-1">
                        👥 {typ.sitzplaetze}
                      </span>
                      <span className="flex items-center gap-1 ml-auto font-semibold text-indigo-700">
                        🚗 {verfuegbar}×
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
