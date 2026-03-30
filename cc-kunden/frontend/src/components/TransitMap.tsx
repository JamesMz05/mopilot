'use client'
import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Train, Bus } from 'lucide-react'

const MapInner = dynamic(() => import('./MapInner'), { ssr: false })

type FilterType = 'all' | 'bahn' | 'tram' | 'bus'

const FILTERS: { key: FilterType; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'Alle Stationen', icon: <MapPin className="w-4 h-4" /> },
  { key: 'bahn', label: 'Bahnanschluss', icon: <Train className="w-4 h-4" /> },
  { key: 'tram', label: 'Straßenbahn', icon: <Train className="w-4 h-4" /> },
  { key: 'bus', label: 'Busanschluss', icon: <Bus className="w-4 h-4" /> },
]

export default function TransitMap() {
  const [filter, setFilter] = useState<FilterType>('all')

  return (
    <section id="stationen" className="py-16 px-4 sm:px-6 lg:px-8 bg-cc-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-cc-100 text-cc-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            Modul 2
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-cc-900 mb-2">
            CC-Stationen & ÖPNV-Anschluss
          </h2>
          <p className="text-surface-500 max-w-xl mx-auto">
            Kombiniere CC E-CarSharing mit Bus und Bahn. Klicke auf eine Station für Details.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-cc-600 text-white shadow-warm-sm'
                  : 'bg-white text-surface-600 border border-surface-200 hover:border-cc-400 hover:text-cc-700'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-cc-200">
          <Suspense fallback={
            <div className="h-[450px] flex items-center justify-center bg-cc-50">
              <div className="text-center text-surface-400">
                <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                Karte wird geladen…
              </div>
            </div>
          }>
            <MapInner filter={filter} />
          </Suspense>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-surface-500">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-cc-600 inline-block" />
            Station mit Bahnanschluss
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-cc-400 inline-block" />
            Station mit Busanschluss
          </span>
        </div>

        <p className="text-center text-xs text-surface-400 mt-3">
          Karte: <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> · Alle 12 CC-Standorte in der Region Oberbergischer Kreis und Rhein-Sieg
        </p>
      </div>
    </section>
  )
}
