import { TulipIcon } from "../components/TulipIcon";

export function SettingsScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr] h-full">
      <section className="rounded-panel bg-cream text-navy-900 shadow-card p-6 space-y-6">
        <header className="border-b border-slate-500/30 pb-4">
          <h2 className="font-display text-2xl uppercase tracking-wide">
            TulipBroker Studio
          </h2>
          <p className="text-sm text-slate-700">
            Tune the experience and browse trading lore.
          </p>
        </header>

        <div className="grid gap-4 rounded-3xl border border-slate-500/30 bg-white/80 px-5 py-5 md:grid-cols-[auto,1fr] md:items-center">
          <div className="h-20 w-20 rounded-full bg-navy-900/10 flex items-center justify-center">
            <TulipIcon className="h-12 w-12" />
          </div>
          <div>
            <p className="font-semibold text-lg">Alex Trader</p>
            <p className="text-sm text-slate-700">Region: EU-West · Multi-AZ</p>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Theme palette
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              {
                name: "Classic Bloom",
                colors: ["#0d223f", "#f6f1e4", "#ff6b6b", "#5bc489"],
                active: true,
              },
              {
                name: "Midnight Garden",
                colors: ["#08162c", "#e1e3f0", "#ff8c8c", "#3fb7c2"],
                active: false,
              },
            ].map((palette) => (
              <button
                key={palette.name}
                type="button"
                className={`rounded-3xl border-4 px-5 py-4 text-left transition ${
                  palette.active
                    ? "border-tulip-green bg-navy-900/10"
                    : "border-transparent bg-navy-900/5 hover:border-navy-800/40"
                }`}
              >
                <p className="font-semibold text-sm uppercase tracking-widest">
                  {palette.name}
                </p>
                <div className="mt-3 flex gap-2">
                  {palette.colors.map((color) => (
                    <span
                      key={color}
                      className="h-8 w-8 rounded-full border border-black/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "How trading works",
              body: "Walk through the matching engine flow and TulipBroker guarantees.",
            },
            {
              title: "What is a double fill?",
              body: "Understand invariants and how the system protects client orders.",
            },
          ].map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-slate-500/30 bg-white/70 px-5 py-5"
            >
              <h4 className="font-display text-sm uppercase tracking-widest text-navy-800">
                {card.title}
              </h4>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                {card.body}
              </p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-navy-800 hover:text-tulip-green"
              >
                View tutorial →
              </button>
            </article>
          ))}
        </section>
      </section>

      <aside className="space-y-4">
        <section className="rounded-panel bg-navy-800 text-cream border border-navy-700 shadow-card p-6 space-y-4">
          <h3 className="font-display text-lg uppercase tracking-wide">
            System health
          </h3>
          <div className="space-y-3">
            {[
              { region: "us-east-1", status: "green" },
              { region: "eu-west-1", status: "green" },
              { region: "ap-southeast-1", status: "yellow" },
            ].map((item) => (
              <div
                key={item.region}
                className="flex items-center justify-between rounded-2xl bg-navy-900/60 px-4 py-3 text-sm"
              >
                <span className="uppercase tracking-widest text-cream/70">
                  {item.region}
                </span>
                <span
                  className={`h-3 w-3 rounded-full ${
                    item.status === "green"
                      ? "bg-tulip-green"
                      : item.status === "yellow"
                      ? "bg-accent-yellow"
                      : "bg-tulip-red"
                  }`}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-panel bg-cream text-navy-900 shadow-card p-6 space-y-3">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Chat prompt
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            Use the “Tulip-Style UI” prompt to generate illustration-ready
            layouts for design explorations and onboarding content.
          </p>
          <div className="rounded-3xl border border-slate-500/30 bg-white/70 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-600">
            TulipBroker Tulip-Style UI — Full Screen Set
          </div>
        </section>
      </aside>
    </div>
  );
}
