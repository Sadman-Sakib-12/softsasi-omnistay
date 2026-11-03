import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyCode = "BDT" | "USD" | "EUR" | "GBP";

interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  rate: number; // relative to BDT
}

export const CURRENCY_RATES: Record<CurrencyCode, CurrencyRate> = {
  BDT: { code: "BDT", symbol: "৳", rate: 1 },
  USD: { code: "USD", symbol: "$", rate: 1 / 115 },
  EUR: { code: "EUR", symbol: "€", rate: 1 / 125 },
  GBP: { code: "GBP", symbol: "£", rate: 1 / 148 },
};

interface CurrencyState {
  currentCurrency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInBDT: number) => string;
  convert: (amountInBDT: number) => number;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currentCurrency: "BDT",
      setCurrency: (code: CurrencyCode) => set({ currentCurrency: code }),
      convert: (amountInBDT: number) => {
        const rate = CURRENCY_RATES[get().currentCurrency]?.rate || 1;
        return amountInBDT * rate;
      },
      formatPrice: (amountInBDT: number) => {
        const currency = get().currentCurrency;
        const info = CURRENCY_RATES[currency] || CURRENCY_RATES.BDT;
        const converted = amountInBDT * info.rate;
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

