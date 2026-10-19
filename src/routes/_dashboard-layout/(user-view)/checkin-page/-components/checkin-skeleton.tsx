import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// A section's title and description on the left, as FormSection lays them
// out; text is drawn as bars the height of its line.
function SectionHeading({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="flex max-w-xs flex-col gap-2">
      <Skeleton className={cn('h-4', titleWidth)} />
      <Skeleton className="h-3.5 w-56" />
    </div>
  );
}

// A select with its label above it.
function SelectSkeleton({ labelWidth }: { labelWidth: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className={cn('h-3.5', labelWidth)} />
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );
}

/**
 * The check-in settings while they load, in the form's own layout: the
 * contents beside the card, the header with the guest link, the two
 * sections and the footer.
 */
export function CheckinSkeleton() {
  return (
    <div className="flex flex-row gap-8" aria-busy="true">
      <div className="order-2 hidden w-50 flex-col gap-3 pt-1 xl:flex">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3.5 w-24" />
      </div>

      <Card className="max-w-4xl min-w-0 flex-1">
        <CardHeader className="gap-4 border-b">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>
          <CardAction>
            <Skeleton className="h-7 w-24 rounded-lg" />
          </CardAction>
          <div className="col-span-full flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-9 w-full rounded-lg sm:max-w-sm" />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 md:gap-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <SectionHeading titleWidth="w-36" />
            <div className="flex flex-col gap-5">
              <Skeleton className="h-[62px] w-full rounded-lg" />
              <div className="grid gap-4 xl:grid-cols-2">
                <SelectSkeleton labelWidth="w-16" />
                <SelectSkeleton labelWidth="w-20" />
              </div>
              <Skeleton className="-mt-3 h-3.5 w-64" />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <SectionHeading titleWidth="w-32" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {['w-24', 'w-14', 'w-20', 'w-16', 'w-16', 'w-20'].map(
                (labelWidth, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <Skeleton className={cn('h-3.5', labelWidth)} />
                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-between border-t border-border/60 py-4!">
          <Skeleton className="h-3 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-16 rounded-lg" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
