'use client'

import { Amplify } from 'aws-amplify'

/**
 * Configure AWS Amplify for client-side usage
 * This should be called once at the root of the application
 *
 * Note: The amplify_outputs.json file is generated when you run:
 * npx ampx sandbox
 *
 * Until then, Amplify will not be configured and auth features will not work.
 *
 * @returns true if Amplify was configured successfully, false otherwise
 */
export function configureAmplify(): boolean {
  try {
    // Dynamic import to avoid build errors when amplify_outputs.json doesn't exist
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const outputs = require('@/amplify_outputs.json')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Amplify.configure(outputs, {
      ssr: true, // Enable SSR support for Next.js
    })
    // eslint-disable-next-line no-console
    console.log('✅ Amplify configured successfully')
    return true
  } catch {
    console.warn('⚠️ Amplify configuration not found. App will run without sync features.')
    // Amplify will not be configured, but the app won't crash
    return false
  }
}
