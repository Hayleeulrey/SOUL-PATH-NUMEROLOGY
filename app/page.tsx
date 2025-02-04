/* eslint-disable react/no-unescaped-entities */

import Image from "next/image"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { NumerologyCalculator } from "./numerology/numerology-calculator"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-32 pb-8">
        <div className="flex justify-center mb-12">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-idtKkvE7A9uVW1vnmYlpk7csKZgCry.png"
            alt="Lavender botanical illustration"
            width={200}
            height={200}
            className="opacity-80"
            priority
            unoptimized
          />
        </div>
        <p className="text-xl leading-relaxed text-[#4F5D4E] mb-8 max-w-3xl mx-auto text-center font-serif italic">
          Discover the divine patterns in your life through our faith-based numerology calculator. This powerful tool
          combines ancient wisdom with biblical insights, revealing the sacred numbers that shape your spiritual
          journey. Like the intricate symbolism in Tarot and the celestial guidance of astrology, numerology offers a
          unique perspective on your life&apos;s purpose. Our calculator provides personalized insights, drawing
          parallels between your numerological profile and scriptural references, helping you align with God&apos;s plan
          for your life.
        </p>

        <NumerologyCalculator />
      </main>
      <Footer />
    </div>
  )
}

