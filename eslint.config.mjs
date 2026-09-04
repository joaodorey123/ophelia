import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

/**
 * Flat config. `eslint-config-next` ships native flat configs from v16, so no
 * FlatCompat shim is needed.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      // The original Claude Design handoff is preserved verbatim, not linted.
      'design-handoff/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

export default config;
