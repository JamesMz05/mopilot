'use client'
import { useState } from 'react'
import { UserPlus, ShieldCheck, Smartphone, MapPin, Key, RotateCcw, ChevronDown, ExternalLink, BookOpen } from 'lucide-react'
import faqData from '@/data/faq.json'

const STEPS = [
  {
    number: 1,
    icon: <UserPlus className="w-6 h-6" />,
    title: 'Quiz machen (optional)',
    description: 'Mach das CarSharing-Quiz auf sharing-community.de/quiz und sichere dir Startguthaben für deine erste Fahrt!',
    link: { label: 'Zum Quiz', href: 'https://sharing-community.de/quiz' },
    detail: 'Das Quiz ist freiwillig, aber du bekommst Startguthaben als Belohnung.',
  },
  {
    number: 2,
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Registrierung auf evemo.app',
    description: 'Registriere dich kostenlos auf cc.evemo.app. Wähle deinen Tarif (CC eco oder CC go) und gib deine persönlichen Daten ein.',
    link: { label: 'Jetzt registrieren', href: 'https://cc.evemo.app/admin/signup' },
    detail: 'Du benötigst: E-Mail-Adresse, Wohnanschrift, Zahlungsmittel (SEPA-Lastschrift).',
  },
  {
    number: 3,
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Führerschein & Personalausweis nachweisen',
    description: 'Lade ein Foto deines Führerscheins und Personalausweises hoch. Die Prüfung erfolgt in der Regel schnell.',
    link: null,
    detail: 'Ohne Verifikation ist keine Buchung möglich. Du erhältst eine Bestätigung per E-Mail.',
  },
  {
    number: 4,
    icon: <MapPin className="w-6 h-6" />,
    title: 'Station finden & buchen',
    description: 'Finde deine nächste CC-Station auf evemo.app, sieh verfügbare Fahrzeuge und buche für deinen gewünschten Zeitraum.',
    link: null,
    detail: 'Spontanbuchungen und Vorausbuchungen sind möglich. Dein Dorfauto wartet max. 500 Schritte entfernt!',
  },
  {
    number: 5,
    icon: <Key className="w-6 h-6" />,
    title: 'Fahrzeug öffnen & losfahren',
    description: 'Gehe zur gebuchten Station. Öffne das Fahrzeug über evemo.app. Der Fahrzeugschlüssel liegt im Inneren bereit.',
    link: null,
    detail: 'Prüfe vor Fahrtantritt kurz den Fahrzeugzustand und melde Schäden sofort über die App.',
  },
  {
    number: 6,
    icon: <RotateCcw className="w-6 h-6" />,
    title: 'Rückgabe & Laden',
    description: 'Bringe das Fahrzeug zur selben Station zurück und stecke es ans Ladekabel. Die Abrechnung erfolgt automatisch über evemo.app.',
    link: null,
    detail: 'Bitte hinterlasse das Fahrzeug sauber und mit mindestens dem Ladestand bei Übernahme. Laden = fair play für alle!',
  },
]

function StepCard({ step, active, onClick }: {
  step: typeof STEPS[0]; active: boolean; onClick: () => void
}) {
  return (
    <div
      className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        active
          ? 'border-cc-500 shadow-md bg-white'
          : 'border-gray-200 bg-white hover:border-cc-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4 p-5">
        {/* Step number & icon */}
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
            active ? 'bg-cc-600 text-white' : 'bg-cc-100 text-cc-600'
          }`}>
            {step.number}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={active ? 'text-cc-600' : 'text-gray-400'}>{step.icon}</span>
            <h3 className="font-bold text-gray-900">{step.title}</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

          {active && (
            <div className="mt-3 space-y-2">
              <div className="bg-cc-50 border border-cc-200 rounded-lg p-3 text-xs text-cc-800">
                💡 {step.detail}
              </div>
              {step.link && (
                <a
                  href={step.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cc-600 hover:text-cc-800 transition-colors"
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
        <div className="absolute -bottom-3 left-[38px] w-0.5 h-6 bg-cc-200 z-10" />
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
      <h4 className="font-bold text-cc-800 text-sm uppercase tracking-wider mb-3">{category}</h4>
      <div className="space-y-2">
        {questions.map((q, i) => (
          <details key={i} className="group rounded-xl border border-gray-200 overflow-hidden bg-white">
            <summary
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-cc-50 transition-colors"
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
          <div className="inline-flex items-center gap-2 bg-cc-100 text-cc-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Modul 5
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-cc-900 mb-2">
            So startest du mit CC
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            In 6 einfachen Schritten zum ersten E-CarSharing-Erlebnis mit der Genossenschaft.
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
            <div className="bg-gradient-to-br from-cc-600 to-cc-800 rounded-2xl p-6 text-white mt-4">
              <h3 className="font-bold text-lg mb-2">Bereit für nachhaltiges Fahren?</h3>
              <p className="text-cc-200 text-sm mb-4">
                Jetzt registrieren und Teil der Car&RideSharing Community werden.
              </p>
              <a
                href="https://cc.evemo.app/admin/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-cc-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-cc-50 transition-colors"
              >
                Jetzt registrieren
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="font-bold text-cc-900 text-xl mb-6">Häufige Fragen</h3>
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
