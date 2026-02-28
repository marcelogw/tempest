import bundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'
import { readFileSync, existsSync } from 'fs'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withNextIntl = createNextIntlPlugin()

// Read tempest.config.yml for adapter configuration
function readTempestConfig() {
  const cfgPath = './tempest.config.yml'
  if (!existsSync(cfgPath)) return { storage: 'local', auth: 'none' }

  const content = readFileSync(cfgPath, 'utf8')
  const cfg = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('#') || !trimmed.includes(':')) continue
    const colonIdx = trimmed.indexOf(':')
    const key = trimmed.slice(0, colonIdx).trim()
    const value = trimmed.slice(colonIdx + 1).trim()
    if (key && value) cfg[key] = value
  }
  return cfg
}

const tempestCfg = readTempestConfig()

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_TEMPEST_STORAGE: process.env.TEMPEST_STORAGE ?? tempestCfg.storage ?? 'local',
    NEXT_PUBLIC_TEMPEST_AUTH: process.env.TEMPEST_AUTH ?? tempestCfg.auth ?? 'none',
  },
  images: {
    unoptimized: true,
  },
  // Enable React strict mode for better development
  reactStrictMode: true,
  // Enable modern JavaScript features
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
}

export default withBundleAnalyzer(withNextIntl(nextConfig))
