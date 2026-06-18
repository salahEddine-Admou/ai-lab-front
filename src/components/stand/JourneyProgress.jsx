const STEPS = [
  { id: 'welcome', label: 'Accueil' },
  { id: 'profile', label: 'Profil' },
  { id: 'cv', label: 'CV' },
  { id: 'offers', label: 'Offres' },
  { id: 'interview', label: 'Entretien' },
  { id: 'report', label: 'Rapport' },
];

const STEP_INDEX = {
  welcome: 0,
  profile: 1,
  cv: 2,
  'cv-result': 2,
  offers: 3,
  'interview-intro': 4,
  interview: 4,
  report: 5,
  done: 5,
};

export default function JourneyProgress({ currentStep }) {
  const active = STEP_INDEX[currentStep] ?? 0;

  return (
    <nav className="mb-8 border border-neutral-800 bg-neutral-950/60 p-3 sm:p-4" aria-label="Étapes du parcours">
      <ol className="flex flex-wrap gap-2 sm:gap-0 sm:justify-between">
        {STEPS.map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li
              key={step.id}
              className={`flex items-center gap-2 text-xs sm:text-sm ${
                current ? 'text-orange-400 font-semibold' : done ? 'text-neutral-400' : 'text-neutral-600'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center border text-xs font-bold ${
                  current
                    ? 'border-orange-500 bg-orange-500 text-black'
                    : done
                      ? 'border-orange-500/40 bg-orange-500/10 text-orange-300'
                      : 'border-neutral-700 bg-black text-neutral-500'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
