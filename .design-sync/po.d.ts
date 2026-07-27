/** Lingui's vite plugin compiles `.po` catalogs into ES modules. */
declare module '*.po' {
  import type { Messages } from '@lingui/core';

  export const messages: Messages;
}
