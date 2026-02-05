import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
