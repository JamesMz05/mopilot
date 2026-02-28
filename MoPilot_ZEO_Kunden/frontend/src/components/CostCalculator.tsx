'use client'
import { useState, useMemo } from 'react'
import { Calculator, TrendingDown, ExternalLink, Info } from 'lucide-react'
import tariffsData from '@/data/tariffs.json'

type TariffData = typeof tariffsData[0]

function calcEco(km: number, hours: number, freq: number): number {
  const tariff = tariffsData.find(t => t.id === 'eco')!
  const v = tariff.vehicles.kleinwagen
  const perTrip = v.perBooking + km * (v.perKm ?? 0) + hours * v.perHour
  return freq * perTrip
}

function calcEcoPlus(km: number, hours: number, freq: number): number {
  const tariff = tariffsData.find(t => t.id === 'eco-plus')!
  const v = tariff.vehicles.kleinwagen
  const kmCost = km <= 50
    ? km * (v.perKmUpTo50 ?? 0)
    : 50 * (v.perKmUpTo50 ?? 0) + (km - 50) * (v.perKmFrom51 ?? 0)

  const totalHours = hours * freq
  const freeHours = tariff.freeHoursPerMonth
  const billableHours = Math.max(0, totalHours - freeHours)
  const hourCost = billableHours * v.perHour

  return tariff.monthlyFee + freq * (v.perBooking + kmCost) + hourCost
}

function SliderRow({
  label, min, max, value, step = 1, unit, onChange,
}: {
  label: string; min: number; max: number; value: number; step?: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-zeo-700 bg-zeo-50 px-2 py-0.5 rounded">
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
  const [km, setKm] = useState(50)
  const [hours, setHours] = useState(2)
  const [freq, setFreq] = useState(4)

  const ecoTotal = useMemo(() => calcEco(km, hours, freq), [km, hours, freq])
  const ecoPlusTotal = useMemo(() => calcEcoPlus(km, hours, freq), [km, hours, freq])
  const savings = ecoTotal - ecoPlusTotal
  const recommended = savings > 0 ? 'eco-plus' : 'eco'

  const ecoTariff = tariffsData.find(t => t.id === 'eco')!
  const ecoPlusTariff = tariffsData.find(t => t.id === 'eco-plus')!

  return (
    <section id="kosten" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-zeo-100 text-zeo-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" />
            Modul 1
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zeo-900 mb-2">
            Kostenrechner
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Finden Sie den passenden ZEO-Tarif – basierend auf Ihrem Nutzungsverhalten.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sliders */}
          <div className="bg-zeo-50 rounded-2xl p-6 sm:p-8 space-y-8">
            <h3 className="font-bold text-zeo-900 text-lg">Ihr Nutzungsverhalten</h3>
            <SliderRow
              label="Kilometer pro Fahrt"
              min={5} max={300} value={km} unit="km" onChange={setKm}
            />
            <SliderRow
              label="Fahrtdauer"
              min={0.5} max={12} value={hours} step={0.5} unit="Std." onChange={setHours}
            />
            <SliderRow
              label="Fahrten pro Monat"
              min={1} max={20} value={freq} unit="×" onChange={setFreq}
            />

            <div className="bg-white rounded-xl p-4 border border-zeo-200">
              <p className="text-xs text-gray-500 flex gap-1 items-start">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-zeo-500" />
                Berechnung auf Basis Kleinwagen-Tarife. Preise sind Richtwerte – aktuelle Preise auf{' '}
                <a href="https://www.zeo-carsharing.de/kosten" target="_blank" rel="noopener noreferrer" className="text-zeo-600 underline">
                  zeo-carsharing.de
                </a>.
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Recommendation banner */}
            <div className={`rounded-2xl p-5 text-white ${recommended === 'eco-plus' ? 'bg-zeo-600' : 'bg-zeo-700'}`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-5 h-5" />
                <span className="font-bold text-lg">
                  Empfehlung: {recommended === 'eco-plus' ? 'ZEO eco plus' : 'ZEO eco'}
                </span>
              </div>
              <p className="text-zeo-100 text-sm">
                {recommended === 'eco-plus'
                  ? `Sie sparen ca. ${Math.abs(savings).toFixed(2).replace('.', ',')} € pro Monat gegenüber dem eco-Tarif.`
                  : 'Beim eco-Tarif ohne Grundgebühr fahren Sie günstiger.'}
              </p>
            </div>

            {/* Tariff cards */}
            {[
              { t: ecoTariff, cost: ecoTotal },
              { t: ecoPlusTariff, cost: ecoPlusTotal },
            ].map(({ t, cost }) => (
              <div
                key={t.id}
                className={`rounded-xl border-2 p-5 transition-all ${
                  recommended === t.id
                    ? 'border-zeo-500 bg-zeo-50 shadow-md'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-xs text-gray-500">{t.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-zeo-700">
                      {cost.toFixed(2).replace('.', ',')} €
                    </span>
                    <p className="text-xs text-gray-500">/Monat (variabel)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400">Grundgebühr</span>
                    <p className="font-semibold">{t.monthlyFee === 0 ? 'keine' : `${t.monthlyFee.toFixed(2).replace('.', ',')} €/Monat`}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400">km-Preis (Kleinwagen)</span>
                    <p className="font-semibold">
                      {t.vehicles.kleinwagen.perKm
                        ? `${(t.vehicles.kleinwagen.perKm).toFixed(2).replace('.', ',')} €/km`
                        : `ab ${(t.vehicles.kleinwagen.perKmUpTo50 ?? 0).toFixed(2).replace('.', ',')} €/km`}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400">Stundensatz</span>
                    <p className="font-semibold">{t.vehicles.kleinwagen.perHour.toFixed(2).replace('.', ',')} €/h</p>
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
              href="https://www.zeo-carsharing.de/registrierung"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-zeo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-zeo-700 transition-colors"
            >
              Jetzt bei ZEO registrieren
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Full tariff comparison table */}
        <div className="mt-12 overflow-x-auto">
          <h3 className="font-bold text-zeo-900 text-lg mb-4">Vollständiger Tarifvergleich (Kleinwagen)</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zeo-600 text-white">
                <th className="text-left p-3 rounded-tl-lg">Leistung</th>
                <th className="text-center p-3">ZEO eco</th>
                <th className="text-center p-3 rounded-tr-lg">ZEO eco plus</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Registrierungsgebühr', '€15 (inkl. €15 Startguthaben)', '€0'],
                ['Monatliche Grundgebühr', '€0', '€9,90'],
                ['Freistunden/Monat', '–', '6 Stunden (ansparbar)'],
                ['Pro Buchung', '€0,90', '€0,90'],
                ['Pro km (Kleinwagen)', '€0,29', '€0,27 (bis 50 km) / €0,19 (ab 51 km)'],
                ['Pro Stunde', '€1,90', '€1,70'],
                ['Nachts/Stunde (23–6 h)', '€0,70', '€0,60'],
                ['Pro Tag (24 h)', '€22,90', '€19,90'],
                ['Kündigungsfrist', '1 Monat', '6 Monate'],
              ].map(([feature, eco, ecoPlus], i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zeo-50'}>
                  <td className="p-3 font-medium text-gray-700 border-b border-zeo-100">{feature}</td>
                  <td className="p-3 text-center text-gray-600 border-b border-zeo-100">{eco}</td>
                  <td className="p-3 text-center text-zeo-700 font-medium border-b border-zeo-100">{ecoPlus}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2">
            * Preise für Kompaktklasse/Hochdachkombi: €0,31/km (eco) bzw. €0,29/€0,21/km (eco plus). Tagessatz identisch.
          </p>
        </div>
      </div>
    </section>
  )
}
