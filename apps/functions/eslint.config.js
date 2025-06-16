import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ...eslint.configs.recommended,
  },
  ...tseslint.configs.recommended,
  globalIgnores(['**/node_modules/**', './dist/**', '**/build/**', '**/isolate/**']),
  {
      files: ['**/*.ts', '**/*.tsx'],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.json',
        },
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
      },
    },
  {
      files: ['**/*.js', '**/*.jsx'],
      languageOptions: {
        parserOptions: {
          sourceType: 'module',
        },
      },
  },
]);