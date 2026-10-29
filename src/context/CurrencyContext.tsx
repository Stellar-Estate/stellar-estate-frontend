import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CurrencyMode = 'USDC' | 'XLM' | 'USD';

interface CurrencyContextType {
  currency: CurrencyMode;
  setCurrency: (currency: CurrencyMode) => void;
  formatAmount: (baseUsdAmount: number, targetCurrency?: CurrencyMode) => string;
  convertAmount: (baseUsdAmount: number, targetCurrency?: CurrencyMode) => number;
  rates: {
    USD: number;
    USDC: number;
    XLM: number;
  };
}

const STORAGE_KEY = 'stellar_estate_preferred_currency';

// Indicative testnet / market rates: 1 USD = 1 USDC = ~8.33 XLM ($0.12 per XLM)
const EXCHANGE_RATES = {
  USD: 1.0,
  USDC: 1.0,
  XLM: 8.333333, // 1 USD = ~8.33 XLM
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'USDC' || saved === 'XLM' || saved === 'USD') {
        return saved;
      }
    } catch {
      // LocalStorage unavailable in non-browser envs
    }
    return 'USDC';
  });

  const setCurrency = (c: CurrencyMode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // Ignore
    }
  };

  const convertAmount = (baseUsdAmount: number, targetCurrency?: CurrencyMode): number => {
    const target = targetCurrency || currency;
    const rate = EXCHANGE_RATES[target] || 1.0;
    return baseUsdAmount * rate;
  };

  const formatAmount = (baseUsdAmount: number, targetCurrency?: CurrencyMode): string => {
    const target = targetCurrency || currency;
    const converted = convertAmount(baseUsdAmount, target);

    if (target === 'USD') {
      return `$${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    if (target === 'USDC') {
      return `${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDC`;
    }
    // XLM
    return `${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} XLM`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        convertAmount,
        rates: EXCHANGE_RATES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Provide a safe fallback if used outside provider
    return {
      currency: 'USDC',
      setCurrency: () => {},
      convertAmount: (amt) => amt,
      formatAmount: (amt, curr) => `$${amt.toLocaleString()} ${curr || 'USDC'}`,
      rates: EXCHANGE_RATES,
    };
  }
  return context;
};
