// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure CommonJS resolution is preferred over ESM `.mjs` files that use `import.meta.env` (e.g. Zustand v5 on Web)
config.resolver.unstable_conditionNames = ['require', 'default', 'browser'];

module.exports = config;
