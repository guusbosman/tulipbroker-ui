import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TulipIcon } from "../components/TulipIcon";
import { useMarketPulse } from "../hooks/useMarketPulse";

const TOOLTIP_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

const DEFAULT_POINTS = [
  { ts: "2025-11-09T02:00:00Z", avgPrice: 120, buyOrders: 4, sellOrders: 1 },
  { ts: "2025-11-09T02:05:00Z", avgPrice: 124, buyOrders: 6, sellOrders: 2 },
  { ts: "2025-11-09T02:10:00Z", avgPrice: 122, buyOrders: 3, sellOrders: 3 },
  { ts: "2025-11-09T02:15:00Z", avgPrice: 128, buyOrders: 5, sellOrders: 1 },
  { ts: "2025-11-09T02:20:00Z", avgPrice: 134, buyOrders: 7, sellOrders: 2 },
];

const FALLBACK_STATS = {
  lastPrice: 134,
  buyShare: 0.7,
  sellShare: 0.3,
  ordersSampled: 25,
};

export function OverviewScreen() {
  const { points, stats, status, error, sentiment, refresh } = useMarketPulse();
  const chartData = (points.length ? points : DEFAULT_POINTS).map((point, idx) => ({
    ...point,
    label: TOOLTIP_FORMATTER.format(new Date(point.ts)),
    markerVariant: idx % 2 === 0 ? "green" : "red",
  }));
  const resolvedStats = stats ?? FALLBACK_STATS;
  const tickerCards = [
    {
      label: "Last price",
      value: `$${resolvedStats.lastPrice?.toFixed(2) ?? "--"}`,
      sub: "Tulip synthetic index",
    },
    {
      label: "Buy share",
      value: `${Math.round((resolvedStats.buyShare ?? 0) * 100)}%`,
      sub: "Sentiment · buys / total",
    },
    {
      label: "Sample size",
      value: resolvedStats.ordersSampled ?? 0,
      sub: "Orders in rolling window",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr] h-full">
      <section className="bg-cream text-navy-900 rounded-panel shadow-card p-6 flex flex-col">
        <header className="flex items-center justify-between pb-4 border-b border-slate-500/30">
          <div>
            <h2 className="font-display text-2xl tracking-wide uppercase">
              Tulip Market Pulse
            </h2>
            <p className="text-sm text-slate-700">
              Live tulip derivative index ·{" "}
              {status === "ready" ? "Updated moments ago" : "Syncing…"}
            </p>
          </div>
          <div className="h-16 w-16 rounded-full bg-navy-900/5 flex items-center justify-center">
            <TulipIcon className="h-12 w-12" />
          </div>
        </header>
        <div className="mt-6 flex-1 rounded-2xl border border-slate-500/40 bg-[linear-gradient(90deg,rgba(19,51,90,0.1)_1px,transparent_1px),linear-gradient(0deg,rgba(19,51,90,0.1)_1px,transparent_1px)] bg-[length:36px_36px] p-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <ResponsiveContainer>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5bc489" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#5bc489" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(12,34,63,0.15)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="price"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  labelFormatter={(label) => label}
                  formatter={(value, name) => [
                    typeof value === "number" ? value.toFixed(2) : value,
                    name,
                  ]}
                  contentStyle={{
                    background: "#0d223f",
                    border: "none",
                    borderRadius: "12px",
                    color: "#f6f1e4",
                  }}
                />
                <Bar
                  yAxisId="volume"
                  dataKey="buyOrders"
                  fill="rgba(91,196,137,0.4)"
                  barSize={10}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="volume"
                  dataKey="sellOrders"
                  fill="rgba(255,107,107,0.3)"
                  barSize={10}
                  radius={[4, 4, 0, 0]}
                />
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="#1c4a78"
                  strokeWidth={3}
                  fill="url(#priceGradient)"
                  dot={({ cx, cy, payload }) =>
                    cx && cy ? (
                      <g transform={`translate(${cx - 12}, ${cy - 12})`}>
                        <TulipIcon
                          className="h-6 w-6"
                          variant={payload.buyOrders >= payload.sellOrders ? "green" : "red"}
                        />
                      </g>
                    ) : null
                  }
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="relative grid gap-4 text-sm text-slate-700">
            <div className="inline-flex items-center gap-2 rounded-full bg-navy-900/10 px-4 py-1 font-medium w-max uppercase tracking-wider text-xs text-navy-800">
              {sentiment !== null ? `Buy sentiment · ${sentiment}%` : "Market pulse"}
            </div>
            {error ? (
              <p className="text-tulip-red text-sm uppercase tracking-[0.3em]">
                {error}
              </p>
            ) : (
              <p className="max-w-md leading-relaxed">
                Watching liquidity across the Tulip futures desk and matching engine
                health in real time.{" "}
                <button
                  type="button"
                  className="text-navy-800 underline-offset-2 underline"
                  onClick={refresh}
                >
                  Refresh
                </button>
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {tickerCards.map((card) => (
            <article
              key={card.label}
              className="rounded-3xl bg-navy-900/10 p-4 border border-slate-500/30"
            >
              <h3 className="font-display text-sm uppercase tracking-wider text-navy-800">
                {card.label}
              </h3>
              <p className="mt-2 text-2xl font-display">{card.value}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-600">
                {card.sub}
              </p>
            </article>
          ))}
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <div className="rounded-panel bg-navy-800 text-cream shadow-card border border-navy-700 px-5 py-6">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Watchlist
          </h3>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-navy-900/60 px-4 py-3">
              <div>
                <p className="text-xs text-cream/70 uppercase tracking-[0.4em]">
                  Sentiment
                </p>
                <p className="font-display text-xl">
                  {sentiment !== null ? `${sentiment}% BUY` : "--"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-cream/70 uppercase tracking-[0.4em]">
                  Orders
                </p>
                <p className="font-display text-xl">
                  {resolvedStats.ordersSampled ?? "--"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-navy-900/60 px-4 py-3">
              <p className="text-xs text-cream/70 uppercase tracking-[0.4em] mb-2">
                Market health
              </p>
              <div className="flex items-center justify-between text-sm">
                <span>Matching Engine</span>
                <span className="text-tulip-green font-semibold">Healthy</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span>Latency p95</span>
                <span className="text-accent-yellow font-semibold">218ms</span>
              </div>
            </div>
          </div>
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
