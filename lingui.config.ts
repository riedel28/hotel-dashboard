import { defineConfig } from '@lingui/cli';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'de'],
  catalogs: [
    {
      // Include the filename base so resources like src/locales/en/messages.po match
      path: 'src/locales/{locale}/messages',
      include: ['src']
    }
  ]
});
