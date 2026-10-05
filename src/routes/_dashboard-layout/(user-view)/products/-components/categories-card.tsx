import { Trans } from '@lingui/react/macro';
import * as React from 'react';

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface CategoriesCardProps {
  // Shown on the right of the header, e.g. the "add category" button.
  action?: React.ReactNode;
  children: React.ReactNode;
}

// The shell every state of the categories column shares.
export function CategoriesCard({ action, children }: CategoriesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <Trans>Product categories</Trans>
        </CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
