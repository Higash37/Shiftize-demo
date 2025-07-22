const tseslint = require('typescript-eslint');
const globals = require('globals');
const reactPlugin = require('eslint-plugin-react');
const reactNativePlugin = require('eslint-plugin-react-native');

module.exports = tseslint.config(
  {
    ignores: [
      "node_modules/",
      ".expo/",
      "dist/",
      "android/",
      "ios/",
      "babel.config.js",
      "metro.config.cjs",
      "eslint.config.js",
      "server.js",
      "update-imports.js",
      "public/",
      "scripts/",
      ".github/",
      ".vscode/",
      "index.js",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-native': reactNativePlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        '__DEV__': 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      }
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactNativePlugin.configs.all.rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'off',
      'react-native/no-color-literals': 'off',
      'react-native/sort-styles': 'off',
      'react-native/no-raw-text': 'off', // Often has false positives
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
);
