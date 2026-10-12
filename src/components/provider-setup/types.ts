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
 *
 * One with a form can be set up, and its id is the one its schema stores it
 * under. One without is listed as coming soon.
 */
export type ProviderEntry<K extends ProviderKind> = {
  name: string;
  /** Without one the provider is shown by name alone. */
  logo?: ProviderLogoSource;
  /** Its documentation, linked from the form's header when there is some. */
  guideUrl?: string;
} & (
  | {
      id: Provider<K>['provider'];
      Form: ComponentType<ProviderFormProps<K>>;
    }
  | { id: string; Form?: undefined }
);

/** A provider that can be set up: one with a form. */
export type AvailableProvider<K extends ProviderKind> = Extract<
  ProviderEntry<K>,
  { Form: object }
>;

/** What a provider's form is given. */
export interface ProviderFormProps<K extends ProviderKind> {
  /** The provider this is the form of. */
  entry: AvailableProvider<K>;
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
