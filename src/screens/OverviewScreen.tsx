import { TulipIcon } from "../components/TulipIcon";

const TICKERS = [
  { symbol: "TLIP", price: 124, change: "+3.4%" },
  { symbol: "BLOM", price: 98, change: "-1.8%" },
  { symbol: "STEM", price: 142, change: "+5.6%" },
];

const CALLOUTS = [
  { title: "Best performer today", body: "TLIP up 5.6% · Volume trending green" },
  { title: "Market sentiment", body: "Optimistic · 68% buy orders this hour" },
  { title: "Your top holding", body: "Tulip Growth Fund · 42% of portfolio" },
];

export function OverviewScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr] h-full">
      <section className="bg-cream text-navy-900 rounded-panel shadow-card p-6 flex flex-col">
        <header className="flex items-center justify-between pb-4 border-b border-slate-500/30">
          <div>
            <h2 className="font-display text-2xl tracking-wide uppercase">
              Tulip Market Pulse
            </h2>
            <p className="text-sm text-slate-700">
              Live tulip derivative index · Updated moments ago
            </p>
          </div>
          <div className="h-16 w-16 rounded-full bg-navy-900/5 flex items-center justify-center">
            <TulipIcon className="h-12 w-12" />
          </div>
        </header>
        <div className="mt-6 flex-1 rounded-2xl border border-slate-500/40 bg-[linear-gradient(90deg,rgba(19,51,90,0.1)_1px,transparent_1px),linear-gradient(0deg,rgba(19,51,90,0.1)_1px,transparent_1px)] bg-[length:36px_36px] p-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 400 220" className="h-full w-full">
              <polyline
                fill="none"
                stroke="#1c4a78"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="12,190 78,160 120,174 180,120 236,156 292,96 348,60"
                className="opacity-60"
              />
              <polyline
                fill="none"
                stroke="#5bc489"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="12,180 80,150 140,132 200,100 260,130 320,70 380,40"
              />
              <g>
                {[
                  { x: 60, y: 150 },
                  { x: 120, y: 120 },
                  { x: 180, y: 106 },
                  { x: 240, y: 80 },
                  { x: 300, y: 96 },
                  { x: 360, y: 60 },
                ].map((point, idx) => (
                  <g
                    key={`${point.x}-${point.y}`}
                    transform={`translate(${point.x - 24}, ${point.y - 24})`}
                  >
                    <TulipIcon
                      className="h-12 w-12"
                      variant={idx % 2 === 0 ? "red" : "green"}
                    />
                  </g>
                ))}
              </g>
            </svg>
          </div>
          <div className="relative grid gap-4 text-sm text-slate-700">
            <div className="inline-flex items-center gap-2 rounded-full bg-navy-900/10 px-4 py-1 font-medium w-max uppercase tracking-wider text-xs text-navy-800">
              Tulip stocks rally
            </div>
            <p className="max-w-md leading-relaxed">
              Growth tulips hitting seasonal highs. Watching liquidity across
              the tulip futures desk and matching engine health.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {CALLOUTS.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl bg-navy-900/10 p-4 border border-slate-500/30"
            >
              <h3 className="font-display text-sm uppercase tracking-wider text-navy-800">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-slate-700">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <div className="rounded-panel bg-navy-800 text-cream shadow-card border border-navy-700 px-5 py-6">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Watchlist
          </h3>
          <ul className="mt-5 space-y-4">
            {TICKERS.map((ticker) => (
              <li
                key={ticker.symbol}
                className="flex items-center justify-between rounded-2xl bg-navy-900/60 px-4 py-3"
              >
                <div>
                  <p className="font-display text-base tracking-wide">
                    {ticker.symbol}
                  </p>
                  <p className="text-xs text-cream/70">Spot · Tulip Exchange</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl">${ticker.price}</p>
                  <p
                    className={`text-sm font-medium ${
                      ticker.change.startsWith("-")
                        ? "text-tulip-red"
                        : "text-tulip-green"
                    }`}
                  >
                    {ticker.change}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-panel bg-navy-800 text-cream shadow-card border border-navy-700 px-5 py-6 space-y-4">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Market Indicators
          </h3>
          <div className="space-y-3">
            {[
              { label: "Matching Engine", status: "Optimal", level: "green" },
              { label: "Latency p95", status: "218ms", level: "yellow" },
              { label: "Order Throughput", status: "1.8k/s", level: "green" },
            ].map((metric) => (
              <div
                key={metric.label}
                className="flex items-center justify-between rounded-2xl bg-navy-900/60 px-4 py-3"
              >
                <span className="text-sm text-cream/80">{metric.label}</span>
                <span
                  className={`font-semibold ${
                    metric.level === "green"
                      ? "text-tulip-green"
                      : "text-accent-yellow"
                  }`}
                >
                  {metric.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
