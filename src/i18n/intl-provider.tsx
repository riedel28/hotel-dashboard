import { ReactNode, createContext, useContext, useState } from 'react';

import { IntlProvider as ReactIntlProvider } from 'react-intl';

import deMessages from './de.json';
import enMessages from './en.json';

const messages: Record<string, Record<string, string>> = {
  en: enMessages,
  de: deMessages
};

interface IntlContextProps {
  locale: string;
  setLocale: (locale: string) => void;
}

const IntlContext = createContext<IntlContextProps | undefined>(undefined);

export function useIntlContext() {
  const ctx = useContext(IntlContext);
  if (!ctx) throw new Error('useIntlContext must be used within IntlProvider');

  return ctx;
}

export function IntlProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem('locale') || 'en';
  });

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <IntlContext.Provider value={{ locale, setLocale }}>
      <ReactIntlProvider
        locale={locale}
        messages={messages[locale]}
        defaultLocale="en"
      >
        {children}
      </ReactIntlProvider>
    </IntlContext.Provider>
  );
}
