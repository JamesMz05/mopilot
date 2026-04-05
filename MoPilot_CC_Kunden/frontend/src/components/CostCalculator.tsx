'use client'
import { useState } from 'react'
import { Calculator, TrendingDown, ExternalLink, Info, Check, Car } from 'lucide-react'
import tariffsData from '@/data/tariffs.json'

function SliderRow({
  label, min, max, value, step = 1, unit, onChange,
}: {
  label: string; min: number; max: number; value: number; step?: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-cc-700 bg-cc-50 px-2 py-0.5 rounded">
          {value} {unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  )
}

export default function CostCalculator() {
  const [hoursPerMonth, setHoursPerMonth] = useState(5)
  const [kmPerMonth, setKmPerMonth] = useState(100)

  const ccEco = tariffsData.find(t => t.id === 'cc-eco')!
  const ccGo = tariffsData.find(t => t.id === 'cc-go')!

  // Rough estimate: CC eco = 19€/month + usage beyond 5 free hours
  // CC go = pure usage cost, no base fee
  // Reference: ~65€/month for 100km/5h (Standardtarif)
  // Since per-km/per-hour prices aren't public, we estimate based on the reference
  const estimatedHourlyRate = 8.0 // approximate
  const estimatedKmRate = 0.10 // approximate

  const ecoUsageCost = Math.max(0, hoursPerMonth - ccEco.freeHoursPerMonth) * estimatedHourlyRate + kmPerMonth * estimatedKmRate
  const ecoTotal = ccEco.monthlyFee + ecoUsageCost
  const goUsageCost = hoursPerMonth * estimatedHourlyRate + kmPerMonth * estimatedKmRate
  const goTotal = goUsageCost

  const recommended = ecoTotal < goTotal ? 'cc-eco' : 'cc-go'

  // Compare with own car (ADAC: ~400€/month for small car including all costs)
  const ownCarMonthly = 400
  const savings = ownCarMonthly - Math.min(ecoTotal, goTotal)

  return (
    <section id="kosten" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-cc-100 text-cc-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" />
            Modul 1
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-cc-900 mb-2">
            Kostenrechner
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Finde den passenden CC-Tarif – basierend auf deinem Nutzungsverhalten.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sliders */}
          <div className="bg-cc-50 rounded-2xl p-6 sm:p-8 space-y-8">
            <h3 className="font-bold text-cc-900 text-lg">Dein Nutzungsverhalten</h3>
            <SliderRow
              label="Stunden pro Monat"
              min={1} max={30} value={hoursPerMonth} unit="Std." onChange={setHoursPerMonth}
            />
            <SliderRow
              label="Kilometer pro Monat"
              min={10} max={500} value={kmPerMonth} step={10} unit="km" onChange={setKmPerMonth}
            />

            <div className="bg-white rounded-xl p-4 border border-cc-200">
              <p className="text-xs text-gray-500 flex gap-1 items-start">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-cc-500" />
                Richtwert-Berechnung. Exakte Preise auf{' '}
                <a href="https://carsharing2go.net" target="_blank" rel="noopener noreferrer" className="text-cc-600 underline">
                  carsharing2go.net
                </a>.
              </p>
            </div>

            {/* Cost comparison with own car */}
            {savings > 0 && (
              <div className="bg-cc-600 text-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-5 h-5" />
                  <span className="font-bold">Bis 10.000 km/Jahr günstiger als ein eigenes Auto!</span>
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
                  ? `Mit 5 Freistunden pro Monat sparst du bei regelmäßiger Nutzung.`
                  : 'Ohne Grundgebühr – du zahlst nur, wenn du fährst.'}
              </p>
            </div>

            {/* Tariff cards */}
            {[
              { t: ccEco, cost: ecoTotal },
              { t: ccGo, cost: goTotal },
            ].map(({ t, cost }) => (
              <div
                key={t.id}
                className={`rounded-xl border-2 p-5 transition-all ${
                  recommended === t.id
                    ? 'border-cc-500 bg-cc-50 shadow-md'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-xs text-gray-500">{t.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-cc-700">
                      ~{cost.toFixed(0)} €
                    </span>
                    <p className="text-xs text-gray-500">/Monat (geschätzt)</p>
                  </div>
                </div>

                <div className="space-y-1.5 mt-3">
                  {t.perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-cc-500 flex-shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-600">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400">Grundgebühr</span>
                    <p className="font-semibold">{t.monthlyFee === 0 ? 'keine' : `${t.monthlyFee.toFixed(2).replace('.', ',')} €/Monat`}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400">Freistunden</span>
                    <p className="font-semibold">{t.freeHoursPerMonth > 0 ? `${t.freeHoursPerMonth} h/Monat` : 'keine'}</p>
                  </div>
                </div>
              </div>
            ))}

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
            <div className="text-3xl font-extrabold text-cc-700 mb-1">1 : 20</div>
            <p className="text-sm text-gray-600">1 CarSharing-Auto ersetzt bis zu 20 private PKW</p>
          </div>
          <div className="bg-cc-50 rounded-xl p-5 text-center">
            <div className="text-3xl font-extrabold text-cc-700 mb-1">90%</div>
            <p className="text-sm text-gray-600">der Zeit stehen Privatautos ungenutzt herum</p>
          </div>
          <div className="bg-cc-50 rounded-xl p-5 text-center">
            <div className="text-3xl font-extrabold text-cc-700 mb-1">741 €</div>
            <p className="text-sm text-gray-600">jährliche Ersparnis vs. eigener Kleinstwagen (Quelle: bcs)</p>
          </div>
        </div>
      </div>
    </section>
  )
}
