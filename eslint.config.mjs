import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const ARRAY_METHODS =
  'map|filter|find|findIndex|findLast|findLastIndex|some|every|flatMap|reduce|reduceRight|sort|toSorted';

export default defineConfig([
  globalIgnores(['dist/', 'node_modules/', 'src/components/ui/']),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
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
      'no-restricted-syntax': [
        'error',
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
          selector: 'JSXText[value=/\\p{L}/u]',
          message: 'No hard-coded copy. Every string goes through i18n.',
        },
      ],
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
    files: ['src/**/*.ts'],
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
