import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SacredSciencePage() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
      <h1 className="text-4xl font-light text-center mb-8 text-[#333333]">THE SACRED SCIENCE OF NUMEROLOGY</h1>

      <div className="prose prose-lg mx-auto">
        <p className="text-[#666666] text-lg italic mb-12 font-serif text-center">
          Discover the divine language of numbers, where ancient wisdom meets spiritual truth, revealing the sacred
          patterns that connect us to the universe and our higher purpose.
        </p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is-numerology">
            <AccordionTrigger className="text-xl text-[#4F5D4E]">What is Numerology?</AccordionTrigger>
            <AccordionContent className="text-[#666666] space-y-4">
              <p>
                Numerology is the ancient metaphysical science of numbers, a sacred system that reveals the underlying
                patterns, vibrations, and energies that shape our existence. This divine practice recognizes that
                numbers are not merely mathematical symbols but carry spiritual significance and cosmic wisdom.
              </p>
              <p>
                Each number possesses its own unique vibration and spiritual essence, offering insights into our life
                path, personality, relationships, and divine purpose. Through numerology, we can decode these sacred
                messages and better understand our spiritual journey.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="biblical-significance">
            <AccordionTrigger className="text-xl text-[#4F5D4E]">Biblical Significance of Numbers</AccordionTrigger>
            <AccordionContent className="text-[#666666] space-y-4">
              <p>
                Throughout scripture, numbers carry profound spiritual significance. From the seven days of creation to
                the twelve disciples, numbers in the Bible reveal divine patterns and spiritual truths. This connection
                between numerology and biblical wisdom helps us understand God's divine plan and our place within it.
              </p>
              <p>Key Biblical Number Meanings:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>One (1): Unity, primacy, God's supremacy</li>
                <li>Three (3): Divine perfection, the Trinity</li>
                <li>Seven (7): Spiritual completion, divine perfection</li>
                <li>Twelve (12): Divine government, apostolic fullness</li>
                <li>Forty (40): Times of testing, trial, and triumph</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="calculations">
            <AccordionTrigger className="text-xl text-[#4F5D4E]">Understanding the Calculations</AccordionTrigger>
            <AccordionContent className="text-[#666666] space-y-4">
              <p>Our numerology calculator uses these core methods to derive your numbers:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Soul Number:</strong> Calculated from the vowels in your name, revealing your inner desires
                  and spiritual urges
                </li>
                <li>
                  <strong>Outer Personality Number:</strong> Derived from consonants, showing how others perceive you
                </li>
                <li>
                  <strong>Destiny Number:</strong> Combines Soul and Personality numbers, indicating your life's purpose
                </li>
                <li>
                  <strong>Life Lesson Number:</strong> Calculated from your birth date, revealing key life lessons and
                  challenges
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="spiritual-connections">
            <AccordionTrigger className="text-xl text-[#4F5D4E]">Connections to Tarot & Astrology</AccordionTrigger>
            <AccordionContent className="text-[#666666] space-y-4">
              <p>Numerology shares profound connections with other spiritual practices:</p>
              <h3 className="font-semibold mt-4">Tarot Connection</h3>
              <p>
                The Major Arcana cards (1-22) correspond directly with numerological vibrations, offering deeper
                insights into life's spiritual lessons. For example, The Magician (Card 1) connects with the number 1's
                themes of creation and new beginnings.
              </p>
              <h3 className="font-semibold mt-4">Astrological Alignment</h3>
              <p>Each planet in astrology resonates with specific numbers:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sun: 1 - Identity and purpose</li>
                <li>Moon: 2 - Emotions and intuition</li>
                <li>Jupiter: 3 - Growth and expansion</li>
                <li>Uranus: 4 - Innovation and breakthrough</li>
                <li>Mercury: 5 - Communication and adaptability</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="master-numbers">
            <AccordionTrigger className="text-xl text-[#4F5D4E]">Master Numbers & Their Significance</AccordionTrigger>
            <AccordionContent className="text-[#666666] space-y-4">
              <p>Master Numbers (11, 22, and 33) carry special spiritual significance:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>11:</strong> The Spiritual Messenger - Intuition and spiritual enlightenment
                </li>
                <li>
                  <strong>22:</strong> The Master Builder - Turning dreams into reality on a large scale
                </li>
                <li>
                  <strong>33:</strong> The Master Teacher - Spiritual guidance and selfless service
                </li>
              </ul>
              <p>
                These numbers represent higher spiritual potentials and greater challenges, calling their bearers to
                significant spiritual work and service to humanity.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

