'use client'
import { useState, useMemo } from 'react'
import { Car, Users, Package, Zap, Filter } from 'lucide-react'
import vehiclesData from '@/data/vehicles.json'

type Vehicle = typeof vehiclesData[0]

const SEAT_OPTIONS = ['Alle', '1–3', '4–5', '6–7', '8–9']
const RANGE_OPTIONS = ['Alle', '< 150 km', '150–250 km', '> 250 km']
const FEATURE_OPTIONS = ['Alle', 'Anhängerkupplung', 'Großer Laderaum']

function matchesSeats(v: Vehicle, f: string) {
  if (f === 'Alle') return true
  if (f === '1–3') return v.seats <= 3
  if (f === '4–5') return v.seats >= 4 && v.seats <= 5
  if (f === '6–7') return v.seats >= 6 && v.seats <= 7
  if (f === '8–9') return v.seats >= 8
  return true
}

function matchesRange(v: Vehicle, f: string) {
  if (f === 'Alle') return true
  if (f === '< 150 km') return v.rangeWltp < 150
  if (f === '150–250 km') return v.rangeWltp >= 150 && v.rangeWltp <= 250
  if (f === '> 250 km') return v.rangeWltp > 250
  return true
}

function matchesFeature(v: Vehicle, f: string) {
  if (f === 'Alle') return true
  if (f === 'Anhängerkupplung') return v.features.some(feat => feat.toLowerCase().includes('anhänger'))
  if (f === 'Großer Laderaum') return v.trunk > 500
  return true
}

function RangeBar({ min, max, wltp }: { min: number; max: number; wltp: number }) {
  const pct = Math.min(100, Math.round((wltp / 350) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{min}–{wltp} km</span>
        <span className="text-zeo-600 font-medium">WLTP max</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-zeo-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function VehicleCard({ v }: { v: Vehicle }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-zeo-300 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Category badge */}
      <div className="bg-gradient-to-br from-zeo-600 to-zeo-700 px-4 py-5 relative">
        <div className="text-5xl text-center mb-1">{v.icon}</div>
        <div className="text-center">
          <span className="text-xs font-semibold text-zeo-100 bg-white/20 px-2 py-0.5 rounded-full">
            {v.category}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">{v.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{v.description}</p>
        </div>

        {/* Key specs */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zeo-50 rounded-lg p-2 text-center">
            <Users className="w-4 h-4 text-zeo-600 mx-auto mb-0.5" />
            <div className="font-bold text-sm text-zeo-800">{v.seats}</div>
            <div className="text-[10px] text-gray-500">Sitze</div>
          </div>
          <div className="bg-zeo-50 rounded-lg p-2 text-center">
            <Package className="w-4 h-4 text-zeo-600 mx-auto mb-0.5" />
            <div className="font-bold text-sm text-zeo-800">
              {v.trunk > 1000 ? `${(v.trunk / 1000).toFixed(1).replace('.', ',')}m³` : `${v.trunk}L`}
            </div>
            <div className="text-[10px] text-gray-500">Koffer./Laderaum</div>
          </div>
          <div className="bg-zeo-50 rounded-lg p-2 text-center">
            <Zap className="w-4 h-4 text-zeo-600 mx-auto mb-0.5" />
            <div className="font-bold text-sm text-zeo-800">{v.rangeWltp}</div>
            <div className="text-[10px] text-gray-500">km (WLTP)</div>
          </div>
        </div>

        {/* Range bar */}
        <RangeBar min={v.rangeMin} max={v.rangeMax} wltp={v.rangeWltp} />

        {/* Features */}
        <div className="flex flex-wrap gap-1">
          {v.features.slice(0, 4).map(f => (
            <span key={f} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {f}
            </span>
          ))}
        </div>

        {/* Suitable for */}
        <div>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Geeignet für</p>
          <div className="flex flex-wrap gap-1">
            {v.suitable.map(s => (
              <span key={s} className="text-[10px] bg-zeo-100 text-zeo-700 px-2 py-0.5 rounded-full font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VehicleCards() {
  const [seatFilter, setSeatFilter] = useState('Alle')
  const [rangeFilter, setRangeFilter] = useState('Alle')
  const [featureFilter, setFeatureFilter] = useState('Alle')

  const filtered = useMemo(
    () => vehiclesData.filter(v =>
      matchesSeats(v, seatFilter) &&
      matchesRange(v, rangeFilter) &&
      matchesFeature(v, featureFilter)
    ),
    [seatFilter, rangeFilter, featureFilter]
  )

  return (
    <section id="fahrzeuge" className="py-16 px-4 sm:px-6 lg:px-8 bg-zeo-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-zeo-100 text-zeo-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Car className="w-4 h-4" />
            Modul 4
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zeo-900 mb-2">
            Fahrzeuge & Ausstattung
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Alle {vehiclesData.length} ZEO-Modelle im Überblick – von der kompakten Zoe bis zum 9-Sitzer.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-8 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-zeo-600" />
            <span className="font-semibold text-gray-700 text-sm">Filter</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Seat filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Personenzahl</label>
              <div className="flex flex-wrap gap-1.5">
                {SEAT_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSeatFilter(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      seatFilter === opt
                        ? 'bg-zeo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-zeo-100 hover:text-zeo-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            {/* Range filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Reichweite (WLTP)</label>
              <div className="flex flex-wrap gap-1.5">
                {RANGE_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setRangeFilter(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      rangeFilter === opt
                        ? 'bg-zeo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-zeo-100 hover:text-zeo-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            {/* Feature filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Sonderausstattung</label>
              <div className="flex flex-wrap gap-1.5">
                {FEATURE_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setFeatureFilter(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      featureFilter === opt
                        ? 'bg-zeo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-zeo-100 hover:text-zeo-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {(seatFilter !== 'Alle' || rangeFilter !== 'Alle' || featureFilter !== 'Alle') && (
            <button
              onClick={() => { setSeatFilter('Alle'); setRangeFilter('Alle'); setFeatureFilter('Alle') }}
              className="mt-3 text-xs text-gray-400 hover:text-zeo-600 transition-colors underline"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Fahrzeuge gefunden. Bitte Filter anpassen.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(v => <VehicleCard key={v.id} v={v} />)}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Fahrzeugverfügbarkeit je nach Station · Aktuelle Modelle auf{' '}
          <a href="https://www.zeo-carsharing.de/unsere-modelle" target="_blank" rel="noopener noreferrer" className="underline text-zeo-500">
            zeo-carsharing.de
          </a>
        </p>
      </div>
    </section>
  )
}
