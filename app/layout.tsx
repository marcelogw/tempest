import type { Metadata, Viewport } from 'next'
import { Inter, Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { AmplifyProvider } from '@/components/amplify-provider'
import { DataSourceIndicator } from '@/components/debug/data-source-indicator'
import { SyncStatusBadge } from '@/components/ui/sync-status-badge'
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

export const metadata: Metadata = {
  title: 'Tempest - Gerenciamento de Despesas',
  description: 'Acompanhe suas receitas, despesas, investimentos e economia com facilidade',
  generator: 'v0.app',
  keywords: [
    'gerenciamento de despesas',
    'controle financeiro',
    'orçamento pessoal',
    'finanças pessoais',
    'investimentos',
    'economia',
  ],
  authors: [{ name: 'Tempest' }],
  creator: 'Tempest',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://tempest.app',
    title: 'Tempest - Gerenciamento de Despesas',
    description: 'Acompanhe suas receitas, despesas, investimentos e economia com facilidade',
    siteName: 'Tempest',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tempest - Gerenciamento de Despesas',
    description: 'Acompanhe suas receitas, despesas, investimentos e economia com facilidade',
  },
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${nunito.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AmplifyProvider>
            {children}
            <DataSourceIndicator />
            <SyncStatusBadge />
          </AmplifyProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
