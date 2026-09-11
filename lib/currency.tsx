"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CurrencyCode = "PHP" | "THB";

const STORAGE_KEY = "ledger-currency";

const SYMBOLS: Record<CurrencyCode, string> = {
  PHP: "\u20B1", // ₱
  THB: "\u0E3F", // ฿
};

interface CurrencyContextValue {
  currency: CurrencyCode;
  symbol: string;
  setCurrency: (currency: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("PHP");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "PHP" || stored === "THB") setCurrencyState(stored);
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, symbol: SYMBOLS[currency], setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
