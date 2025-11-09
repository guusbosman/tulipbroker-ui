import { useEffect, useMemo, useState } from "react";

type PulsePoint = {
  ts: string;
  avgPrice: number;
  buyOrders: number;
  sellOrders: number;
};

type PulseStats = {
  lastPrice: number;
  buyShare: number;
  sellShare: number;
  ordersSampled: number;
};

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const ENDPOINT = API_BASE ? `${API_BASE}/api/metrics/pulse` : "/api/metrics/pulse";

export function useMarketPulse() {
  const [points, setPoints] = useState<PulsePoint[]>([]);
  const [stats, setStats] = useState<PulseStats | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const fetchPulse = async () => {
    try {
      setStatus("loading");
      setError(null);
      const response = await fetch(ENDPOINT);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setPoints(Array.isArray(data?.points) ? data.points : []);
      setStats(data?.stats ?? null);
      setStatus("ready");
    } catch (err) {
      console.error("Failed to load market pulse", err);
      setError("Unable to load market pulse");
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchPulse();
    const interval = setInterval(fetchPulse, 30000);
    return () => clearInterval(interval);
  }, []);

  const sentiment = useMemo(() => {
    if (!stats) {
      return null;
    }
    return Math.round((stats.buyShare ?? 0) * 100);
  }, [stats]);

  return { points, stats, status, error, sentiment, refresh: fetchPulse };
}
