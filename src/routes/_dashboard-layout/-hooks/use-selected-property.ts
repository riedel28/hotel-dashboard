import { getRouteApi } from '@tanstack/react-router';

const dashboardRoute = getRouteApi('/_dashboard-layout');

/**
 * The Property the user works in, as the dashboard loaded it for this
 * navigation; null when none is selected. Its timezone and address are what
 * pages such as events read.
 */
export function useSelectedProperty() {
  return dashboardRoute.useRouteContext().selectedProperty;
}
