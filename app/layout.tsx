import type { Metadata, Viewport } from 'next'
import { Inter, Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { ThemeProvider } from '@/components/theme-provider'
import { AmplifyProvider } from '@/components/amplify-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800'],
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()

  const localizedMetadata = {
    en: {
      title: 'Tempest - Expense Management',
      description: 'Track your income, expenses, investments and savings with ease',
    },
    pt: {
      title: 'Tempest - Gerenciamento de Despesas',
      description: 'Acompanhe suas receitas, despesas, investimentos e economia com facilidade',
    },
  }

  const meta = localizedMetadata[locale as keyof typeof localizedMetadata] || localizedMetadata.pt

  return {
    title: {
      template: '%s | ' + meta.title,
      default: meta.title,
    },
    description: meta.description,
    generator: 'v0.app',
    keywords: [
      'expense management',
      'financial control',
      'personal budget',
      'personal finances',
      'investments',
      'savings',
    ],
    authors: [{ name: 'Tempest' }],
    creator: 'Tempest',
    icons: {
      icon: [
        {
          url: '/icon-light-32x32.jpg',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: '/icon-dark-32x32.jpg',
          media: '(prefers-color-scheme: dark)',
        },
        {
          url: '/icon.svg',
          type: 'image/svg+xml',
        },
      ],
      apple: '/apple-icon.jpg',
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const messages = await getMessages()

  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} ${nunito.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AmplifyProvider>{children}</AmplifyProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
