export function findMatchingView(pathname: string): 'user' | 'admin' | null {
  const routePatterns = [
    // Admin patterns
    { pattern: /^\/properties(\/.*)?$/, view: 'admin' as const },
    { pattern: /^\/customers(\/.*)?$/, view: 'admin' as const },

    // User patterns
    { pattern: /^\/about(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/access-provider(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/analytics(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/checkin-page(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/company(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/devices(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/events(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/mobile-cms(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/monitoring(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/orders(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/payment-provider(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/payments(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/pms-provider(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/products(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/profile(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/registration-forms(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/reservations(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/rooms(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/tv(\/.*)?$/, view: 'user' as const },
    { pattern: /^\/users(\/.*)?$/, view: 'user' as const }
  ];

  for (const { pattern, view } of routePatterns) {
    if (pattern.test(pathname)) {
      return view;
    }
  }

  return null;
}
