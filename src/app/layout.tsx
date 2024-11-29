import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://sleeper-nba-dashboard.vercel.app'),
  title: 'WOGEL Dashboard',
  description: 'Version 0.0.2 Cleaner dashboard and player research tabs!',
  openGraph: {
    title: 'WOGEL Dashboard',
    description: 'Version 0.0.2 Cleaner dashboard and player research tabs!',
    images: [
      {
        url: '/og-image.jpeg', 
        width: 1200,
        height: 630,
        alt: 'WOGEL Dashboard Preview'
      }
    ],
    type: 'website',
    url: 'https://sleeper-nba-dashboard.vercel.app'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WOGEL Dashboard',
    description: 'Version 0.0.2 Cleaner dashboard and player research tabs!',
    images: ['/og-image.jpeg']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
