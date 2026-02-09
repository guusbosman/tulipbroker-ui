import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type OrdersBackend = "dynamodb" | "yugabyte";

type OrdersBackendContextValue = {
  backend: OrdersBackend;
  setBackend: (value: OrdersBackend) => void;
};

const OrdersBackendContext = createContext<OrdersBackendContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "tb-orders-backend";

export function OrdersBackendProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [backend, setBackend] = useState<OrdersBackend>(() => {
    if (typeof window === "undefined") {
      return "dynamodb";
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "yugabyte" ? "yugabyte" : "dynamodb";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, backend);
  }, [backend]);

  const value = useMemo(() => ({ backend, setBackend }), [backend]);

  return (
    <OrdersBackendContext.Provider value={value}>
      {children}
    </OrdersBackendContext.Provider>
  );
}

export function useOrdersBackend() {
  const context = useContext(OrdersBackendContext);
  if (!context) {
    throw new Error("useOrdersBackend must be used within OrdersBackendProvider");
  }
  return context;
}
