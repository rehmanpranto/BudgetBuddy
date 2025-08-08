// Currency utilities
export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  EGP: { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  ARS: { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  CLP: { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  COP: { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  LKR: { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee' },
  NPR: { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
  AFN: { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
};

// Country to currency mapping
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: 'USD', CA: 'CAD', MX: 'MXN', BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN',
  GB: 'GBP', IE: 'EUR', FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR',
  AT: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR', SK: 'EUR',
  SI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', CH: 'CHF', NO: 'NOK', SE: 'SEK', DK: 'DKK',
  PL: 'PLN', CZ: 'CZK', HU: 'HUF', RU: 'RUB', UA: 'UAH', TR: 'TRY', IL: 'ILS',
  JP: 'JPY', CN: 'CNY', IN: 'INR', KR: 'KRW', TH: 'THB', VN: 'VND', ID: 'IDR',
  MY: 'MYR', PH: 'PHP', SG: 'SGD', HK: 'HKD', AU: 'AUD', NZ: 'NZD',
  AE: 'AED', SA: 'SAR', EG: 'EGP', ZA: 'ZAR', BD: 'BDT', PK: 'PKR', LK: 'LKR',
  NP: 'NPR', AF: 'AFN',
};

export async function detectCurrencyFromLocation(): Promise<string> {
  try {
    // Try to get user's location
    if ('geolocation' in navigator) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false
        });
      });

      // Get country from coordinates using a geolocation API
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        const countryCode = data.countryCode;
        const currency = COUNTRY_CURRENCY_MAP[countryCode];
        if (currency && CURRENCIES[currency]) {
          return currency;
        }
      }
    }
  } catch (error) {
    console.log('Could not detect location, falling back to browser locale');
  }

  // Fallback to browser locale
  try {
    const locale = navigator.language || navigator.languages[0];
    const region = locale.split('-')[1]?.toUpperCase();
    if (region && COUNTRY_CURRENCY_MAP[region]) {
      const currency = COUNTRY_CURRENCY_MAP[region];
      if (CURRENCIES[currency]) {
        return currency;
      }
    }
  } catch (error) {
    console.log('Could not detect currency from locale');
  }

  // Final fallback to USD
  return 'USD';
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  // For currencies without decimal places (like JPY, KRW)
  const decimalPlaces = ['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'HUF'].includes(currencyCode) ? 0 : 2;
  
  try {
    // Use Intl.NumberFormat for proper locale formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(amount);
  } catch (error) {
    // Fallback to simple formatting
    return `${currency.symbol}${amount.toFixed(decimalPlaces)}`;
  }
}

export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCIES[currencyCode]?.symbol || '$';
}

export function getCurrencyName(currencyCode: string): string {
  return CURRENCIES[currencyCode]?.name || 'US Dollar';
}
