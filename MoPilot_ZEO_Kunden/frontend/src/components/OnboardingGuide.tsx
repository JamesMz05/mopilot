'use client'
import { useState } from 'react'
import { UserPlus, ShieldCheck, Smartphone, MapPin, Key, RotateCcw, ChevronDown, ExternalLink, BookOpen } from 'lucide-react'
import faqData from '@/data/faq.json'

const STEPS = [
  {
    number: 1,
    icon: <UserPlus className="w-6 h-6" />,
    title: 'Registrierung',
    description: 'Erstellen Sie Ihr kostenloses ZEO-Konto auf zeo-carsharing.de. Wählen Sie Ihren Tarif (eco oder eco plus) und geben Sie Ihre persönlichen Daten ein.',
    link: { label: 'Zur Registrierung', href: 'https://www.zeo-carsharing.de/registrierung' },
    detail: 'Sie benötigen: E-Mail-Adresse, Wohnanschrift, Zahlungsmittel (SEPA-Lastschrift)',
  },
  {
    number: 2,
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Führerschein & Identität verifizieren',
    description: 'Laden Sie ein Foto Ihres Führerscheins und Personalausweises hoch. Die Prüfung erfolgt in der Regel innerhalb weniger Werktage.',
    link: null,
    detail: 'Ohne Verifikation ist keine Buchung möglich. Sie erhalten eine E-Mail-Bestätigung nach erfolgreicher Prüfung.',
  },
  {
    number: 3,
    icon: <Smartphone className="w-6 h-6" />,
    title: 'App herunterladen',
    description: 'Laden Sie die kostenlose App "mein zeo" aus dem App Store (iOS) oder Google Play Store (Android) herunter. Alternativ: ZEO-Card im Bürgerbüro für €7,90.',
    link: null,
    detail: 'Mit der App können Sie Fahrzeuge suchen, buchen und per Bluetooth direkt öffnen – ganz ohne Schlüssel.',
  },
  {
    number: 4,
    icon: <MapPin className="w-6 h-6" />,
    title: 'Station finden & Fahrzeug buchen',
    description: 'Wählen Sie in der App Ihre gewünschte ZEO-Station, sehen Sie verfügbare Fahrzeuge und buchen Sie für Ihren gewünschten Zeitraum.',
    link: null,
    detail: 'Spontanbuchungen und Vorausbuchungen bis zu mehrere Wochen im Voraus sind möglich.',
  },
  {
    number: 5,
    icon: <Key className="w-6 h-6" />,
    title: 'Fahrzeug öffnen & losfahren',
    description: 'Gehen Sie zur gebuchten Station. Öffnen Sie das Fahrzeug per App oder ZEO-Card. Der Fahrzeugschlüssel liegt im Inneren bereit.',
    link: null,
    detail: 'Prüfen Sie vor Fahrtantritt kurz den Fahrzeugzustand und melden Sie Schäden sofort über die App.',
  },
  {
    number: 6,
    icon: <RotateCcw className="w-6 h-6" />,
    title: 'Rückgabe & Abrechnung',
    description: 'Bringen Sie das Fahrzeug zur selben Station zurück, schließen Sie es per App, und stecken Sie es ans Ladekabel. Die Abrechnung erfolgt automatisch.',
    link: null,
    detail: 'Bitte hinterlassen Sie das Fahrzeug sauber und mit mindestens dem Ladestand bei Übernahme. Laden = fair play für alle!',
  },
]

function StepCard({ step, active, onClick }: {
  step: typeof STEPS[0]; active: boolean; onClick: () => void
}) {
  return (
    <div
      className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        active
          ? 'border-zeo-500 shadow-md bg-white'
          : 'border-gray-200 bg-white hover:border-zeo-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4 p-5">
        {/* Step number & icon */}
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
            active ? 'bg-zeo-600 text-white' : 'bg-zeo-100 text-zeo-600'
          }`}>
            {step.number}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={active ? 'text-zeo-600' : 'text-gray-400'}>{step.icon}</span>
            <h3 className="font-bold text-gray-900">{step.title}</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

          {active && (
            <div className="mt-3 space-y-2">
              <div className="bg-zeo-50 border border-zeo-200 rounded-lg p-3 text-xs text-zeo-800">
                💡 {step.detail}
              </div>
              {step.link && (
                <a
                  href={step.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zeo-600 hover:text-zeo-800 transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  {step.link.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Connector line (not on last) */}
      {step.number < STEPS.length && (
        <div className="absolute -bottom-3 left-[38px] w-0.5 h-6 bg-zeo-200 z-10" />
      )}
    </div>
  )
}

function FaqAccordion({ category, questions }: {
  category: string
  questions: { question: string; answer: string }[]
}) {
  return (
    <div className="mb-6">
      <h4 className="font-bold text-zeo-800 text-sm uppercase tracking-wider mb-3">{category}</h4>
      <div className="space-y-2">
        {questions.map((q, i) => (
          <details key={i} className="group rounded-xl border border-gray-200 overflow-hidden bg-white">
            <summary
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-zeo-50 transition-colors"
              onClick={e => {
                // handled by browser native details toggle
              }}
            >
              <span className="text-sm font-medium text-gray-800 pr-4">{q.question}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {q.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

export default function OnboardingGuide() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section id="onboarding" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-zeo-100 text-zeo-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Modul 5
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zeo-900 mb-2">
            So startest du mit ZEO
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            In 6 einfachen Schritten zum ersten E-Carsharing-Erlebnis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Steps */}
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <StepCard
                key={step.number}
                step={step}
                active={activeStep === i}
                onClick={() => setActiveStep(activeStep === i ? -1 : i)}
              />
            ))}

            {/* Final CTA */}
            <div className="bg-gradient-to-br from-zeo-600 to-zeo-800 rounded-2xl p-6 text-white mt-4">
              <h3 className="font-bold text-lg mb-2">Bereit für nachhaltiges Fahren?</h3>
              <p className="text-zeo-200 text-sm mb-4">
                Jetzt registrieren und die ersten 3 Monate €15 Startguthaben nutzen.
              </p>
              <a
                href="https://www.zeo-carsharing.de/registrierung"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-zeo-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-zeo-50 transition-colors"
              >
                Jetzt registrieren
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="font-bold text-zeo-900 text-xl mb-6">Häufige Fragen</h3>
            {faqData.map(cat => (
              <FaqAccordion
                key={cat.category}
                category={cat.category}
                questions={cat.questions}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
