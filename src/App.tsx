import { useEffect, useMemo, useRef, useState } from "react";
import { TulipIcon } from "./components/TulipIcon";
import { PersonaDropdown } from "./components/PersonaDropdown";
import { OverviewScreen } from "./screens/OverviewScreen";
import { PortfolioScreen } from "./screens/PortfolioScreen";
import { OrdersScreen } from "./screens/OrdersScreen";
import { MarketDetailScreen } from "./screens/MarketDetailScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { useApiConfig } from "./hooks/useApiConfig";
import { createNewTradeHandler } from "./utils/createNewTradeHandler.js";

type ScreenKey =
  | "overview"
  | "portfolio"
  | "orders"
  | "market"
  | "settings";

const SCREEN_METADATA: Record<ScreenKey, { label: string; subtitle: string }> = {
  overview: {
    label: "Overview",
    subtitle: "Market dashboard",
  },
  portfolio: {
    label: "Portfolio",
    subtitle: "Holdings & performance",
  },
  orders: {
    label: "Orders",
    subtitle: "Trading console",
  },
  market: {
    label: "Market Detail",
    subtitle: "Instrument deep dive",
  },
  settings: {
    label: "Settings",
    subtitle: "Personalize & learn",
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldFocusOrders, setShouldFocusOrders] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
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

  const screens = useMemo(
    () => ({
      overview: {
        ...SCREEN_METADATA.overview,
        render: () => <OverviewScreen />,
      },
      portfolio: {
        ...SCREEN_METADATA.portfolio,
        render: () => <PortfolioScreen />,
      },
      orders: {
        ...SCREEN_METADATA.orders,
        render: () => <OrdersScreen />,
      },
      market: {
        ...SCREEN_METADATA.market,
        render: () => <MarketDetailScreen />,
      },
      settings: {
        ...SCREEN_METADATA.settings,
        render: () => <SettingsScreen />,
      },
    }),
    [],
  );

  const ActiveView = useMemo(() => screens[activeScreen].render, [activeScreen, screens]);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      const fallbackTarget = previouslyFocusedElement.current ?? menuButtonRef.current;
      if (fallbackTarget) {
        fallbackTarget.focus({ preventScroll: true });
      }
      return;
    }

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

    const getFocusableElements = () => {
      const drawer = drawerRef.current;
      if (!drawer) {
        return [] as HTMLElement[];
      }
      return Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => {
        if (element.hasAttribute("inert")) {
          return false;
        }
        const hasLayout = element.offsetParent !== null || element.getClientRects().length > 0;
        return hasLayout;
      });
    };

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus({ preventScroll: true });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMenuOpen(false);
        return;
      }

      if (event.key === "Tab") {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const isShiftPressed = event.shiftKey;

        if (!isShiftPressed && document.activeElement === last) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        } else if (isShiftPressed && document.activeElement === first) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen]);

  const handleNavigate = (key: ScreenKey) => {
    setActiveScreen(key);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (activeScreen !== "orders" || !shouldFocusOrders) {
      return;
    }

    const form = document.getElementById("order-entry-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      const priceInput = form.querySelector<HTMLInputElement>("[data-order-price-input]");
      priceInput?.focus({ preventScroll: true });
    }

    setShouldFocusOrders(false);
  }, [activeScreen, shouldFocusOrders]);

  const handleNewTrade = createNewTradeHandler({
    navigateToOrders: () => setActiveScreen("orders"),
    closeMenu: () => setIsMenuOpen(false),
    requestOrdersFocus: () => setShouldFocusOrders(true),
  });

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
    <>
      <div className="min-h-screen w-full px-3 py-6 sm:px-4 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col rounded-[32px] bg-navy-900 text-cream shadow-[0_25px_80px_rgba(1,7,20,0.6)]">
          <header className="flex flex-col gap-5 border-b border-navy-700/40 bg-navy-800 px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cream/20 bg-navy-900/60 transition hover:border-cream/50 hover:bg-navy-900"
                aria-label="Open navigation menu"
                aria-controls="app-navigation-drawer"
                aria-expanded={isMenuOpen}
                ref={menuButtonRef}
              >
                <svg
                  aria-hidden="true"
                  className="h-6 w-6 text-cream"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate("overview")}
                aria-label="Go to overview"
                className="flex flex-1 items-center justify-center gap-4 text-left transition hover:opacity-90"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream sm:h-16 sm:w-16">
                  <TulipIcon className="h-10 w-10 sm:h-12 sm:w-12" />
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl uppercase tracking-[0.2em] sm:text-3xl sm:tracking-[0.4em]">
                    TulipBroker
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-cream/70 sm:text-sm sm:tracking-[0.35em]">
                    Tulip exchange simulator
                  </p>
                </div>
              </button>
              <div className="flex min-w-[13rem] justify-end">
                <PersonaDropdown variant="header" />
              </div>
            </div>
          </header>

          <main className="flex-1 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 px-6 py-6 md:px-10">
            <div className="rounded-panel border border-navy-800/60 bg-navy-900/60 p-1 shadow-inner">
              <div className="rounded-[26px] bg-gradient-to-br from-navy-900 via-navy-900 to-slate-950 p-6 md:p-8">
                <ActiveView />
              </div>
            </div>
          </main>
          <footer className="border-t border-navy-700 bg-navy-800 px-6 py-5 text-center sm:px-8">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <span className={`${apiBadgeClasses} w-full sm:w-auto`} aria-live="polite">
                {apiBadgeText}
              </span>
              <span
                className="w-full rounded-full border border-cream/25 px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-cream/80 sm:w-auto"
                title={combinedBadgeTitle}
                aria-live="polite"
              >
                {combinedBadgeText}
              </span>
            </div>
          </footer>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation menu"
            tabIndex={-1}
            aria-hidden="true"
          />
          <aside
            id="app-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Application navigation"
            aria-labelledby="app-navigation-heading"
            className="absolute inset-y-0 left-0 flex w-[min(85vw,320px)] max-w-xs flex-col overflow-hidden rounded-r-[32px] border-r border-cream/20 bg-navy-900/95 shadow-[0_20px_60px_rgba(1,7,20,0.6)]"
            ref={drawerRef}
          >
            <div className="flex items-center justify-between border-b border-navy-700/60 px-5 py-4">
              <div>
                <p
                  id="app-navigation-heading"
                  className="font-display text-lg uppercase tracking-[0.3em] text-cream"
                >
                  Menu
                </p>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cream/60">
                  Navigate TulipBroker
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-cream/20 bg-navy-900/70 transition hover:border-cream/40 hover:bg-navy-900"
                aria-label="Close navigation menu"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-cream"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="m6 6 12 12M6 18 18 6" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="rounded-2xl border border-tulip-red/60 bg-tulip-red/30 px-4 py-2 font-display text-[0.9rem] uppercase tracking-[0.28em] text-cream transition hover:border-tulip-red hover:bg-tulip-red/40"
                  onClick={handleNewTrade}
                  aria-label="Start a new trade and jump to the Orders screen"
                >
                  New Trade
                </button>

                <nav className="flex flex-col gap-2" aria-label="Primary">
                  {(Object.keys(SCREEN_METADATA) as ScreenKey[]).map((key) => {
                    const screen = screens[key];
                    const isActive = key === activeScreen;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleNavigate(key)}
                        className={`flex flex-col items-start rounded-2xl border px-4 py-1.5 text-left transition ${
                          isActive
                            ? "border-cream bg-cream text-navy-800 shadow-card"
                            : "border-transparent bg-navy-900/40 text-cream/80 hover:border-cream/30 hover:text-cream"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="font-display text-[0.9rem] uppercase tracking-[0.28em]">
                          {screen.label}
                        </span>
                        <span className="mt-0.5 text-[0.52rem] uppercase tracking-[0.3em] text-cream/70">
                          {screen.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default App;
