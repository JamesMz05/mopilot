'use client'
import { useState } from 'react'
import { Check, ChevronDown, Star, Zap, ExternalLink } from 'lucide-react'
import tariffsData from '@/data/tariffs-detailed.json'

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

const fmt = (n: number) => n.toFixed(2).replace('.', ',')

export default function TariffOverview() {
  const { tariffs, vehicle_classes, included_in_price, cost_examples, savings_facts, faq_tariff } = tariffsData
  const ccEco = tariffs.find(t => t.id === 'cc-eco')!
  const ccGo = tariffs.find(t => t.id === 'cc-go')!

  // Section D – Tarifberater state
  const [selectedClass, setSelectedClass] = useState(vehicle_classes[0].id)
  const [hours, setHours] = useState(5)
  const [km, setKm] = useState(100)

  // Section E – FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const vc = vehicle_classes.find(v => v.id === selectedClass)!

  // CC eco calculation
  const ecoTime = timeCost(Math.max(0, hours - ccEco.included_hours), vc.hourly_rate_eco, vc.daily_rate_eco)
  const ecoKm = kmCostEco(km, vc)
  const ecoCost = ccEco.monthly_fee + vc.booking_fee_eco + ecoTime + ecoKm

  // CC go calculation
  const goTime = timeCost(hours, vc.hourly_rate_go, vc.daily_rate_go)
  const goKm = km * vc.km_rate_go
  const goCost = vc.booking_fee_go + goTime + goKm

  const recommended = ecoCost <= goCost ? 'cc-eco' : 'cc-go'

  function calcExample(ex: typeof cost_examples[number]) {
    const v = vehicle_classes.find(c => c.id === ex.vehicle_class)!
    const ecoT = timeCost(ex.hours, v.hourly_rate_eco, v.daily_rate_eco)
    const ecoK = kmCostEco(ex.km, v)
    const eco = v.booking_fee_eco + ecoT + ecoK
    const goT = timeCost(ex.hours, v.hourly_rate_go, v.daily_rate_go)
    const goK = ex.km * v.km_rate_go
    const go = v.booking_fee_go + goT + goK
    return { eco, go, vehicleName: v.name }
  }

  return (
    <section id="tarife" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-cc-50/30">
      <div className="max-w-6xl mx-auto">

        {/* ═══ Section A: Tarifvergleich Hero ═══ */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-cc-900">
                Tarife und Konditionen
              </h2>
              <p className="text-sm text-surface-500 font-body">gültig ab 1.9.2025</p>
            </div>
            <a href="https://carsharing2go.net/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
              <img
                src="/cc-logo.jpg"
                alt="Car&RideSharing Community Logo"
                width={72}
                height={72}
                className="rounded-xl shadow-warm-sm hover:shadow-warm-md transition-shadow"
              />
            </a>
          </div>
          <p className="text-surface-600 font-body max-w-2xl mx-auto">
            Zwei Tarife, eine Mission: nachhaltige Mobilität für alle.
            Strom, Versicherung, Wartung – alles inklusive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* CC eco card */}
          <div className="relative rounded-2xl border-2 border-cc-500 bg-white p-6 sm:p-8 shadow-warm-lg">
            <div className="absolute -top-3 left-6 bg-cc-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Empfohlen
            </div>
            <div className="mb-4">
              <h3 className="text-2xl font-bold font-display text-cc-900">{ccEco.name}</h3>
              <p className="text-sm text-surface-500 font-body">{ccEco.subtitle}</p>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold font-display text-cc-700">{ccEco.monthly_fee_display}</span>
              <span className="text-surface-500 text-sm">/Monat</span>
            </div>
            <div className="bg-cc-50 rounded-xl p-3 mb-6 text-sm text-cc-800 font-medium">
              ✨ {ccEco.highlight}
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-surface-700">
                <Check className="w-4 h-4 text-cc-500 flex-shrink-0 mt-0.5" />
                Registrierung kostenlos
              </li>
              <li className="flex items-start gap-2 text-sm text-surface-700">
                <Check className="w-4 h-4 text-cc-500 flex-shrink-0 mt-0.5" />
                {ccEco.included_hours} Stunden Zeitguthaben ({ccEco.included_hours_validity_months} Monate gültig)
              </li>
              <li className="flex items-start gap-2 text-sm text-surface-700">
                <Check className="w-4 h-4 text-cc-500 flex-shrink-0 mt-0.5" />
                Buchungsgebühr nur 1,50 € pro Fahrt
              </li>
              <li className="flex items-start gap-2 text-sm text-surface-700">
                <Check className="w-4 h-4 text-cc-500 flex-shrink-0 mt-0.5" />
                Günstigerer km-Preis ab 101 km
              </li>
              <li className="flex items-start gap-2 text-sm text-surface-700">
                <Check className="w-4 h-4 text-cc-500 flex-shrink-0 mt-0.5" />
                {ccEco.cancellation}
              </li>
            </ul>
            <a
              href="https://cc.evemo.app/admin/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-xl bg-cc-600 text-white font-semibold hover:bg-cc-700 transition-colors"
            >
              Jetzt mit CC eco starten
            </a>
          </div>

          {/* CC go card */}
          <div className="rounded-2xl border-2 border-surface-200 bg-white p-6 sm:p-8">
            <div className="mb-4">
              <h3 className="text-2xl font-bold font-display text-surface-900">{ccGo.name}</h3>
              <p className="text-sm text-surface-500 font-body">{ccGo.subtitle}</p>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold font-display text-surface-700">{ccGo.monthly_fee_display}</span>
              <span className="text-surface-500 text-sm">/Monat</span>
            </div>
            <div className="bg-surface-50 rounded-xl p-3 mb-6 text-sm text-surface-600 font-medium">
              💡 {ccGo.highlight}
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-surface-700">
                <Check className="w-4 h-4 text-surface-400 flex-shrink-0 mt-0.5" />
                Registrierungsgebühr: {fmt(ccGo.registration_fee)} € (einmalig)
              </li>
              <li className="flex items-start gap-2 text-sm text-surface-700">
                <Check className="w-4 h-4 text-surface-400 flex-shrink-0 mt-0.5" />
                Buchungsgebühr 2,50 € pro Fahrt
              </li>
              <li className="flex items-start gap-2 text-sm text-surface-700">
                <Check className="w-4 h-4 text-surface-400 flex-shrink-0 mt-0.5" />
                {ccGo.cancellation}
              </li>
              <li className="flex items-start gap-2 text-sm text-surface-700">
                <Check className="w-4 h-4 text-surface-400 flex-shrink-0 mt-0.5" />
                Tarifwechsel jederzeit möglich
              </li>
            </ul>
            <a
              href="https://cc.evemo.app/admin/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-xl border-2 border-cc-500 text-cc-700 font-semibold hover:bg-cc-50 transition-colors"
            >
              CC go ausprobieren
            </a>
          </div>
        </div>

        {/* Included in price */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 mb-16 shadow-warm-sm">
          <h3 className="font-bold font-display text-cc-900 text-lg mb-4">Im Preis enthalten</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {included_in_price.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-surface-700">
                <Check className="w-4 h-4 text-cc-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Section B: Fahrzeugklassen & Preise ═══ */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold font-display text-cc-900 mb-2 text-center">
            Fahrzeugklassen & Preise
          </h3>
          <p className="text-surface-500 font-body text-center mb-8 max-w-xl mx-auto">
            Abrechnung pro Fahrt: Buchungsgebühr + Zeitgebühr + Kilometergebühr. Strom und Kraftstoff inklusive.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {vehicle_classes.map(v => (
              <div key={v.id} className="bg-white rounded-2xl border border-surface-200 p-5 shadow-warm-sm hover:shadow-warm-md transition-shadow">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h4 className="font-bold font-display text-surface-900 text-lg">{v.name}</h4>
                <p className="text-xs text-surface-500 mb-4">{v.description}</p>

                {/* Zeitgebühr */}
                <div className="space-y-2 text-sm mb-3">
                  <div className="text-xs font-semibold text-surface-400 uppercase tracking-wide">Zeitgebühr</div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">CC eco</span>
                    <span className="font-semibold text-cc-700">{fmt(v.hourly_rate_eco)} €/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">CC go</span>
                    <span className="font-semibold text-surface-700">{fmt(v.hourly_rate_go)} €/h</span>
                  </div>
                </div>

                {/* Kilometergebühr */}
                <div className="space-y-2 text-sm mb-3 border-t border-surface-100 pt-3">
                  <div className="text-xs font-semibold text-surface-400 uppercase tracking-wide">Kilometergebühr</div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">CC eco (1–100 km)</span>
                    <span className="font-semibold text-cc-700">{fmt(v.km_rate_eco)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">CC eco (ab 101 km)</span>
                    <span className="font-semibold text-cc-700">{fmt(v.km_rate_eco_above_100)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">CC go</span>
                    <span className="font-semibold text-surface-700">{fmt(v.km_rate_go)} €</span>
                  </div>
                </div>

                {/* Tagesgebühr + Buchung */}
                <div className="space-y-2 text-sm border-t border-surface-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-surface-500">Tagesgebühr eco</span>
                    <span className="font-semibold text-surface-700">{fmt(v.daily_rate_eco)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Tagesgebühr go</span>
                    <span className="font-semibold text-surface-700">{fmt(v.daily_rate_go)} €</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-surface-100">
                  <p className="text-xs text-surface-400">
                    {v.vehicles.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Booking fee + early return info */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-cc-50 rounded-xl p-4 text-center">
              <div className="font-bold text-cc-700">Buchungsgebühr</div>
              <p className="text-surface-600">CC eco: 1,50 € · CC go: 2,50 €</p>
            </div>
            <div className="bg-cc-50 rounded-xl p-4 text-center">
              <div className="font-bold text-cc-700">Frührückgabe-Rabatt</div>
              <p className="text-surface-600">50 % auf nicht genutzte, gebuchte Zeit</p>
            </div>
            <div className="bg-cc-50 rounded-xl p-4 text-center">
              <div className="font-bold text-cc-700">Max. Buchungszeit</div>
              <p className="text-surface-600">24 Stunden pro Buchung</p>
            </div>
          </div>
        </div>

        {/* ═══ Section C: Kostenbeispiele ═══ */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold font-display text-cc-900 mb-2 text-center">
            Kostenbeispiele
          </h3>
          <p className="text-surface-500 font-body text-center mb-8">
            So viel kosten typische Fahrten mit CC (Einzelfahrt inkl. Buchungsgebühr).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cost_examples.map((ex, i) => {
              const calc = calcExample(ex)
              return (
                <div key={i} className="bg-white rounded-2xl border border-surface-200 p-5 shadow-warm-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{ex.icon}</span>
                    <div>
                      <h4 className="font-bold text-surface-900">{ex.label}</h4>
                      <p className="text-xs text-surface-500">{ex.description}</p>
                    </div>
                  </div>
                  <div className="text-xs text-surface-400 mb-3">
                    {calc.vehicleName} · {ex.hours} Std. · {ex.km} km
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-cc-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-cc-600 font-medium mb-1">CC eco</div>
                      <div className="text-lg font-bold font-display text-cc-700">{fmt(calc.eco)} €</div>
                    </div>
                    <div className="bg-surface-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-surface-500 font-medium mb-1">CC go</div>
                      <div className="text-lg font-bold font-display text-surface-700">{fmt(calc.go)} €</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ Section D: Tarifberater ═══ */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold font-display text-cc-900 mb-2 text-center">
            Tarifberater
          </h3>
          <p className="text-surface-500 font-body text-center mb-8">
            Welcher Tarif passt zu dir? Stell dein Nutzungsverhalten ein.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="bg-cc-50 rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Vehicle class selector */}
              <div>
                <label className="text-sm font-medium text-surface-700 block mb-2">Fahrzeugklasse</label>
                <div className="grid grid-cols-3 gap-2">
                  {vehicle_classes.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedClass(v.id)}
                      className={`p-3 rounded-xl text-left text-sm transition-all ${
                        selectedClass === v.id
                          ? 'bg-cc-600 text-white shadow-warm-sm'
                          : 'bg-white text-surface-700 hover:bg-cc-100 border border-surface-200'
                      }`}
                    >
                      <span className="text-lg block mb-1">{v.icon}</span>
                      <span className="font-medium">{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-surface-700">Stunden pro Monat</label>
                  <span className="text-sm font-bold text-cc-700 bg-white px-2 py-0.5 rounded">{hours} Std.</span>
                </div>
                <input
                  type="range" min={1} max={30} value={hours}
                  onChange={e => setHours(Number(e.target.value))}
                  className="w-full accent-cc-600"
                />
                <div className="flex justify-between text-xs text-surface-400">
                  <span>1 Std.</span><span>30 Std.</span>
                </div>
              </div>

              {/* KM slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-surface-700">Kilometer pro Monat</label>
                  <span className="text-sm font-bold text-cc-700 bg-white px-2 py-0.5 rounded">{km} km</span>
                </div>
                <input
                  type="range" min={10} max={500} step={10} value={km}
                  onChange={e => setKm(Number(e.target.value))}
                  className="w-full accent-cc-600"
                />
                <div className="flex justify-between text-xs text-surface-400">
                  <span>10 km</span><span>500 km</span>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="space-y-4">
              {/* Recommendation banner */}
              <div className={`rounded-2xl p-5 text-white ${recommended === 'cc-eco' ? 'bg-cc-600' : 'bg-cc-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold text-lg">
                    Empfehlung: {recommended === 'cc-eco' ? 'CC eco' : 'CC go'}
                  </span>
                </div>
                <p className="text-cc-100 text-sm">
                  {recommended === 'cc-eco'
                    ? 'Mit den 5 Inklusivstunden und niedrigeren Preisen sparst du.'
                    : 'Ohne Grundgebühr zahlst du nur, was du wirklich fährst.'}
                </p>
              </div>

              {/* CC eco result */}
              <div className={`rounded-xl border-2 p-5 transition-all ${
                recommended === 'cc-eco' ? 'border-cc-500 bg-cc-50 shadow-warm-md' : 'border-surface-200 bg-white'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-surface-900">CC eco</h4>
                    <p className="text-xs text-surface-500">19 €/Monat + Nutzung</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-display text-cc-700">{fmt(ecoCost)} €</span>
                    <p className="text-xs text-surface-500">/Monat</p>
                  </div>
                </div>
                <div className="text-xs text-surface-400 space-y-0.5">
                  <div>19,00 € Grundgebühr + {fmt(vc.booking_fee_eco)} € Buchung</div>
                  <div>+ {Math.max(0, hours - ccEco.included_hours)} h × {fmt(vc.hourly_rate_eco)} € (nach {ccEco.included_hours}h Guthaben)</div>
                  <div>+ {km <= 100
                    ? `${km} km × ${fmt(vc.km_rate_eco)} €`
                    : `100 km × ${fmt(vc.km_rate_eco)} € + ${km - 100} km × ${fmt(vc.km_rate_eco_above_100)} €`
                  }</div>
                </div>
              </div>

              {/* CC go result */}
              <div className={`rounded-xl border-2 p-5 transition-all ${
                recommended === 'cc-go' ? 'border-cc-500 bg-cc-50 shadow-warm-md' : 'border-surface-200 bg-white'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-surface-900">CC go</h4>
                    <p className="text-xs text-surface-500">Keine Grundgebühr</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-display text-surface-700">{fmt(goCost)} €</span>
                    <p className="text-xs text-surface-500">/Monat</p>
                  </div>
                </div>
                <div className="text-xs text-surface-400">
                  {fmt(vc.booking_fee_go)} € Buchung + {hours} h × {fmt(vc.hourly_rate_go)} € + {km} km × {fmt(vc.km_rate_go)} €
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
        </div>

        {/* ═══ Section E: FAQ ═══ */}
        <div>
          <h3 className="text-2xl font-bold font-display text-cc-900 mb-2 text-center">
            Häufige Fragen zu unseren Tarifen
          </h3>
          <p className="text-surface-500 font-body text-center mb-8">
            Die wichtigsten Antworten auf einen Blick.
          </p>

          <div className="max-w-3xl mx-auto space-y-2">
            {faq_tariff.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-50 transition-colors"
                >
                  <span className="font-medium text-surface-800 text-sm pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-surface-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-surface-600 border-t border-surface-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
