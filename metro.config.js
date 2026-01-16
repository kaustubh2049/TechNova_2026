const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Use fewer workers to reduce memory usage on Windows
config.maxWorkers = 2;

module.exports = config;
