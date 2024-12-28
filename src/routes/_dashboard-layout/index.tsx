import { createFileRoute } from '@tanstack/react-router';

import { useAuth } from '../../auth';

export const Route = createFileRoute('/_dashboard-layout/')({
  component: StartPage
});

function StartPage() {
  const auth = useAuth();

  return (
    <section className="grid gap-2 p-2">
      <p>Hi {auth.user?.email}!</p>
      <p>You are currently on the dashboard route.</p>
    </section>
  );
}
