import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard-layout/(front-office)/orders'
)({
  component: () => <div>Hello /orders!</div>
});
