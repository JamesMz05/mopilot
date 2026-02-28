'use client'
import { useState } from 'react'
import { Thermometer, Zap, Info } from 'lucide-react'
import vehiclesData from '@/data/vehicles.json'

const TEMP_FACTORS: [number, number, string, string][] = [
  [-10, 0.60, 'text-blue-700', 'bg-blue-100'],
  [-5,  0.65, 'text-blue-600', 'bg-blue-50'],
  [0,   0.75, 'text-cyan-600', 'bg-cyan-50'],
  [5,   0.82, 'text-cyan-500', 'bg-cyan-50'],
  [10,  0.85, 'text-teal-500', 'bg-teal-50'],
  [15,  0.93, 'text-teal-600', 'bg-teal-50'],
  [20,  1.00, 'text-zeo-600',  'bg-zeo-50'],
  [25,  0.97, 'text-zeo-500',  'bg-zeo-50'],
  [30,  0.94, 'text-amber-500','bg-amber-50'],
  [35,  0.90, 'text-orange-500','bg-orange-50'],
]

function getTempFactor(temp: number): [number, string, string] {
  const entry = [...TEMP_FACTORS].reverse().find(([t]) => temp >= t) || TEMP_FACTORS[0]
  return [entry[1], entry[2], entry[3]]
}

const DESTINATIONS = [
  { name: 'Karlsruhe Zentrum', km: 22 },
  { name: 'Heidelberg', km: 48 },
  { name: 'Mannheim', km: 38 },
  { name: 'Stuttgart', km: 82 },
  { name: 'Frankfurt', km: 125 },
  { name: 'Freiburg', km: 175 },
]

function TempBar({ temp, factor }: { temp: number; factor: number }) {
  const pct = Math.round(factor * 100)
  const color = temp < 0 ? '#3b82f6' : temp < 15 ? '#06b6d4' : temp < 25 ? '#00a651' : '#f59e0b'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span className="font-bold" style={{ color }}>{pct}% WLTP-Reichweite</span>
        <span>100%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function RangeGuide() {
  const [temp, setTemp] = useState(20)
  const [selectedVehicle, setSelectedVehicle] = useState(vehiclesData[2].id) // Zoe ZE50

  const vehicle = vehiclesData.find(v => v.id === selectedVehicle) || vehiclesData[0]
  const [factor, colorClass, bgClass] = getTempFactor(temp)
  const adjustedRange = Math.round(vehicle.rangeWltp * factor)

  const destinationReachable = (km: number) => {
    if (km * 1.1 <= adjustedRange * 0.8) return 'green'  // comfortable
    if (km * 1.1 <= adjustedRange) return 'yellow'        // possible
    return 'red'                                           // not recommended
  }

  return (
    <section id="reichweite" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-zeo-100 text-zeo-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Thermometer className="w-4 h-4" />
            Modul 3
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zeo-900 mb-2">
            Reichweiten-Guide
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Erfahren Sie, wie weit Sie mit verschiedenen Temperaturen und Fahrzeugmodellen kommen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Vehicle selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fahrzeugmodell</label>
              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                {vehiclesData.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicle(v.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedVehicle === v.id
                        ? 'border-zeo-500 bg-zeo-50'
                        : 'border-gray-200 bg-white hover:border-zeo-300'
                    }`}
                  >
                    <span className="text-xl">{v.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{v.name}</p>
                      <p className="text-xs text-gray-500">{v.rangeMin}–{v.rangeMax} km WLTP · {v.seats} Sitze</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      selectedVehicle === v.id ? 'bg-zeo-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {v.subcategory}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature slider */}
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-gray-700">Außentemperatur</label>
                <span className={`text-lg font-extrabold ${colorClass}`}>{temp > 0 ? '+' : ''}{temp}°C</span>
              </div>
              <input
                type="range" min={-10} max={35} step={5} value={temp}
                onChange={e => setTemp(Number(e.target.value))}
                className="w-full mb-3"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>−10°C ❄️</span>
                <span>+20°C ☀️</span>
                <span>+35°C 🌡️</span>
              </div>
              <div className="mt-4">
                <TempBar temp={temp} factor={factor} />
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4">
            {/* Main range display */}
            <div className={`rounded-2xl p-6 text-center ${bgClass} border-2 border-current`}
              style={{ borderColor: temp < 0 ? '#93c5fd' : temp < 15 ? '#67e8f9' : temp < 25 ? '#86efac' : '#fcd34d' }}>
              <div className="text-6xl font-extrabold mb-1" style={{ color: temp < 0 ? '#1d4ed8' : temp < 15 ? '#0e7490' : temp < 25 ? '#00a651' : '#d97706' }}>
                ~{adjustedRange}
              </div>
              <div className="text-lg font-semibold text-gray-700">km Reichweite</div>
              <div className="text-sm text-gray-500 mt-1">
                {vehicle.name} · {Math.round(factor * 100)}% von {vehicle.rangeWltp} km WLTP
              </div>

              {temp < 5 && (
                <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    <strong>Tipp:</strong> Heizen Sie das Fahrzeug vor, während es noch am Ladekabel hängt. Das schont die Batterie und erhält die Reichweite!
                  </p>
                </div>
              )}
            </div>

            {/* Example destinations */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="font-bold text-gray-900 text-sm mb-3">
                Beispielziele ab Bruchsal
              </h4>
              <div className="space-y-2">
                {DESTINATIONS.map(d => {
                  const status = destinationReachable(d.km)
                  return (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          status === 'green' ? 'bg-zeo-500' :
                          status === 'yellow' ? 'bg-amber-400' : 'bg-red-400'
                        }`} />
                        <span className="text-sm text-gray-700">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{d.km} km</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          status === 'green' ? 'bg-zeo-100 text-zeo-700' :
                          status === 'yellow' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {status === 'green' ? '✓ komfortabel' :
                           status === 'yellow' ? '~ möglich' : '✗ zu weit'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                ✓ komfortabel = genug Reserve · ~ möglich = knapp · ✗ = Reichweite reicht ggf. nicht (Hin- und Rückfahrt)
              </p>
            </div>

            {/* Temperature reference table */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 text-sm mb-3">Reichweite nach Temperatur</h4>
              <div className="grid grid-cols-2 gap-1">
                {TEMP_FACTORS.map(([t, f, tc]) => (
                  <div
                    key={t}
                    className={`flex justify-between px-3 py-1.5 rounded-lg text-xs ${
                      temp === t ? 'bg-zeo-100 font-bold' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-gray-600">{t > 0 ? '+' : ''}{t}°C</span>
                    <span className={tc + ' font-semibold'}>{Math.round(f * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
