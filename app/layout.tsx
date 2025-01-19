import './globals.css'
import { Inter } from 'next/font/google'
import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Automation Consulting LLC',
  description: 'Custom financial dashboards for your business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-900`}>
        <Header />
        <main className="container mx-auto py-20 px-4 mt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

