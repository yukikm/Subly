const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Add support for more file extensions
config.resolver.assetExts.push('json')

// Add resolver for Node.js modules
config.resolver.resolverMainFields = ['react-native', 'browser', 'main']

// Add node_modules polyfills for Anchor
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: 'expo-crypto',
  stream: 'readable-stream',
  buffer: 'buffer',
}

module.exports = config
