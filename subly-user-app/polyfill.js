import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto'
import { Buffer } from 'buffer'

global.Buffer = Buffer

// getRandomValues polyfill
class Crypto {
  getRandomValues = expoCryptoGetRandomValues
}

const webCrypto = typeof crypto !== 'undefined' ? crypto : new Crypto()

;(() => {
  if (typeof crypto === 'undefined') {
    Object.defineProperty(window, 'crypto', {
      configurable: true,
      enumerable: true,
      get: () => webCrypto,
    })
  }
})()

// structuredClone polyfill for React Native
if (!global.structuredClone) {
  global.structuredClone = function structuredClone(obj) {
    // Simple deep clone implementation
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime())
    }

    if (obj instanceof Array) {
      return obj.map((item) => structuredClone(item))
    }

    if (obj instanceof Buffer) {
      return Buffer.from(obj)
    }

    if (obj instanceof Uint8Array) {
      return new Uint8Array(obj)
    }

    if (typeof obj === 'object') {
      const cloned = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = structuredClone(obj[key])
        }
      }
      return cloned
    }

    return obj
  }
}
