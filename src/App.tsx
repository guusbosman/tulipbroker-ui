import { useMemo, useState, type ReactElement } from "react";
import { TulipIcon } from "./components/TulipIcon";
import { OverviewScreen } from "./screens/OverviewScreen";
import { PortfolioScreen } from "./screens/PortfolioScreen";
import { OrdersScreen } from "./screens/OrdersScreen";
import { MarketDetailScreen } from "./screens/MarketDetailScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { useApiConfig } from "./hooks/useApiConfig";

type ScreenKey =
  | "overview"
  | "portfolio"
  | "orders"
  | "market"
  | "settings";

const SCREENS: Record<
  ScreenKey,
  { label: string; subtitle: string; render: () => ReactElement }
> = {
  overview: {
    label: "Overview",
    subtitle: "Market dashboard",
    render: () => <OverviewScreen />,
  },
  portfolio: {
    label: "Portfolio",
    subtitle: "Holdings & performance",
    render: () => <PortfolioScreen />,
  },
  orders: {
    label: "Orders",
    subtitle: "Trading console",
    render: () => <OrdersScreen />,
  },
  market: {
    label: "Market Detail",
    subtitle: "Instrument deep dive",
    render: () => <MarketDetailScreen />,
  },
  settings: {
    label: "Settings",
    subtitle: "Personalize & learn",
    render: () => <SettingsScreen />,
  },
};

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const easternFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  dateStyle: "medium",
  timeStyle: "short",
});
const RELATIVE_DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

type RelativeTimestamp = { relative: string; title?: string };

function formatRelativeTimestamp(timestamp?: string): RelativeTimestamp | null {
  if (!timestamp) {
    return null;
  }

  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) {
    return { relative: timestamp };
  }

  let duration = (parsed - Date.now()) / 1000;
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      const relative = relativeFormatter.format(Math.round(duration), division.unit);
      return {
        relative,
        title: easternFormatter.format(new Date(parsed)),
      };
    }
    duration /= division.amount;
  }

  return {
    relative: new Date(parsed).toISOString(),
    title: easternFormatter.format(new Date(parsed)),
  };
}

function buildBadge(prefix: string, timestamp?: string, fallback?: string) {
  const formatted = formatRelativeTimestamp(timestamp);
  if (!formatted) {
    return { label: fallback ?? `${prefix} · local build`, title: undefined };
  }
  return {
    label: `${prefix} · built ${formatted.relative}`,
    title: formatted.title,
  };
}

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("overview");
  const {
    config: apiConfig,
    status: apiStatus,
    error: apiError,
  } = useApiConfig();
  const uiBuildTime =
    import.meta.env.VITE_UI_BUILD_TIME ??
    (import.meta.env.DEV ? new Date().toISOString() : undefined);
  const uiBuildBadge = buildBadge("UI", uiBuildTime, "UI · local build");
  const apiBuildBadge =
    apiStatus === "ready" && apiConfig?.buildTime
      ? buildBadge("API", apiConfig.buildTime, "API · build unknown")
      : null;
  const formatBadgeText = (badge: { label: string }) =>
    badge.label.replace(" · built", " build:");
  const combinedBadgeText =
    apiBuildBadge && uiBuildBadge
      ? `${formatBadgeText(apiBuildBadge)} // ${formatBadgeText(uiBuildBadge)}`
      : formatBadgeText(apiBuildBadge ?? uiBuildBadge);
  const combinedBadgeTitle = [apiBuildBadge?.title, uiBuildBadge.title].filter(Boolean).join(" | ") || undefined;

  const ActiveView = useMemo(() => SCREENS[activeScreen].render, [activeScreen]);

  const baseBadgeClasses =
    "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.35em] transition";
  let apiBadgeClasses = `${baseBadgeClasses} border-cream/40 bg-navy-900/40 text-cream/70`;
  let apiBadgeText = "API · checking…";

  if (apiStatus === "ready" && apiConfig) {
    apiBadgeClasses = `${baseBadgeClasses} border-cream bg-cream text-navy-800 shadow-card`;
    apiBadgeText = `API · ${apiConfig.env ?? "env"} · ${apiConfig.region ?? "region"} · v${
      apiConfig.version ?? "-"
    }`;
  } else if (apiStatus === "error") {
    apiBadgeClasses = `${baseBadgeClasses} border-tulip-red/70 bg-tulip-red/30 text-cream`;
    apiBadgeText = `API · unreachable${apiError ? ` · ${apiError}` : ""}`;
  }

  return (
    <div className="min-h-screen w-full px-4 py-10 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col rounded-frame border-8 border-navy-800 bg-navy-900 text-cream shadow-frame">
        <header className="flex flex-col gap-6 border-b-4 border-navy-700 bg-navy-800 px-8 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
              <TulipIcon className="h-12 w-12" />
            </div>
            <div>
              <p className="font-display text-3xl uppercase tracking-[0.4em]">
                TulipBroker
              </p>
              <p className="text-sm uppercase tracking-[0.35em] text-cream/70">
                Tulip exchange simulator
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-cream/70">
            <span className="rounded-full border border-cream/20 px-3 py-1">
              {SCREENS[activeScreen].label}
            </span>
            <span className="rounded-full border border-cream/20 px-3 py-1">
              {SCREENS[activeScreen].subtitle}
            </span>
            <span className="rounded-full border border-cream/20 px-3 py-1">
              Matching engine · Healthy
            </span>
          </div>
        </header>

        <main className="flex-1 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 px-6 py-6 md:px-10">
          <div className="rounded-panel border border-navy-800/60 bg-navy-900/60 p-1 shadow-inner">
            <div className="rounded-[26px] bg-gradient-to-br from-navy-900 via-navy-900 to-slate-950 p-6 md:p-8">
              <ActiveView />
            </div>
          </div>
        </main>

        <nav className="border-t-4 border-navy-700 bg-navy-800 px-6 py-4">
          <div className="flex flex-wrap items-center justify-evenly gap-2">
            {(Object.keys(SCREENS) as ScreenKey[]).map((key) => {
              const screen = SCREENS[key];
              const isActive = key === activeScreen;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveScreen(key)}
                  className={`flex w-full max-w-[150px] flex-col items-center rounded-2xl border px-4 py-3 text-center transition md:flex-1 ${
                    isActive
                      ? "border-cream bg-cream text-navy-800 shadow-card"
                      : "border-transparent bg-navy-900/40 text-cream/70 hover:border-cream/30 hover:text-cream"
                  }`}
                >
                  <span className="font-display text-sm uppercase tracking-widest">
                    {screen.label}
                  </span>
                  <span className="mt-1 text-[0.6rem] uppercase tracking-[0.3em]">
                    {screen.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex flex-col items-center gap-3">
            <span className={apiBadgeClasses} aria-live="polite">
              {apiBadgeText}
            </span>
            <span
              className="rounded-full border border-cream/25 px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-cream/80 text-center"
              aria-live="polite"
              title={combinedBadgeTitle}
            >
              {combinedBadgeText}
            </span>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
