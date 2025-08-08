import js from '@eslint/js';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import tanstackRouter from '@tanstack/eslint-plugin-router';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import pluginLingui from 'eslint-plugin-lingui';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  pluginLingui.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      '@tanstack/query': tanstackQuery,
      '@tanstack/router': tanstackRouter,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...tanstackQuery.configs.recommended.rules,
      ...tanstackRouter.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      'lingui/t-call-in-function': 'off'
    }
  },
  {
    ignores: ['dist']
  }
];
