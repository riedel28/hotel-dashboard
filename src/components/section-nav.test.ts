import { describe, expect, test } from 'vitest';

import { sectionHasError } from './section-nav';

const stay = {
  id: 'stay',
  label: 'Stay',
  fields: ['booking_from', 'booking_to', 'room_name']
};

describe('sectionHasError', () => {
  test('is false while the form is valid', () => {
    expect(sectionHasError(stay, {})).toBe(false);
  });

  test('is true when one of the section’s fields is invalid', () => {
    expect(sectionHasError(stay, { room_name: {} })).toBe(true);
  });

  test('ignores the errors of other sections', () => {
    expect(sectionHasError(stay, { adults: {} })).toBe(false);
  });

  test('is false for a section that names no fields', () => {
    expect(sectionHasError({ id: 'about', label: 'About' }, { x: {} })).toBe(
      false
    );
  });
});
