import type { Metadata } from 'next'
import { Fraunces, Work_Sans, Hind_Siliguri } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display-raw',
  weight: ['500', '600', '700'],
})

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-sans-raw',
  weight: ['400', '500', '600', '700'],
})

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  variable: '--font-bengali-raw',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Bolte Shikho',
  description: 'Spoken English learning platform for Bangla speakers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${fraunces.variable} ${workSans.variable} ${hindSiliguri.variable} font-sans bg-surface text-ink antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
