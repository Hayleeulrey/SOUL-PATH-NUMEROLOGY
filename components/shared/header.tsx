'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"

export function Header() {
  const pathname = usePathname()

  const isActivePath = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname?.startsWith(path)) return true
    return false
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 shadow-md z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex flex-col items-start">
            <span className="text-xl font-bold text-teal-400">DashPro</span>
            <span className="text-xs text-white">Driving Decisions with Precision</span>
          </Link>
          <nav className="flex items-center">
            <ul className="flex space-x-6 mr-6">
              <li>
                <Link 
                  href="/"
                  className={isActivePath('/') ? "text-teal-400 border-b-2 border-teal-400 pb-1" : "text-gray-300 hover:text-teal-400 transition-colors"}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing"
                  className={isActivePath('/pricing') ? "text-teal-400 border-b-2 border-teal-400 pb-1" : "text-gray-300 hover:text-teal-400 transition-colors"}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="/about"
                  className={isActivePath('/about') ? "text-teal-400 border-b-2 border-teal-400 pb-1" : "text-gray-300 hover:text-teal-400 transition-colors"}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className={isActivePath('/contact') ? "text-teal-400 border-b-2 border-teal-400 pb-1" : "text-gray-300 hover:text-teal-400 transition-colors"}
                >
                  Contact
                </Link>
              </li>
            </ul>
            <Button 
              asChild
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors duration-300 transform hover:scale-105"
            >
              <Link href="/demo">
                Demo Now!
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}