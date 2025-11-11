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
    <div className="min-h-screen w-full px-3 py-8 sm:px-4 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col rounded-[32px] bg-navy-900 text-cream shadow-[0_25px_80px_rgba(1,7,20,0.6)]">
        <header className="flex flex-col gap-5 border-b border-navy-700/40 bg-navy-800 px-6 py-5 sm:px-8 sm:py-6 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => setActiveScreen("overview")}
            aria-label="Go to overview"
            className="flex items-center gap-4 text-left hover:opacity-90 transition"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream sm:h-16 sm:w-16">
              <TulipIcon className="h-10 w-10 sm:h-12 sm:w-12" />
            </div>
            <div>
              <p className="font-display text-2xl uppercase tracking-[0.2em] sm:text-3xl sm:tracking-[0.4em]">
                TulipBroker
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-cream/70 sm:text-sm sm:tracking-[0.35em]">
                Tulip exchange simulator
              </p>
            </div>
          </button>
        </header>

        <main className="flex-1 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 px-6 py-6 md:px-10">
          <div className="rounded-panel border border-navy-800/60 bg-navy-900/60 p-1 shadow-inner">
            <div className="rounded-[26px] bg-gradient-to-br from-navy-900 via-navy-900 to-slate-950 p-6 md:p-8">
              <ActiveView />
            </div>
          </div>
        </main>

        <nav className="border-t-4 border-navy-700 bg-navy-800 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4">
            <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-1 sm:-mx-4 sm:px-4 md:flex-wrap md:justify-center">
              {(Object.keys(SCREENS) as ScreenKey[]).map((key) => {
                const screen = SCREENS[key];
                const isActive = key === activeScreen;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveScreen(key)}
                    className={`flex min-w-[160px] flex-shrink-0 flex-col items-center rounded-2xl border px-4 py-3 text-center transition md:min-w-[140px] md:flex-1 ${
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
            <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-stretch md:justify-between">
              <span className={`${apiBadgeClasses} w-full md:w-auto`} aria-live="polite">
                {apiBadgeText}
              </span>
              <span
                className="w-full rounded-full border border-cream/25 px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-cream/80 md:w-auto"
                aria-live="polite"
                title={combinedBadgeTitle}
              >
                {combinedBadgeText}
              </span>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
