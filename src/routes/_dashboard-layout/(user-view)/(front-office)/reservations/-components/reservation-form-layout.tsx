import { Trans } from '@lingui/react/macro';
import { Fragment, type ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { ReservationFormData } from 'shared/types/reservations';

import { FormSection } from '@/components/form-section';
import { type NavSection, SectionNav } from '@/components/section-nav';
import { StickyCardFooter } from '@/components/sticky-card-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { GuestsSection } from './guests-section';

/**
 * One section of a reservation form. The page, its table of contents and the
 * error dots in it are all drawn from the same list of these.
 */
export interface ReservationFormSection extends NavSection {
  description: ReactNode;
  render: (form: UseFormReturn<ReservationFormData>) => ReactNode;
}

/** Who is staying: the same section in the add and the edit form. */
export const GUESTS_SECTION: ReservationFormSection = {
  id: 'guests',
  label: <Trans>Guests</Trans>,
  description: (
    <Trans>
      How many people are staying, by age group, and who they are. The primary
      guest is the one the reservation is booked under.
    </Trans>
  ),
  fields: ['adults', 'youth', 'children', 'infants', 'guests'],
  render: (form) => <GuestsSection form={form} />
};

interface ReservationFormLayoutProps {
  form: UseFormReturn<ReservationFormData>;
  /** Keep the list's identity stable: the table of contents tracks it. */
  sections: ReservationFormSection[];
  onSubmit: (data: ReservationFormData) => void;
  isSaving: boolean;
  /** What the footer says about the form's state, left of the actions. */
  status: ReactNode;
  /** The footer's buttons; one of them submits the `reservation-form`. */
  children: ReactNode;
}

const FORM_ID = 'reservation-form';

/** The card a reservation is added and edited in, with its table of contents. */
export function ReservationFormLayout({
  form,
  sections,
  onSubmit,
  isSaving,
  status,
  children
}: ReservationFormLayoutProps) {
  return (
    <div className="flex flex-row gap-8">
      <SectionNav
        sections={sections}
        errors={form.formState.errors}
        className="order-2 hidden xl:block"
      />

      <Card className="relative max-w-4xl min-w-0 flex-1 overflow-visible">
        <CardContent>
          <form
            id={FORM_ID}
            // A rejected submit focuses the first invalid field by itself
            onSubmit={form.handleSubmit(onSubmit)}
            aria-busy={isSaving}
            className="flex flex-col gap-6 md:gap-8"
            noValidate
          >
            <fieldset disabled={isSaving} className="contents">
              {sections.map((section, index) => (
                <Fragment key={section.id}>
                  {index > 0 && <Separator />}
                  <FormSection
                    id={section.id}
                    title={section.label}
                    description={section.description}
                  >
                    {section.render(form)}
                  </FormSection>
                </Fragment>
              ))}
            </fieldset>
          </form>
        </CardContent>

        <StickyCardFooter>
          <div className="flex w-full flex-wrap items-center justify-end gap-3">
            <div
              className="mr-auto min-w-0 text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {status}
            </div>
            <div className="flex gap-2">{children}</div>
          </div>
        </StickyCardFooter>
      </Card>
    </div>
  );
}

ReservationFormLayout.formId = FORM_ID;
