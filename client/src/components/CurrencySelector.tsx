import { useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

export default function CurrencySelector() {
  const { currentCurrency, setCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
  const otherCurrencies = Object.keys(currencies).filter(code => !popularCurrencies.includes(code));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/50 border border-slate-200 rounded-xl hover:bg-white/80 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
      >
        <span className="text-lg">{getCurrencySymbol(currentCurrency)}</span>
        <span className="font-medium text-slate-700">{currentCurrency}</span>
        <svg className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 glass rounded-2xl shadow-2xl z-20 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-slate-200/50">
              <h3 className="font-semibold text-slate-800 flex items-center">
                <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-md flex items-center justify-center text-white text-xs mr-2">💰</span>
                Select Currency
              </h3>
              <p className="text-sm text-slate-600 mt-1">Choose your preferred currency</p>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {/* Popular Currencies */}
              <div className="p-4 border-b border-slate-200/50">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Popular Currencies</h4>
                <div className="grid grid-cols-1 gap-1">
                  {popularCurrencies.map(code => (
                    <button
                      key={code}
                      onClick={() => {
                        setCurrency(code);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 ${
                        currentCurrency === code 
                          ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-semibold w-8">{getCurrencySymbol(code)}</span>
                        <div>
                          <div className="font-medium">{code}</div>
                          <div className="text-sm text-slate-500">{currencies[code].name}</div>
                        </div>
                      </div>
                      {currentCurrency === code && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Currencies */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Other Currencies</h4>
                <div className="grid grid-cols-1 gap-1">
                  {otherCurrencies.map(code => (
                    <button
                      key={code}
                      onClick={() => {
                        setCurrency(code);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 ${
                        currentCurrency === code 
                          ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-semibold w-8">{getCurrencySymbol(code)}</span>
                        <div>
                          <div className="font-medium">{code}</div>
                          <div className="text-sm text-slate-500">{currencies[code].name}</div>
                        </div>
                      </div>
                      {currentCurrency === code && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
