// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Force Zustand v5 to resolve its CommonJS `.js` entrypoints instead of `.mjs`
// (which contain `import.meta.env` and fail inside Metro's Web `eval`),
// while keeping package exports enabled for `@expo/log-box` and `expo-router`.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
    return context.resolveRequest(
      {
        ...context,
        unstable_conditionNames: ['require', 'default'],
      },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
