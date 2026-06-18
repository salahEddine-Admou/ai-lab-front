export default function StandLayout({ children, stepLabel }) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-black">
      <header className="border-b border-neutral-800 bg-neutral-950/90">
        <div className="page-container flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Orange Digital Center · AI LABS
            </p>
            <h1 className="text-lg font-bold text-white sm:text-xl">
              AI RH <span className="text-neutral-500">— Parcours stand</span>
            </h1>
          </div>
          {stepLabel && (
            <p className="text-sm text-neutral-400">{stepLabel}</p>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
