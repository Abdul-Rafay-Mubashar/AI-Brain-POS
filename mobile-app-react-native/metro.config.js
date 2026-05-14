const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Model files ki extensions ko allow karne ke liye
config.resolver.assetExts.push("bin", "json", "shard");

module.exports = config;
