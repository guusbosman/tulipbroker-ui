import { TulipIcon } from "../components/TulipIcon";

const HOLDINGS = [
  {
    name: "Tulip Growth",
    symbol: "TLIP",
    price: "ƒ124.20",
    qty: "120",
    value: "ƒ14,904",
    change: "+4.2%",
  },
  {
    name: "Bloom Futures",
    symbol: "BLOM",
    price: "ƒ98.10",
    qty: "60",
    value: "ƒ5,886",
    change: "-1.5%",
  },
  {
    name: "Stem Labs",
    symbol: "STEM",
    price: "ƒ142.00",
    qty: "40",
    value: "ƒ5,680",
    change: "+6.7%",
  },
];

export function PortfolioScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr] h-full">
      <section className="rounded-panel bg-cream text-navy-900 shadow-card p-6 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-500/30 pb-4">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wide">
              Portfolio Overview
            </h2>
            <p className="text-sm text-slate-700">
              Holdings performance across TulipBroker markets.
            </p>
          </div>
          <div className="rounded-full bg-navy-900/10 px-4 py-2 text-sm font-medium text-navy-800 flex items-center gap-2 uppercase tracking-wider">
            Total value <span className="text-2xl font-display">ƒ28,470</span>
          </div>
        </header>

        <div className="flex flex-wrap gap-3">
          {["All", "Gainers", "Losers"].map((label, index) => (
            <button
              key={label}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${
                index === 0
                  ? "bg-navy-900 text-cream shadow-card"
                  : "bg-navy-900/10 text-navy-800 hover:bg-navy-900/20"
              }`}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 text-sm">
          {HOLDINGS.map((holding) => (
            <article
              key={holding.symbol}
              className="grid gap-4 rounded-3xl border border-slate-500/30 bg-white/70 px-4 py-4 sm:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-navy-900/10 flex items-center justify-center">
                  <TulipIcon className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-semibold text-base">{holding.name}</p>
                  <p className="text-xs text-slate-700 uppercase tracking-wide">
                    {holding.symbol}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Price
                </p>
                <p className="font-semibold">{holding.price}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Quantity
                </p>
                <p className="font-semibold">{holding.qty}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Value
                </p>
                <p className="font-semibold">{holding.value}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Change
                </p>
                <p
                  className={`font-semibold ${
                    holding.change.startsWith("-")
                      ? "text-tulip-red"
                      : "text-tulip-green"
                  }`}
                >
                  {holding.change}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-panel bg-navy-800 text-cream border border-navy-700 shadow-card p-6 space-y-4">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Garden Summary
          </h3>
          <div className="rounded-3xl bg-navy-900/60 px-5 py-4">
            <p className="text-sm text-cream/70 uppercase tracking-wide">
              Daily change
            </p>
            <p className="mt-1 font-display text-3xl text-tulip-green">+3.8%</p>
            <p className="text-xs text-cream/60">
              Strong bloom across growth assets.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              { title: "Top performer", body: "Stem Labs · +6.7%" },
              { title: "Most volatile", body: "Bloom Futures · ±5.2%" },
            ].map((card) => (
              <article
                key={card.title}
                className="rounded-3xl border border-navy-700 bg-navy-900/40 px-4 py-4"
              >
                <h4 className="text-xs uppercase tracking-widest text-cream/60">
                  {card.title}
                </h4>
                <p className="mt-2 font-semibold text-sm">{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-panel bg-cream text-navy-900 shadow-card p-6">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Asset blooms
          </h3>
          <div className="mt-5 space-y-4">
            {HOLDINGS.map((holding) => (
              <div key={holding.symbol} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{holding.name}</span>
                  <span className="font-semibold text-tulip-green">
                    {holding.change}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-navy-900/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-tulip-pink to-tulip-green"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.abs(parseFloat(holding.change)) * 6
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
