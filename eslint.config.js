import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import formatjs from 'eslint-plugin-formatjs';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
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
      formatjs: formatjs,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      // FormatJS rules - only rules that don't parse message content
      'formatjs/enforce-default-message': ['error', 'literal'],
      'formatjs/no-literal-string-in-jsx': [
        'warn',
        {
          props: {
            include: [['*', '{label,placeholder,title}']],
            exclude: [
              ['*', '{aria-*}'],
              ['*', '{role}'],
              ['*', '{data-*}'],
              ['*', '{tabIndex}'],
              ['*', '{type}'],
              ['*', '{value}'],
              ['*', '{defaultValue}'],
              ['*', '{id}'],
              ['*', '{name}'],
              ['*', '{email}'],
              ['*', '{avatar}'],
              ['*', '{url}'],
              ['*', '{icon}'],
              ['*', '{className}'],
              ['*', '{style}'],
              ['*', '{onClick}'],
              ['*', '{onChange}'],
              ['*', '{onSubmit}'],
              ['*', '{disabled}'],
              ['*', '{required}'],
              ['*', '{readOnly}'],
              ['*', '{hidden}'],
              ['*', '{checked}'],
              ['*', '{selected}'],
              ['*', '{expanded}'],
              ['*', '{pressed}'],
              ['*', '{current}'],
              ['*', '{describedby}'],
              ['*', '{controls}'],
              ['*', '{owns}'],
              ['*', '{live}'],
              ['*', '{atomic}'],
              ['*', '{relevant}'],
              ['*', '{busy}'],
              ['*', '{dropzone}'],
              ['*', '{grabbed}'],
              ['*', '{haspopup}'],
              ['*', '{invalid}'],
              ['*', '{label}'],
              ['*', '{labelledby}'],
              ['*', '{level}'],
              ['*', '{multiline}'],
              ['*', '{multiselectable}'],
              ['*', '{orientation}'],
              ['*', '{posinset}'],
              ['*', '{readonly}'],
              ['*', '{required}'],
              ['*', '{selected}'],
              ['*', '{setsize}'],
              ['*', '{sort}'],
              ['*', '{valuemax}'],
              ['*', '{valuemin}'],
              ['*', '{valuenow}'],
              ['*', '{valuetext}']
            ]
          }
        }
      ],
      'formatjs/no-emoji': 'error',
      // Disable all rules that parse message content (conflict with HTML)
      'formatjs/no-offset': 'off',
      'formatjs/enforce-description': 'off',
      'formatjs/no-id': 'off',
      'formatjs/enforce-placeholders': 'off',
      'formatjs/no-multiple-plurals': 'off',
      'formatjs/no-complex-selectors': 'off',
      'formatjs/prefer-pound-in-plural': 'off',
      'formatjs/no-missing-icu-plural-one-placeholders': 'off',
      'formatjs/enforce-plural-rules': 'off',
      'formatjs/no-useless-message': 'off',
      'formatjs/blocklist-elements': 'off',
      'formatjs/no-multiple-whitespaces': 'off'
    }
  },
  {
    ignores: ['dist']
  }
];
