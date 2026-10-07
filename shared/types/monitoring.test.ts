import { describe, expect, it } from 'vitest';

import { fetchMonitoringLogsParamsSchema as schema } from './monitoring';

describe('fetchMonitoringLogsParamsSchema', () => {
  it('leaves every filter unset for an empty search', () => {
    const parsed = schema.parse({});

    expect(parsed.type).toBeUndefined();
    expect(parsed.period).toBeUndefined();
    expect(parsed.status).toBeUndefined();
  });

  it('reads types from a list and from a comma-separated string', () => {
    expect(schema.parse({ type: ['pms', 'payment'] }).type).toEqual([
      'pms',
      'payment'
    ]);
    expect(schema.parse({ type: 'pms,door lock' }).type).toEqual([
      'pms',
      'door lock'
    ]);
  });

  it('rejects unknown types, periods and malformed dates', () => {
    expect(() => schema.parse({ type: 'pms,minibar' })).toThrow();
    expect(() => schema.parse({ period: '2h' })).toThrow();
    expect(() => schema.parse({ from: 'yesterday' })).toThrow();
  });

  it('accepts a relative period and a custom range', () => {
    expect(schema.parse({ period: '7d' }).period).toBe('7d');
    expect(
      schema.parse({ from: '2026-10-01', to: '2026-10-07' })
    ).toMatchObject({ from: '2026-10-01', to: '2026-10-07' });
  });
});
