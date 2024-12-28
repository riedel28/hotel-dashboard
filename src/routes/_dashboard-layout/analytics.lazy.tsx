import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_dashboard-layout/analytics')({
  component: () => <div>Hello /analytics!</div>,
})
