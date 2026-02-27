import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/e2e/**', // Exclude E2E tests (run with Playwright)
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
        '**/e2e/**',
        '**/components/ui/**', // shadcn/ui components
        '**/*.config.{js,ts,mjs}',
        '**/vitest.setup.ts',
        '**/*.d.ts',
        '**/lib/workspace-client.ts',
        '**/lib/write-queue.ts',
        '**/lib/lambda-client.ts',
        '**/lib/amplify-config.ts',
        '**/lib/use-amplify-data.ts',
        '**/lib/migrations.ts',
        '**/lib/sync-store.ts',
        '**/lib/hooks/**',
        '**/components/workspace/**',
        '**/components/amplify-provider.tsx',
        '**/components/debug/**',
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
