module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  ignorePatterns: ['dist', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'eol-last': ['error', 'always'],
    'no-restricted-syntax': [
    'error',
      {
        selector: "MemberExpression[property.name='innerHTML']",
        message: 'Не используй innerHTML с пользовательскими данными. Используй textContent или escapeHtml.',
      },
    ],
  },
  overrides: [
    {
      files: ['vite.config.ts'],
      env: { node: true },
    },
    {
      files: ['src/core/block.ts', '**/*.test.ts'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],  
};
