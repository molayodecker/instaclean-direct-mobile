// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    // Existing form hydration effects intentionally synchronize editable local state
    // with asynchronously loaded records. Keep visible warnings while modernizing.
    rules: { 'react-hooks/set-state-in-effect': 'warn' },
  }
]);
