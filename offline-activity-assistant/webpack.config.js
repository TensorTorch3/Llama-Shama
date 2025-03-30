const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add polyfills for web compatibility
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-webview': 'react-native-web-webview',
  };

  // Fix React Native AbortController for web
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "abort-controller": require.resolve("abort-controller/"),
  };

  return config;
};
