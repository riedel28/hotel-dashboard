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
    <div className="max-w-lg rounded-md border border-red-100 bg-red-50 p-4 text-center">
      <h3 className="text-xl font-semibold text-red-700">Error!</h3>
      <p className="text-red-700">{error?.message}</p>

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
