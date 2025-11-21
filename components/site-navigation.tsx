"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function SiteNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] bg-white">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <nav className="flex flex-col gap-8 mt-8">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-xl font-light tracking-wide text-gray-900 hover:text-gray-600 transition-colors"
            >
              Numerology Calculator
            </Link>
            <Link
              href="/sacred-science"
              className="text-xl font-light tracking-wide text-gray-900 hover:text-gray-600 transition-colors"
            >
              Sacred Science Guide
            </Link>
            <Link
              href="/lineage"
              className="text-xl font-light tracking-wide text-gray-900 hover:text-gray-600 transition-colors"
            >
              Lineage Directory
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

