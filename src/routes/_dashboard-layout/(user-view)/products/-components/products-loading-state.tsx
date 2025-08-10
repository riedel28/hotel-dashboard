import { Trans } from '@lingui/react/macro';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductsLoadingState() {
  return (
    <Card className="min-h-[150px]">
      <CardHeader>
        <CardTitle className="text-base">
          <Trans>Products</Trans>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <Skeleton className="h-[34px] w-full" />
          <Skeleton className="h-[34px] w-full" />
          <Skeleton className="h-[34px] w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
