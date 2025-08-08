import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { detectCurrencyFromLocation, CURRENCIES, Currency } from '../utils/currency';

interface CurrencyContextType {
  currentCurrency: string;
  setCurrency: (currency: string) => void;
  currencies: Record<string, Currency>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeCurrency() {
      // Check if user has a saved preference
      const savedCurrency = localStorage.getItem('budgetbuddy_currency');
      
      if (savedCurrency && CURRENCIES[savedCurrency]) {
        setCurrentCurrency(savedCurrency);
        setIsLoading(false);
      } else {
        // Auto-detect currency based on location
        try {
          const detectedCurrency = await detectCurrencyFromLocation();
          setCurrentCurrency(detectedCurrency);
          localStorage.setItem('budgetbuddy_currency', detectedCurrency);
        } catch (error) {
          console.log('Using default currency (USD)');
          setCurrentCurrency('USD');
          localStorage.setItem('budgetbuddy_currency', 'USD');
        } finally {
          setIsLoading(false);
        }
      }
    }

    initializeCurrency();
  }, []);

  const setCurrency = (currency: string) => {
    if (CURRENCIES[currency]) {
      setCurrentCurrency(currency);
      localStorage.setItem('budgetbuddy_currency', currency);
    }
  };

  return (
    <CurrencyContext.Provider value={{
      currentCurrency,
      setCurrency,
      currencies: CURRENCIES,
      isLoading
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
