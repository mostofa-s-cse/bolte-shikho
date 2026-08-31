import type { Metadata } from 'next'
import { Fraunces, Work_Sans, Hind_Siliguri } from 'next/font/google'
import '../globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import { LocaleProvider } from '@/lib/i18n/locale-context'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { locales, type Locale } from '@/lib/i18n/locale-routing'

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

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale: Locale = lang === 'en' ? 'en' : 'bn'
  const dict = await getDictionary()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${fraunces.variable} ${workSans.variable} ${hindSiliguri.variable} font-sans bg-surface text-ink antialiased`}
      >
        <LocaleProvider dict={dict} locale={locale}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SiteHeader />
            {children}
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
