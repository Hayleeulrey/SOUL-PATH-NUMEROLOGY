"use client"

import Link from "next/link"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#F4F4F4] z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center">
          <Link href="/" className="text-[#333333] text-5xl tracking-wider font-light">
            SOUL PATH NUMEROLOGY
          </Link>
        </div>
      </div>
    </header>
  )
}

