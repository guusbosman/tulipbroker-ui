import { useMemo, useState, type ReactElement } from "react";
import { TulipIcon } from "./components/TulipIcon";
import { OverviewScreen } from "./screens/OverviewScreen";
import { PortfolioScreen } from "./screens/PortfolioScreen";
import { OrdersScreen } from "./screens/OrdersScreen";
import { MarketDetailScreen } from "./screens/MarketDetailScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

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

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("overview");

  const ActiveView = useMemo(() => SCREENS[activeScreen].render, [activeScreen]);

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
        </nav>
      </div>
    </div>
  );
}

export default App;
