import type { Metadata } from 'next'
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Atestado Escolar',
  description: 'Sistema de Gestão de Atestados Acadêmicos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
