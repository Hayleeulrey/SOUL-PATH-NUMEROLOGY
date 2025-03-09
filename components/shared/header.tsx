import Link from "next/link"
import { SiteNavigation } from "@/components/site-navigation"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#F4F4F4] z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex-1" /> {/* Spacer */}
        <Link href="/" className="text-[#333333] text-2xl tracking-wider font-light">
          SOUL PATH NUMEROLOGY
        </Link>
        <div className="flex-1 flex justify-end">
          <SiteNavigation />
        </div>
      </div>
    </header>
  )
}

