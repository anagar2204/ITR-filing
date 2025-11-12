import { ThemeProvider } from '@/components/ThemeProvider'

export default function ITRLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ThemeProvider>{children}</ThemeProvider>
}
