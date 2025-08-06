import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Skeleton } from './skeleton';

export function FormSkeleton() {
  return (
    <div className="max-w-xl space-y-3">
      {/* Booking Information Section */}
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-80" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Guests Section */}
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-16" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="space-y-4">
            {/* Guest Search */}
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter className="border-t-0">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    </div>
  );
}
