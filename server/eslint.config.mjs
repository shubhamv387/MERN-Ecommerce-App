import globals from 'globals'
import tseslint from 'typescript-eslint'
import tsParser from '@typescript-eslint/parser'
import tseslintPlugin from '@typescript-eslint/eslint-plugin'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  prettierConfig,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,mjs}'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
      },
      globals: { ...globals.browser, ...globals.node, ...globals.jest },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
      prettier: eslintPluginPrettier,
    },
    rules: {
      eqeqeq: 1,
      'prettier/prettier': 1,
      '@typescript-eslint/no-unused-vars': [
        1,
        { vars: 'all', args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-var-requires': 1,
      '@typescript-eslint/no-namespace': 0,
      '@typescript-eslint/no-explicit-any': 0,
      // 'no-console': 1, // Uncomment if you want to warn on console statements
    },
  },
  {
    ignores: ['node_modules/**', '**/*.js'],
  },
]
