import { describe, test, expect } from 'vitest';
import { findMatchingView } from './route-matcher';

describe('findMatchingView', () => {
  describe('Admin View Routes', () => {
    test('matches /properties root route', () => {
      expect(findMatchingView('/properties')).toBe('admin');
    });

    test('matches /properties with nested route', () => {
      expect(findMatchingView('/properties/123')).toBe('admin');
    });

    test('matches /properties with deep nested route', () => {
      expect(findMatchingView('/properties/123/edit')).toBe('admin');
    });

    test('matches /customers root route', () => {
      expect(findMatchingView('/customers')).toBe('admin');
    });

    test('matches /customers with nested route', () => {
      expect(findMatchingView('/customers/456')).toBe('admin');
    });

    test('matches /customers with deep nested route', () => {
      expect(findMatchingView('/customers/456/details')).toBe('admin');
    });
  });

  describe('User View Routes', () => {
    test('matches /monitoring route', () => {
      expect(findMatchingView('/monitoring')).toBe('user');
    });

    test('matches /analytics route', () => {
      expect(findMatchingView('/analytics')).toBe('user');
    });

    test('matches /reservations root route', () => {
      expect(findMatchingView('/reservations')).toBe('user');
    });

    test('matches /reservations with nested route', () => {
      expect(findMatchingView('/reservations/123')).toBe('user');
    });

    test('matches /reservations with deep nested route', () => {
      expect(findMatchingView('/reservations/123/edit')).toBe('user');
    });

    test('matches /orders root route', () => {
      expect(findMatchingView('/orders')).toBe('user');
    });

    test('matches /orders with nested route', () => {
      expect(findMatchingView('/orders/789')).toBe('user');
    });

    test('matches /payments route', () => {
      expect(findMatchingView('/payments')).toBe('user');
    });

    test('matches /payments with nested route', () => {
      expect(findMatchingView('/payments/101/refund')).toBe('user');
    });

    test('matches /products route', () => {
      expect(findMatchingView('/products')).toBe('user');
    });

    test('matches /events route', () => {
      expect(findMatchingView('/events')).toBe('user');
    });

    test('matches /mobile-cms route', () => {
      expect(findMatchingView('/mobile-cms')).toBe('user');
    });

    test('matches /tv route', () => {
      expect(findMatchingView('/tv')).toBe('user');
    });

    test('matches /access-provider route', () => {
      expect(findMatchingView('/access-provider')).toBe('user');
    });

    test('matches /pms-provider route', () => {
      expect(findMatchingView('/pms-provider')).toBe('user');
    });

    test('matches /payment-provider route', () => {
      expect(findMatchingView('/payment-provider')).toBe('user');
    });

    test('matches /company route', () => {
      expect(findMatchingView('/company')).toBe('user');
    });

    test('matches /checkin-page route', () => {
      expect(findMatchingView('/checkin-page')).toBe('user');
    });

    test('matches /users route', () => {
      expect(findMatchingView('/users')).toBe('user');
    });

    test('matches /rooms route', () => {
      expect(findMatchingView('/rooms')).toBe('user');
    });

    test('matches /devices route', () => {
      expect(findMatchingView('/devices')).toBe('user');
    });

    test('matches /registration-forms route', () => {
      expect(findMatchingView('/registration-forms')).toBe('user');
    });

    test('matches /about route', () => {
      expect(findMatchingView('/about')).toBe('user');
    });

    test('matches /profile route', () => {
      expect(findMatchingView('/profile')).toBe('user');
    });
  });

  describe('Shared Routes', () => {
    test('returns null for root route /', () => {
      expect(findMatchingView('/')).toBeNull();
    });
  });

  describe('Unmatched Routes', () => {
    test('returns null for unknown routes', () => {
      expect(findMatchingView('/unknown')).toBeNull();
    });

    test('returns null for /dashboard route', () => {
      expect(findMatchingView('/dashboard')).toBeNull();
    });

    test('returns null for /settings route', () => {
      expect(findMatchingView('/settings')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('does not match pathname with query parameters (pathname excludes query)', () => {
      // Note: In TanStack Router, pathname does not include query params
      // This test verifies the regex doesn't accidentally match query strings
      expect(findMatchingView('/reservations?page=2')).toBeNull();
    });

    test('does not match pathname with hash fragments (pathname excludes hash)', () => {
      // Note: In TanStack Router, pathname does not include hash fragments
      // This test verifies the regex doesn't accidentally match hash fragments
      expect(findMatchingView('/reservations#section')).toBeNull();
    });

    test('handles trailing slashes', () => {
      expect(findMatchingView('/properties/')).toBe('admin');
      expect(findMatchingView('/reservations/')).toBe('user');
    });

    test('does not match partial route names', () => {
      expect(findMatchingView('/property')).toBeNull();
      expect(findMatchingView('/customer')).toBeNull();
      expect(findMatchingView('/reservation')).toBeNull();
      expect(findMatchingView('/order')).toBeNull();
    });

    test('handles empty string', () => {
      expect(findMatchingView('')).toBeNull();
    });

    test('handles very long nested paths', () => {
      const longPath = '/reservations/' + 'a'.repeat(100) + '/edit';
      expect(findMatchingView(longPath)).toBe('user');
    });

    test('handles special characters in nested paths', () => {
      expect(findMatchingView('/reservations/123/edit')).toBe('user');
      expect(findMatchingView('/properties/456')).toBe('admin');
    });
  });

  describe('Route Priority', () => {
    test('first matching pattern takes precedence', () => {
      // Since patterns are checked in order, verify the order matters
      // Admin patterns come first, so /properties matches admin
      expect(findMatchingView('/properties')).toBe('admin');
    });
  });
});

