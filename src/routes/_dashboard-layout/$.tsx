import { createFileRoute } from '@tanstack/react-router';

import { NotFound } from '@/components/route-state';

// Catches any path no page matches and shows the 404 as its page, inside the
// dashboard layout with the sidebar kept. Without it an unknown top-level path
// would skip the pathless layout and land on the root's full-screen 404.
export const Route = createFileRoute('/_dashboard-layout/$')({
  component: () => <NotFound />
});
