// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable package exports resolution so ESM `.mjs` files containing `import.meta.env`
// (such as `zustand/esm/*.mjs`) resolve to CommonJS `.js` on Expo Web.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
