import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyCode = "USD" | "BDT" | "EUR" | "GBP" | "AED" | "SGD";

interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  rate: number; // relative to USD (1 USD = rate * Currency)
}

export const CURRENCY_RATES: Record<CurrencyCode, CurrencyRate> = {
  USD: { code: "USD", symbol: "$", rate: 1 },
  BDT: { code: "BDT", symbol: "৳", rate: 120 },
  EUR: { code: "EUR", symbol: "€", rate: 0.92 },
  GBP: { code: "GBP", symbol: "£", rate: 0.78 },
  AED: { code: "AED", symbol: "AED ", rate: 3.67 },
  SGD: { code: "SGD", symbol: "S$", rate: 1.34 },
};

interface CurrencyState {
  currentCurrency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  convert: (amountInUSD: number) => number;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currentCurrency: "USD",
      setCurrency: (code: CurrencyCode) => set({ currentCurrency: code }),
      convert: (amountInUSD: number) => {
        const rate = CURRENCY_RATES[get().currentCurrency]?.rate || 1;
        return (amountInUSD || 0) * rate;
      },
      formatPrice: (amountInUSD: number) => {
        const currency = get().currentCurrency;
        const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
        const converted = (amountInUSD || 0) * info.rate;
        if (currency === "BDT") {
          return `${info.symbol}${Math.round(converted).toLocaleString()}`;
        }
        return `${info.symbol}${converted.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    }),
    {
      name: "omnistay_currency_preference",
    }
  )
);

