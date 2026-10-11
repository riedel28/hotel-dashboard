import { scrollToSection } from '@/components/section-nav';

/** The fields of each section, keyed by section id in page order. */
type SectionFields = Record<string, string[]>;

/** Ids of the sections holding an invalid field, in page order. */
export function sectionsWithErrors(
  errors: Record<string, unknown>,
  sectionFields: SectionFields
) {
  return Object.keys(sectionFields).filter((id) =>
    sectionFields[id]?.some((field) => field in errors)
  );
}

/**
 * After a rejected submit: brings the first section with an error into view
 * and focuses its first invalid field, which carries the field's name as id.
 */
export function revealFirstError(
  errors: Record<string, unknown>,
  sectionFields: SectionFields
) {
  const [sectionId] = sectionsWithErrors(errors, sectionFields);
  if (!sectionId) return;

  // The page's first section brings the page header back with it
  scrollToSection(sectionId, sectionId === Object.keys(sectionFields)[0]);
  const field = sectionFields[sectionId]?.find((name) => name in errors);
  if (field) document.getElementById(field)?.focus({ preventScroll: true });
}
