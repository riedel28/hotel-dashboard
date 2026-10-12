import type { ComponentType } from 'react';
import type { Provider, ProviderKind } from 'shared/types/providers';

/** A provider's logo: a file in public/, and how it copes with both themes. */
export interface ProviderLogoSource {
  src: string;
  /** Its variant for the dark theme, when there is one. */
  darkSrc?: string;
  /** The file is drawn in light ink: it is shown black in the light theme. */
  lightInk?: boolean;
}

/**
 * Everything a provider page knows about one provider. A page lists its
 * providers once; the picker, the form's header and the choice of form are all
 * read from that list.
 */
export interface ProviderEntry<K extends ProviderKind> {
  /** As stored: a member of the kind's schema once it can be configured. */
  id: string;
  name: string;
  /** Without one the provider is shown by name alone. */
  logo?: ProviderLogoSource;
  /** Its documentation, linked from the form's header when there is some. */
  guideUrl?: string;
  /** Its form. A provider without one is listed as coming soon. */
  Form?: ComponentType<ProviderFormProps<K>>;
}

/** What a provider's form is given. */
export interface ProviderFormProps<K extends ProviderKind> {
  /** The provider this is the form of. */
  entry: ProviderEntry<K>;
  /** Its stored configuration, or null while it is being set up. */
  saved: Provider<K> | null;
  /**
   * The name of the provider that setting this one up would replace: set while
   * another one is stored.
   */
  replaces: string | null;
  /** Opens the picker: "Back" during setup, "Change provider" after. */
  onChooseProvider: () => void;
}
