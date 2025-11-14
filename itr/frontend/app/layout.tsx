import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import LoadingProvider from '@/components/LoadingProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit'
})

export const metadata: Metadata = {
  title: 'Tax Genie - File Your Taxes Easily',
  description: 'AI-powered tax filing platform for Indian taxpayers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <ThemeProvider defaultTheme="light">
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
