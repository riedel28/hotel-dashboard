import { Trans } from '@lingui/react/macro';
import { Loader2Icon } from 'lucide-react';
import { Fragment, type ReactNode, useId } from 'react';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

import { FormSection } from '@/components/form-section';
import { type NavSection, SectionNav } from '@/components/section-nav';
import { StickyCardFooter } from '@/components/sticky-card-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SectionedFormShellProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  /** Keep the list's identity stable: the table of contents tracks it. */
  sections: NavSection[];
  onSubmit: (data: T) => void;
  isSaving: boolean;
  submitLabel: ReactNode;
  /** A card header above the form. */
  header?: ReactNode;
  /** What the footer says about the form; by default whether it has unsaved changes. */
  status?: ReactNode;
  /** The button beside submit; by default one that discards unsaved changes. */
  secondaryAction?: ReactNode;
  /**
   * A form for something not saved yet: it can be submitted untouched, to
   * show what is missing. An edit form can't, there being nothing to save.
   */
  isNew?: boolean;
  /** The form's sections. */
  children: ReactNode;
}

/**
 * The card of a long form: its table of contents beside it, with a dot on
 * each section holding an invalid field, and a footer that stays in view.
 * `SectionedForm` draws the sections too; use this one for sections that
 * bring their own markup.
 */
export function SectionedFormShell<T extends FieldValues>({
  form,
  sections,
  onSubmit,
  isSaving,
  submitLabel,
  header,
  status,
  secondaryAction,
  isNew = false,
  children
}: SectionedFormShellProps<T>) {
  const formId = useId();
  const { errors, isDirty } = form.formState;

  return (
    <div className="flex flex-row gap-8">
      <SectionNav
        sections={sections}
        errors={errors}
        className="order-2 hidden xl:block"
      />

      <Card className="relative max-w-4xl min-w-0 flex-1 overflow-visible">
        {header}

        <CardContent>
          <form
            id={formId}
            // A rejected submit focuses the first invalid field by itself
            onSubmit={form.handleSubmit(onSubmit)}
            aria-busy={isSaving}
            className="flex flex-col gap-6 md:gap-8"
            noValidate
          >
            <fieldset disabled={isSaving} className="contents">
              {children}
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
              {status !== undefined ? (
                status
              ) : isSaving ? (
                <Trans>Saving changes…</Trans>
              ) : isDirty ? (
                <Trans>Unsaved changes</Trans>
              ) : (
                <Trans>No unsaved changes</Trans>
              )}
            </div>

            <div className="flex gap-2">
              {secondaryAction ?? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={!isDirty || isSaving}
                >
                  <Trans>Cancel</Trans>
                </Button>
              )}
              <Button
                type="submit"
                form={formId}
                disabled={isSaving || (!isNew && !isDirty)}
                aria-busy={isSaving}
              >
                {isSaving && (
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                )}
                {submitLabel}
              </Button>
            </div>
          </div>
        </StickyCardFooter>
      </Card>
    </div>
  );
}

/**
 * One section of a form. The page, its table of contents and the error dots
 * in it are all drawn from the same list of these.
 */
export interface FormSectionDef<T extends FieldValues> extends NavSection {
  /** The fields the section holds: an invalid one marks it in the contents. */
  fields?: FieldPath<T>[];
  description: ReactNode;
  render: (form: UseFormReturn<T>) => ReactNode;
}

interface SectionedFormProps<T extends FieldValues> extends Omit<
  SectionedFormShellProps<T>,
  'sections' | 'children'
> {
  sections: FormSectionDef<T>[];
}

/** A form drawn from a list of sections. */
export function SectionedForm<T extends FieldValues>({
  sections,
  ...shell
}: SectionedFormProps<T>) {
  return (
    <SectionedFormShell sections={sections} {...shell}>
      {sections.map((section, index) => (
        <Fragment key={section.id}>
          {index > 0 && <Separator />}
          <FormSection
            id={section.id}
            title={section.label}
            description={section.description}
          >
            {section.render(shell.form)}
          </FormSection>
        </Fragment>
      ))}
    </SectionedFormShell>
  );
}
