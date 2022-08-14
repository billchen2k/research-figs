module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'google',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'require-jsdoc': 'warn',
    'max-len': 'warn',
    'no-unused-vars': 'warn',
    'spaced-comment': 'warn',
    'valid-jsdoc': 'warn',
    'no-invalid-this': 'warn',
    'camelcase': 'warn',
  },
  settings: {
    'import/resolver': {
      // Allow `@/` to map to `src/`
      alias: {
        map: [
          ['@', './src'],
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
  },
  ignorePatterns: ['templates/**'],
};
