import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react" // Import React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Numerology Insights",
  description: "Discover your personal numerology numbers and their meanings",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-[#F4F4F4]">
      <body className={`${inter.className} bg-[#F4F4F4]`}>{children}</body>
    </html>
  )
}

