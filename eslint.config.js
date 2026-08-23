// @ts-check
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'allure-results/**',
      'allure-report/**',
      'reports/**',
      'screenshots/**',
      'logs/**',
      'apps/**',
    ],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      // TypeScript's own compiler (see `npm run typecheck`) already catches
      // undefined-identifier errors, and does so correctly for ambient
      // globals (`browser`, `driver`, `$`, `$$`, `WebdriverIO`, Node's
      // `process`/`console`, ...) that ESLint's static `no-undef` cannot see.
      // This is the configuration typescript-eslint itself recommends.
      'no-undef': 'off',
    },
  },
  {
    // Chai's BDD assertions (`expect(x).to.be.true`) are property-access
    // expressions with side effects, which trip up `no-unused-expressions`.
    // Scoped to specs only so the rule still catches real mistakes elsewhere.
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  prettierConfig,
];
