import { TulipIcon } from "../components/TulipIcon";

export function MarketDetailScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr] h-full">
      <section className="rounded-panel bg-cream text-navy-900 shadow-card p-6 space-y-6">
        <header className="flex items-center justify-between border-b border-slate-500/30 pb-4">
          <div>
            <button
              type="button"
              className="text-xs uppercase tracking-widest text-slate-600 hover:text-navy-900"
            >
              ← Back to Overview
            </button>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-wide">
              Tulip Growth (TLIP)
            </h2>
            <p className="text-sm text-slate-700">
              Watching bloom momentum & market depth.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full bg-navy-900/10 px-4 py-2 text-sm font-semibold uppercase tracking-widest">
            Market bloom index <span className="text-tulip-green">74</span>
          </div>
        </header>

        <div className="rounded-3xl border border-slate-500/30 bg-white/80 p-4">
          <div className="h-64 rounded-2xl bg-[linear-gradient(90deg,rgba(19,51,90,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(19,51,90,0.08)_1px,transparent_1px)] bg-[length:40px_40px] relative overflow-hidden">
            <svg viewBox="0 0 480 240" className="absolute inset-0 h-full w-full">
              <polyline
                fill="rgba(91,196,137,0.2)"
                stroke="#5bc489"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="10,200 80,150 140,130 200,160 260,120 320,90 380,110 440,60 470,80 470,240 10,240"
              />
              <g>
                {[
                  { x: 80, y: 150 },
                  { x: 200, y: 160 },
                  { x: 320, y: 90 },
                  { x: 440, y: 60 },
                ].map((point, idx) => (
                  <g
                    key={`${point.x}-${point.y}`}
                    transform={`translate(${point.x - 24}, ${point.y - 24})`}
                  >
                    <TulipIcon
                      className="h-12 w-12"
                      variant={idx % 2 === 0 ? "green" : "red"}
                    />
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 text-sm">
          {[
            { label: "Last price", value: "fl 124.20", tone: "green" },
            { label: "24h change", value: "+4.2%", tone: "green" },
            { label: "Volume", value: "12.8k lots", tone: "neutral" },
          ].map((metric) => (
            <article
              key={metric.label}
              className="rounded-3xl border border-slate-500/30 bg-white/70 px-4 py-4"
            >
              <p className="text-xs uppercase tracking-widest text-slate-600">
                {metric.label}
              </p>
              <p
                className={`mt-2 font-display text-xl ${
                  metric.tone === "green"
                    ? "text-tulip-green"
                    : metric.tone === "red"
                    ? "text-tulip-red"
                    : "text-navy-900"
                }`}
              >
                {metric.value}
              </p>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-panel bg-navy-800 text-cream border border-navy-700 shadow-card p-6 space-y-4">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Bid / Ask depth
          </h3>
          <div className="grid gap-3 text-sm">
            {[
              { side: "Bid", level: "fl 123.90", size: "24", width: "70%" },
              { side: "Bid", level: "fl 123.70", size: "18", width: "50%" },
              { side: "Ask", level: "fl 124.40", size: "20", width: "60%" },
              { side: "Ask", level: "fl 124.70", size: "16", width: "40%" },
            ].map((row, idx) => (
              <div key={idx} className="grid gap-2">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-cream/70">
                  <span>{row.side}</span>
                  <span>{row.level}</span>
                </div>
                <div className="h-4 rounded-full bg-navy-900/60 overflow-hidden">
                  <div
                    className={`h-full ${
                      row.side === "Bid" ? "bg-tulip-green" : "bg-tulip-red"
                    }`}
                    style={{ width: row.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-panel bg-cream text-navy-900 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg uppercase tracking-wide">
              Analytics
            </h3>
            <button
              type="button"
              className="rounded-full border border-navy-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-navy-800 hover:bg-navy-800 hover:text-cream transition"
            >
              Add to watchlist
            </button>
          </div>
          <div className="space-y-3 text-sm">
            {[
              {
                label: "Liquidity bloom",
                desc: "Order book depth strong at 3 ticks.",
              },
              {
                label: "Momentum",
                desc: "Uptrend forming · 6 consecutive green candles.",
              },
              {
                label: "Risk note",
                desc: "Monitor spreads · volatility rising post-auction.",
              },
            ].map((fact) => (
              <article
                key={fact.label}
                className="rounded-3xl border border-slate-500/30 bg-white/80 px-4 py-3"
              >
                <h4 className="text-xs uppercase tracking-widest text-slate-600">
                  {fact.label}
                </h4>
                <p className="mt-1 text-slate-700">{fact.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
