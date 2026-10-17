import { Trans, useLingui } from '@lingui/react/macro';
import { CopyIcon, InfoIcon } from 'lucide-react';
import * as React from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import {
  type CmsLocale,
  cmsLocales,
  type CmsNodeType,
  cmsPrimaryLocale,
  cmsSubtitleMaxLength
} from 'shared/types/cms';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldOptional
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import {
  type CmsForm,
  hasText,
  isMissingTranslation
} from '../-lib/cms-content';

// Buttons inside the blue "no translation" note, in the note's own colours
// (Alert info: info-soft / info) instead of the neutral ones that stood out
// on it.
const noteButtonClassName =
  'border-info/20 bg-transparent text-info hover:bg-info/10 hover:text-info dark:bg-transparent';
const noteGhostButtonClassName = 'text-info hover:bg-info/10 hover:text-info';

const localeNames: Record<CmsLocale, string> = { de: 'Deutsch', en: 'English' };

// The per-language fields, a tab each. A secondary language without any text
// shows a note (the app falls back to German) until it's copied or started.
export function TranslationTabs({
  form,
  values
}: {
  form: UseFormReturn<CmsForm>;
  values: CmsForm;
}) {
  const { t } = useLingui();
  const [locale, setLocale] = React.useState<CmsLocale>(cmsPrimaryLocale);
  // Secondary locales whose fields are shown although still empty.
  const [started, setStarted] = React.useState<Set<CmsLocale>>(new Set());
  const errors = form.formState.errors.translations;

  return (
    <Tabs
      value={locale}
      onValueChange={(value) => setLocale(value as CmsLocale)}
    >
      {/* Pills, like the tabs on a property's admin page. */}
      <TabsList variant="pills">
        {cmsLocales.map((code) => {
          const missing = isMissingTranslation(values.translations, code);
          const invalid = !!errors?.[code];
          return (
            <TabsTrigger key={code} value={code} className="gap-2">
              {localeNames[code]}
              {code === cmsPrimaryLocale && (
                <span className="-ml-1 font-normal text-muted-foreground">
                  (<Trans>main</Trans>)
                </span>
              )}
              {(missing || invalid) && (
                <span
                  className={cn(
                    'size-1.25 rounded-full',
                    invalid ? 'bg-danger' : 'bg-warning'
                  )}
                  title={invalid ? t`Has errors` : t`Translation missing`}
                >
                  {/* A span's aria-label isn't read; text is. */}
                  <span className="sr-only">
                    {invalid ? t`Has errors` : t`Translation missing`}
                  </span>
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {cmsLocales.map((code) => {
        const isPrimary = code === cmsPrimaryLocale;
        const empty =
          !isPrimary &&
          !hasText(values.translations[code]) &&
          !started.has(code);
        return (
          <TabsContent key={code} value={code} className="pt-2">
            {empty ? (
              // Blue note like the reservation form's: nothing is
              // wrong, the app just falls back to German.
              <Alert variant="info" role="note">
                <InfoIcon aria-hidden="true" />
                <AlertDescription className="flex flex-col items-start gap-2">
                  <Trans>
                    No translation yet. The app shows the German text in its
                    place.
                  </Trans>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={noteButtonClassName}
                      onClick={() => {
                        const primary = form.getValues(
                          `translations.${cmsPrimaryLocale}`
                        );
                        form.setValue(
                          `translations.${code}`,
                          { ...primary },
                          { shouldDirty: true }
                        );
                      }}
                    >
                      <CopyIcon />
                      <Trans>Copy from German</Trans>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className={noteGhostButtonClassName}
                      onClick={() =>
                        setStarted((set) => new Set(set).add(code))
                      }
                    >
                      <Trans>Start empty</Trans>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <TranslationFields
                form={form}
                locale={code}
                type={values.type}
                primary={values.translations[cmsPrimaryLocale]}
              />
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function TranslationFields({
  form,
  locale,
  type,
  primary
}: {
  form: UseFormReturn<CmsForm>;
  locale: CmsLocale;
  type: CmsNodeType;
  primary: CmsForm['translations'][CmsLocale];
}) {
  const { t } = useLingui();
  const isPrimary = locale === cmsPrimaryLocale;
  // Secondary locales show the German text as a hint of what's shown instead.
  const placeholder = (value: string) =>
    isPrimary ? undefined : value || undefined;
  const id = (field: string) => `cms-${locale}-${field}`;

  return (
    <div className="flex flex-col gap-4">
      <Controller
        control={form.control}
        name={`translations.${locale}.title`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={id('title')}>
              <Trans>Title</Trans>
              {!isPrimary && <FieldOptional />}
            </FieldLabel>
            <Input
              {...field}
              id={id('title')}
              maxLength={200}
              placeholder={placeholder(primary.title)}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name={`translations.${locale}.subtitle`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <div className="flex items-baseline justify-between">
              <FieldLabel htmlFor={id('subtitle')}>
                <Trans>Subtitle</Trans>
                <FieldOptional />
              </FieldLabel>
              <span
                className={cn(
                  'text-xs tabular-nums',
                  field.value.length > cmsSubtitleMaxLength
                    ? 'text-danger'
                    : 'text-muted-foreground'
                )}
                // Read with the field, not announced on every keystroke.
                id={id('subtitle-count')}
              >
                {field.value.length}/{cmsSubtitleMaxLength}
              </span>
            </div>
            <Input
              {...field}
              id={id('subtitle')}
              aria-describedby={id('subtitle-count')}
              placeholder={placeholder(primary.subtitle)}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      {type === 'page' ? (
        <Controller
          control={form.control}
          name={`translations.${locale}.body`}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor={id('body')}>
                <Trans>Text</Trans>
              </FieldLabel>
              <RichTextEditor
                variant="cms"
                id={id('body')}
                aria-label={t`Text`}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </Field>
          )}
        />
      ) : (
        !isPrimary && (
          <Controller
            control={form.control}
            name={`translations.${locale}.url`}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor={id('url')}>
                  <Trans>URL for this language</Trans>
                  <FieldOptional />
                </FieldLabel>
                <Input
                  {...field}
                  id={id('url')}
                  type="url"
                  inputMode="url"
                  placeholder={form.getValues('url') || 'https://'}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  <Trans>Leave empty to use the main URL.</Trans>
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )
      )}
    </div>
  );
}
