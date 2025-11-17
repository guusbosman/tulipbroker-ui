import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Persona } from "./personas";
import { getSeedPersona, seedPersonas } from "./personas";
import {
  fetchPersonas as fetchPersonasApi,
  createPersona as apiCreatePersona,
  updatePersona as apiUpdatePersona,
  deletePersona as apiDeletePersona,
  type PersonaPayload,
} from "./api/personas";

type PersonaContextValue = {
  personas: Persona[];
  activePersona: Persona;
  status: "idle" | "loading" | "ready" | "error";
  error?: string;
  setActivePersona: (persona: Persona) => void;
  refreshPersonas: () => Promise<void>;
  createPersona: (payload: PersonaPayload) => Promise<Persona>;
  updatePersona: (userId: string, payload: PersonaPayload) => Promise<Persona>;
  deletePersona: (userId: string) => Promise<void>;
};

export const PersonaContext = createContext<PersonaContextValue | undefined>(undefined);

type PersonaProviderProps = {
  children: ReactNode;
  initialPersonas?: Persona[];
  fetcher?: () => Promise<Persona[]>;
  autoLoad?: boolean;
};

function sortPersonas(list: Persona[]): Persona[] {
  return [...list].sort((a, b) => a.userName.localeCompare(b.userName));
}

export function PersonaProvider({
  children,
  initialPersonas = seedPersonas,
  fetcher,
  autoLoad = true,
}: PersonaProviderProps) {
  const [personas, setPersonas] = useState<Persona[]>(sortPersonas(initialPersonas));
  const [activePersonaId, setActivePersonaId] = useState(
    initialPersonas[0]?.userId ?? "unknown"
  );
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | undefined>();

  const fetchPersonasFn = useMemo(() => fetcher ?? fetchPersonasApi, [fetcher]);

  const activePersona = useMemo(() => {
    return (
      personas.find((persona) => persona.userId === activePersonaId) ??
      personas[0] ??
      getSeedPersona()
    );
  }, [activePersonaId, personas]);

  const setActivePersona = useCallback((persona: Persona) => {
    setActivePersonaId(persona.userId);
  }, []);

  const refreshPersonas = useCallback(async () => {
    setStatus("loading");
    try {
      const remote = await fetchPersonasFn();
      if (remote.length > 0) {
        const next = sortPersonas(remote);
        setPersonas(next);
        if (!next.find((persona) => persona.userId === activePersonaId)) {
          setActivePersonaId(next[0].userId);
        }
      } else {
        setPersonas(sortPersonas(initialPersonas));
      }
      setStatus("ready");
      setError(undefined);
    } catch (err) {
      console.warn("Failed to refresh personas, falling back to seed data", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to load personas");
      setPersonas(sortPersonas(initialPersonas));
    }
  }, [activePersonaId, fetchPersonasFn, initialPersonas]);

  useEffect(() => {
    if (!autoLoad) {
      setStatus("ready");
      return;
    }
    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        const remote = await fetchPersonasFn();
        if (cancelled) {
          return;
        }
        if (remote.length > 0) {
          const next = sortPersonas(remote);
          setPersonas(next);
          setActivePersonaId((prev) => {
            const exists = next.find((persona) => persona.userId === prev);
            return exists ? exists.userId : next[0].userId;
          });
        }
        setStatus("ready");
        setError(undefined);
      } catch (err) {
        if (cancelled) {
          return;
        }
        console.warn("Falling back to seed personas", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to load personas");
        setPersonas(sortPersonas(initialPersonas));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [autoLoad, fetchPersonasFn, initialPersonas]);

  const createPersona = useCallback(
    async (payload: PersonaPayload) => {
      const created = await apiCreatePersona(payload);
      setPersonas((prev) => sortPersonas([...prev.filter((p) => p.userId !== created.userId), created]));
      setActivePersonaId(created.userId);
      return created;
    },
    []
  );

  const updatePersona = useCallback(async (userId: string, payload: PersonaPayload) => {
    const updated = await apiUpdatePersona(userId, payload);
    setPersonas((prev) =>
      sortPersonas(prev.map((persona) => (persona.userId === userId ? updated : persona)))
    );
    return updated;
  }, []);

  const deletePersona = useCallback(async (userId: string) => {
    await apiDeletePersona(userId);
    setPersonas((prev) => {
      const next = prev.filter((persona) => persona.userId !== userId);
      setActivePersonaId((current) => {
        if (current === userId) {
          return next[0]?.userId ?? getSeedPersona().userId;
        }
        return current;
      });
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      personas,
      activePersona,
      status,
      error,
      setActivePersona,
      refreshPersonas,
      createPersona,
      updatePersona,
      deletePersona,
    }),
    [
      personas,
      activePersona,
      status,
      error,
      setActivePersona,
      refreshPersonas,
      createPersona,
      updatePersona,
      deletePersona,
    ]
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return ctx;
}
