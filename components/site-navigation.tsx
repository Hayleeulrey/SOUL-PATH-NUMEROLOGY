"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function SiteNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2 rounded-full bg-[#4F5D4E] text-white hover:bg-[#4F5D4E]/90">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <nav className="flex flex-col gap-6 mt-8">
          <Link href="/" className="text-xl font-light tracking-wide hover:text-[#E07A5F] transition-colors">
            Home
          </Link>
          <Link
            href="/sacred-science"
            className="text-xl font-light tracking-wide hover:text-[#E07A5F] transition-colors"
          >
            Sacred Science of Numerology
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

