import { useEffect, useMemo, useState } from "react";

type ApiConfigResponse = {
  version?: string;
  env?: string;
  region?: string;
  commit?: string;
  buildTime?: string;
};

type Status = "idle" | "loading" | "ready" | "error";

type UseApiConfigResult = {
  config: ApiConfigResponse | null;
  status: Status;
  error: string | null;
};

export function useApiConfig(): UseApiConfigResult {
  const [config, setConfig] = useState<ApiConfigResponse | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const apiBase = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL ?? "";
    if (!raw) {
      return "";
    }
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }, []);

  useEffect(() => {
    if (!apiBase) {
      setStatus("error");
      setError("Set VITE_API_URL to enable API checks");
      return;
    }

    let isCancelled = false;
    setStatus("loading");
    setError(null);

    const fetchConfig = async () => {
      try {
        const response = await fetch(`${apiBase}/api/config`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload: ApiConfigResponse = await response.json();
        if (!isCancelled) {
          setConfig(payload);
          setStatus("ready");
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to load /api/config", err);
          setStatus("error");
          setError("API unreachable");
        }
      }
    };

    fetchConfig();

    return () => {
      isCancelled = true;
    };
  }, [apiBase]);

  return { config, status, error };
}
