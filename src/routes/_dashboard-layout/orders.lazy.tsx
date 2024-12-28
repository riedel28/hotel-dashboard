import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_dashboard-layout/orders')({
  component: () => <div>Hello /orders!</div>
});
