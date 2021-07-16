module.exports = {
  root: true,
  extends: ['airbnb-typescript/base', 'prettier'],

  parserOptions: {
    extraFileExtensions: ['.cjs'],
    sourceType: 'module',
    ecmaVersion: 2020,
    project: './tsconfig.eslint.json',
  },

  plugins: ['ext'],

  env: {
    browser: true,
    node: true,
  },

  rules: {
    'ext/lines-between-object-properties': ['error', 'always', { exceptBetweenSingleLines: true }],

    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
  },
}
