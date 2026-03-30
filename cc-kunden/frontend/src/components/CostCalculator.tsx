'use client'
import { useState } from 'react'
import { Calculator, TrendingDown, ExternalLink, Info, Check, Car } from 'lucide-react'
import tariffsData from '@/data/tariffs.json'

/** Calculate km cost for CC eco (tiered: 1-100km / 101+km) */
function kmCostEco(km: number, vc: typeof tariffsData.vehicle_classes[number]) {
  if (km <= 100) return km * vc.km_rate_eco
  return 100 * vc.km_rate_eco + (km - 100) * vc.km_rate_eco_above_100
}

/** Calculate time cost with daily rate cap */
function timeCost(hours: number, hourlyRate: number, dailyRate: number) {
  const raw = hours * hourlyRate
  const days = Math.ceil(hours / 24)
  const capped = days * dailyRate
  return Math.min(raw, capped)
}

function SliderRow({
  label, min, max, value, step = 1, unit, onChange,
}: {
  label: string; min: number; max: number; value: number; step?: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-surface-700">{label}</label>
        <span className="text-sm font-bold text-cc-700 bg-cc-50 px-2 py-0.5 rounded">
          {value} {unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-cc-600"
      />
      <div className="flex justify-between text-xs text-surface-400">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  )
}

export default function CostCalculator() {
  const [hoursPerMonth, setHoursPerMonth] = useState(5)
  const [kmPerMonth, setKmPerMonth] = useState(100)
  const [selectedClass, setSelectedClass] = useState('stadtauto')

  const { tariffs, vehicle_classes, savings_facts } = tariffsData
  const ccEco = tariffs.find(t => t.id === 'cc-eco')!
  const ccGo = tariffs.find(t => t.id === 'cc-go')!
  const vc = vehicle_classes.find(v => v.id === selectedClass)!

  // CC eco: Grundgebühr + Buchungsgebühr + Zeitgebühr (nach Guthaben) + km (gestaffelt)
  const ecoTimeCost = timeCost(Math.max(0, hoursPerMonth - ccEco.included_hours), vc.hourly_rate_eco, vc.daily_rate_eco)
  const ecoKmCost = kmCostEco(kmPerMonth, vc)
  const ecoTotal = ccEco.monthly_fee + vc.booking_fee_eco + ecoTimeCost + ecoKmCost

  // CC go: Buchungsgebühr + Zeitgebühr + km
  const goTimeCost = timeCost(hoursPerMonth, vc.hourly_rate_go, vc.daily_rate_go)
  const goKmCost = kmPerMonth * vc.km_rate_go
  const goTotal = vc.booking_fee_go + goTimeCost + goKmCost

  const recommended = ecoTotal < goTotal ? 'cc-eco' : 'cc-go'

  // Compare with own car (ADAC: ~400€/month for small car including all costs)
  const ownCarMonthly = 400
  const savings = ownCarMonthly - Math.min(ecoTotal, goTotal)

  const fmt = (n: number) => n.toFixed(2).replace('.', ',')

  return (
    <section id="kosten" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-cc-100 text-cc-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" />
            Kostenrechner
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-cc-900 mb-2">
            Was kostet CarSharing?
          </h2>
          <p className="text-surface-500 max-w-xl mx-auto">
            Finde den passenden CC-Tarif – basierend auf deinem Nutzungsverhalten.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sliders */}
          <div className="bg-cc-50 rounded-2xl p-6 sm:p-8 space-y-8">
            <h3 className="font-bold text-cc-900 text-lg">Dein Nutzungsverhalten</h3>

            {/* Vehicle class selector */}
            <div>
              <label className="text-sm font-medium text-surface-700 block mb-2">Fahrzeugklasse</label>
              <div className="grid grid-cols-3 gap-2">
                {vehicle_classes.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedClass(v.id)}
                    className={`p-2.5 rounded-xl text-left text-sm transition-all ${
                      selectedClass === v.id
                        ? 'bg-cc-600 text-white shadow-warm-sm'
                        : 'bg-white text-surface-700 hover:bg-cc-100 border border-surface-200'
                    }`}
                  >
                    <span className="text-base mr-1">{v.icon}</span>
                    <span className="font-medium">{v.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <SliderRow
              label="Stunden pro Monat"
              min={1} max={30} value={hoursPerMonth} unit="Std." onChange={setHoursPerMonth}
            />
            <SliderRow
              label="Kilometer pro Monat"
              min={10} max={500} value={kmPerMonth} step={10} unit="km" onChange={setKmPerMonth}
            />

            <div className="bg-white rounded-xl p-4 border border-cc-200">
              <p className="text-xs text-surface-500 flex gap-1 items-start">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-cc-500" />
                Exakte Berechnung mit offiziellen Tarifdaten (Stand 01.09.2025). Abrechnung: Buchungsgebühr + Zeitgebühr + Kilometergebühr.
              </p>
            </div>

            {/* Cost comparison with own car */}
            {savings > 0 && (
              <div className="bg-cc-600 text-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-5 h-5" />
                  <span className="font-bold">Bis {(savings_facts.breakeven_km_per_year / 1000).toFixed(0)}.000 km/Jahr günstiger als ein eigenes Auto!</span>
                </div>
                <p className="text-cc-100 text-sm">
                  Du sparst geschätzt ~{Math.round(savings)} €/Monat gegenüber einem eigenen PKW (ADAC-Vollkostenrechnung).
                </p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Recommendation banner */}
            <div className={`rounded-2xl p-5 text-white ${recommended === 'cc-eco' ? 'bg-cc-600' : 'bg-cc-700'}`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-5 h-5" />
                <span className="font-bold text-lg">
                  Empfehlung: {recommended === 'cc-eco' ? 'CC eco' : 'CC go'}
                </span>
              </div>
              <p className="text-cc-100 text-sm">
                {recommended === 'cc-eco'
                  ? 'Mit 5 Inklusivstunden und niedrigeren Preisen sparst du bei regelmäßiger Nutzung.'
                  : 'Ohne Grundgebühr – du zahlst nur, wenn du fährst.'}
              </p>
            </div>

            {/* CC eco card */}
            <div className={`rounded-xl border-2 p-5 transition-all ${
              recommended === 'cc-eco' ? 'border-cc-500 bg-cc-50 shadow-warm-md' : 'border-surface-200 bg-white'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-surface-900">CC eco</h4>
                  <p className="text-xs text-surface-500">{ccEco.subtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-display text-cc-700">{fmt(ecoTotal)} €</span>
                  <p className="text-xs text-surface-500">/Monat</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-surface-600">
                <div className="bg-surface-50 rounded-lg p-2">
                  <span className="text-surface-400">Grundgebühr</span>
                  <p className="font-semibold">{ccEco.monthly_fee_display}/Mo.</p>
                </div>
                <div className="bg-surface-50 rounded-lg p-2">
                  <span className="text-surface-400">Freistunden</span>
                  <p className="font-semibold">{ccEco.included_hours} h/Mo.</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-surface-400 space-y-0.5">
                <div>19,00 € + {fmt(vc.booking_fee_eco)} € Buchung + {Math.max(0, hoursPerMonth - ccEco.included_hours)} h × {fmt(vc.hourly_rate_eco)} €</div>
                <div>+ {kmPerMonth <= 100
                  ? `${kmPerMonth} km × ${fmt(vc.km_rate_eco)} €`
                  : `100 km × ${fmt(vc.km_rate_eco)} € + ${kmPerMonth - 100} km × ${fmt(vc.km_rate_eco_above_100)} €`
                }</div>
              </div>
            </div>

            {/* CC go card */}
            <div className={`rounded-xl border-2 p-5 transition-all ${
              recommended === 'cc-go' ? 'border-cc-500 bg-cc-50 shadow-warm-md' : 'border-surface-200 bg-white'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-surface-900">CC go</h4>
                  <p className="text-xs text-surface-500">{ccGo.subtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-display text-surface-700">{fmt(goTotal)} €</span>
                  <p className="text-xs text-surface-500">/Monat</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-surface-600">
                <div className="bg-surface-50 rounded-lg p-2">
                  <span className="text-surface-400">Grundgebühr</span>
                  <p className="font-semibold">keine</p>
                </div>
                <div className="bg-surface-50 rounded-lg p-2">
                  <span className="text-surface-400">Freistunden</span>
                  <p className="font-semibold">keine</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-surface-400">
                {fmt(vc.booking_fee_go)} € Buchung + {hoursPerMonth} h × {fmt(vc.hourly_rate_go)} € + {kmPerMonth} km × {fmt(vc.km_rate_go)} €
              </div>
            </div>

            {/* CTA */}
            <a
              href="https://cc.evemo.app/admin/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-cc-600 text-white py-3.5 rounded-xl font-semibold hover:bg-cc-700 transition-colors"
            >
              Jetzt bei CC registrieren
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Key facts */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-cc-50 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold font-display text-cc-700 mb-1">1 : {savings_facts.cars_replaced_per_sharing}</div>
            <p className="text-sm text-surface-600">1 CarSharing-Auto ersetzt bis zu {savings_facts.cars_replaced_per_sharing} private PKW</p>
          </div>
          <div className="bg-cc-50 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold font-display text-cc-700 mb-1">{savings_facts.private_car_idle_percent}%</div>
            <p className="text-sm text-surface-600">der Zeit stehen Privatautos ungenutzt herum</p>
          </div>
          <div className="bg-cc-50 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold font-display text-cc-700 mb-1">{savings_facts.savings_vs_own_car_eur} €</div>
            <p className="text-sm text-surface-600">jährliche Ersparnis vs. eigener Kleinstwagen (Quelle: {savings_facts.source})</p>
          </div>
        </div>
      </div>
    </section>
  )
}
