import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard-layout/analytics')({
  component: () => <div>Hello /analytics!</div>,
})
