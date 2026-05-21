import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/context/AuthContext'
import { Navbar } from '@/components/Navbar'
import { Providers } from '@/components/Providers'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'InternConnect - Connect Students with Career Opportunities',
  description: 'InternConnect bridges the gap between ambitious students and forward-thinking employers. Find internships, entry-level positions, and launch your career today.',
  icons: {
    icon: [
      {
        url: '/IC_logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/IC_logo.png',
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

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen">
        <Providers>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
