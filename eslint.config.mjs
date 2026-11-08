import js from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import vitest from '@vitest/eslint-plugin';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const ARRAY_METHODS =
  'map|filter|find|findIndex|findLast|findLastIndex|some|every|flatMap|reduce|reduceRight|sort|toSorted';

const CODE_SELECTORS = [
  {
    selector: `ArrowFunctionExpression[body.type!='BlockStatement']:not(CallExpression[callee.property.name=/^(${ARRAY_METHODS})$/] > ArrowFunctionExpression.arguments)`,
    message:
      'Use a block body with an explicit return. One-line arrow functions are allowed only as callbacks for array methods (map, filter, find, some, every, reduce, ...).',
  },
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'Never use dangerouslySetInnerHTML.',
  },
  {
    selector: 'Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]/]',
    message: 'No hex colours in class strings. Use a token from src/index.css.',
  },
  {
    selector: 'ExportDefaultDeclaration',
    message: 'Use a named export.',
  },
];

// Test fixtures render throwaway markers, not user-facing copy.
const COPY_SELECTORS = [
  {
    selector: 'JSXText[value=/\\p{L}/u]',
    message: 'No hard-coded copy. Every string goes through i18n.',
  },
  {
    selector:
      'JSXAttribute[name.name=/^(aria-label|placeholder|title|alt)$/] > Literal[value=/\\p{L}/u]',
    message: 'No hard-coded copy in attributes. Every string goes through i18n.',
  },
];

export default defineConfig([
  globalIgnores(['dist/', 'node_modules/', 'src/components/ui/']),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
      pluginQuery.configs['flat/recommended'],
      reactRefresh.configs.vite,
    ],
    plugins: { 'simple-import-sort': simpleImportSort },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['interface', 'typeAlias'],
          format: ['PascalCase'],
          custom: { regex: '^[IT][A-Z]', match: false },
        },
      ],
      'max-lines': ['error', { max: 300 }],
      'max-params': ['error', 3],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-restricted-syntax': ['error', ...CODE_SELECTORS, ...COPY_SELECTORS],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'All requests go through src/api/.' },
        { name: 'confirm', message: 'Confirmations use a dialog.' },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'window', property: 'confirm', message: 'Confirmations use a dialog.' },
        { object: 'window', property: 'fetch', message: 'All requests go through src/api/.' },
      ],
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    extends: [vitest.configs.recommended],
    rules: {
      'no-restricted-syntax': ['error', ...CODE_SELECTORS],
    },
  },
  {
    files: ['src/**/*.ts'],
    // A hand-written return type on a queryOptions factory drops the inferred DataTag that
    // types getQueryData/setQueryData by key, so these stay inferred.
    ignores: ['src/queries/**'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { name: 'axios', message: 'All requests go through src/api/.' },
      ],
    },
  },
]);
