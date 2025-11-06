const OPEN_ORDERS = [
  { id: "ORD-1345", side: "BUY", qty: 12, price: "123.40", status: "Open" },
  { id: "ORD-1346", side: "SELL", qty: 8, price: "98.20", status: "Partial" },
  { id: "ORD-1347", side: "BUY", qty: 5, price: "140.00", status: "Filled" },
];

const TRADE_TAPE = [
  { time: "12:45:06", side: "BUY", qty: 5, price: "123.40" },
  { time: "12:43:18", side: "SELL", qty: 10, price: "98.20" },
  { time: "12:41:52", side: "BUY", qty: 3, price: "140.00" },
];

export function OrdersScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr] h-full">
      <section className="rounded-panel bg-cream text-navy-900 shadow-card p-6 space-y-6">
        <header className="border-b border-slate-500/30 pb-4">
          <h2 className="font-display text-2xl uppercase tracking-wide">
            Tulip Order Pad
          </h2>
          <p className="text-sm text-slate-700">
            Simulate placing structured buy & sell orders.
          </p>
        </header>

        <form className="grid gap-4 rounded-3xl border border-slate-500/30 bg-white/80 px-5 py-5">
          <div className="flex gap-3">
            {["BUY", "SELL"].map((side) => (
              <button
                key={side}
                className={`flex-1 rounded-2xl px-4 py-3 font-display text-lg uppercase tracking-wide transition ${
                  side === "BUY"
                    ? "bg-tulip-green text-cream shadow-card"
                    : "bg-tulip-red text-cream shadow-card"
                }`}
                type="button"
              >
                {side}
              </button>
            ))}
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-700 uppercase tracking-wide">
            Price
            <input
              className="rounded-2xl border border-slate-500/40 bg-cream px-4 py-3 text-2xl font-semibold text-navy-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="123.45"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 uppercase tracking-wide">
            Quantity
            <input
              className="rounded-2xl border border-slate-500/40 bg-cream px-4 py-3 text-2xl font-semibold text-navy-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="10"
            />
          </label>
          <button
            type="button"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-cream font-semibold uppercase tracking-widest shadow-card"
          >
            <span role="img" aria-label="tulip">
              🌷
            </span>
            Submit Order
          </button>
        </form>

        <div className="space-y-3">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Open orders
          </h3>
          <div className="overflow-hidden rounded-3xl border border-slate-500/30 bg-white/90">
            <div className="grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] gap-2 bg-navy-900/10 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-600">
              <span>Order Id</span>
              <span>Side</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-slate-500/30 text-sm">
              {OPEN_ORDERS.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] gap-2 px-4 py-3 items-center"
                >
                  <span className="font-semibold">{order.id}</span>
                  <span
                    className={`font-semibold ${
                      order.side === "BUY" ? "text-tulip-green" : "text-tulip-red"
                    }`}
                  >
                    {order.side}
                  </span>
                  <span>{order.qty}</span>
                  <span>${order.price}</span>
                  <span className="flex items-center gap-2">
                    <span>{order.status}</span>
                    {order.status === "Open" && (
                      <span className="inline-flex h-2 w-2 rounded-full bg-tulip-green" />
                    )}
                    {order.status === "Partial" && (
                      <span className="inline-flex h-2 w-2 rounded-full bg-accent-yellow" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-panel bg-navy-800 text-cream border border-navy-700 shadow-card p-6 space-y-4">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Trade tape
          </h3>
          <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
            {TRADE_TAPE.map((trade) => (
              <article
                key={`${trade.time}-${trade.side}-${trade.qty}`}
                className="rounded-2xl bg-navy-900/60 px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-cream/60 uppercase tracking-widest">
                    {trade.time}
                  </p>
                  <p className="font-semibold">
                    {trade.side} {trade.qty} @ {trade.price}
                  </p>
                </div>
                <span
                  className={`h-3 w-3 rounded-full ${
                    trade.side === "BUY" ? "bg-tulip-green" : "bg-tulip-red"
                  }`}
                />
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-panel bg-cream text-navy-900 border border-slate-500/30 shadow-card p-6 space-y-3">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Alerts
          </h3>
          {[
            { label: "Order accepted", tone: "green" },
            { label: "Partial fill · monitoring", tone: "yellow" },
          ].map((alert) => (
            <div
              key={alert.label}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-widest ${
                alert.tone === "green"
                  ? "bg-tulip-green text-cream"
                  : "bg-accent-yellow text-navy-900"
              }`}
            >
              {alert.label}
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}
