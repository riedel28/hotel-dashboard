import '@testing-library/jest-dom';
import { i18n } from '@lingui/core';

// Setup i18n for tests
i18n.loadAndActivate({
  locale: 'en',
  messages: {}
});
