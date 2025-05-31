// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const { withNativeWind } = require('nativewind/metro');

// 1) Load the base Expo/React‐Native Metro config:
let config = getDefaultConfig(__dirname);

// 2) Tell Metro that whenever it sees require("ws") or require("https")
//    (or other Node‐only modules), it should point to the emptyShim.js file
//    in our project root.
config.resolver = {
  ...config.resolver,

  extraNodeModules: {
    ...(config.resolver.extraNodeModules || {}),

    // Map "ws" → emptyShim.js
    ws: path.resolve(__dirname, "emptyShim.js"),

    // Map "https" → emptyShim.js
    https: path.resolve(__dirname, "emptyShim.js"),

    // You can also stub out any other Node modules that keep causing errors:
    // For example, if you see "stream" errors next:
    stream: path.resolve(__dirname, "emptyShim.js"),
    // If you ever see "net" errors:
    net: path.resolve(__dirname, "emptyShim.js"),
    // And so on for tls, crypto, dns, etc., if they pop up:
    tls: path.resolve(__dirname, "emptyShim.js"),
    crypto: path.resolve(__dirname, "emptyShim.js"),
    dns: path.resolve(__dirname, "emptyShim.js"),
  },

  // We already added "cjs" for any CommonJS files that Metro needs to handle:
  sourceExts: [...config.resolver.sourceExts, "cjs"],

  unstable_enablePackageExports: false,
  unstable_conditionNames: ['browser', 'require', 'default'],
};

config = withNativeWind(config, { input: './global.css' });

module.exports = config;