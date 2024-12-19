import { RotateCcw } from 'lucide-react';

import { Button } from './button';

export function ErrorFallback({
  error,
  resetErrorBoundary
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="max-w-lg rounded-md border border-rose-100 bg-rose-50 p-6 text-center">
      <h3 className="text-xl font-semibold text-rose-700">Error!</h3>
      <p className="text-rose-700">{error?.message}</p>

      <Button
        size="sm"
        variant="destructive"
        onClick={resetErrorBoundary}
        className="mt-4"
      >
        <RotateCcw />
        Try again
      </Button>
    </div>
  );
}
