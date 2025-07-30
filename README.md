# TanStack Dashboard

A modern React dashboard built with TypeScript, Vite, and TanStack Query.

## API Configuration

The application uses a centralized API configuration system located in `src/config/api.ts`. This allows for easy environment-based configuration and URL management.

### Environment Variables

You can configure the API base URL using the `VITE_API_BASE_URL` environment variable:

```bash
# Development (default)
VITE_API_BASE_URL=http://localhost:3001

# Staging
VITE_API_BASE_URL=https://api-staging.example.com

# Production
VITE_API_BASE_URL=https://api.example.com
```

### Usage

The API configuration provides helper functions for building URLs:

```typescript
import { buildApiUrl, buildResourceUrl, getEndpointUrl } from '@/config/api';

// Build a full URL with query parameters
const url = buildApiUrl(getEndpointUrl('reservations'), {
  _page: 1,
  _limit: 10
});

// Result: http://localhost:3001/reservations?_page=1&_limit=10

// Build a URL for a specific resource by ID
const resourceUrl = buildResourceUrl('reservations', 123);

// Result: http://localhost:3001/reservations/123
```

## Development Setup

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname
  }
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

# Internationalization (i18n)

This project uses [react-intl](https://formatjs.io/docs/react-intl/) for internationalization.

## Supported Languages

- English (en)
- German (de)

## Adding/Editing Translations

- Message files are in `src/i18n/en.json`, `src/i18n/de.json`, and `src/i18n/ru.json`.
- Add new keys to all language files to keep them in sync.
- Use the `<FormattedMessage id="..." defaultMessage="..." />` component for all user-facing text.

## Language Switching

- The language switcher UI is in the sidebar footer (Dashboard layout).
- (WIP) Language switching will be wired to context/global state for runtime switching.

## Best Practices

- Always use message IDs (e.g., `sidebar.start`) and avoid hardcoding text.
- Use `defaultMessage` for fallback and for extraction tools.
- Keep message files flat and human-readable.
- Review [react-intl best practices](https://formatjs.io/docs/getting-started/message-extraction) for more advanced usage.
