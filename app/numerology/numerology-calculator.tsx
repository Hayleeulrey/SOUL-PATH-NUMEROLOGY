"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { InfoIcon } from "lucide-react"
import { calculateNumerology, MASTER_NUMBERS } from "./numerology-utils"
import type { NumerologyResult, NumerologyCategory } from "./types"
import {
  soulNumberDefinitions,
  destinyNumberDefinitions,
  outerPersonalityNumberDefinitions,
  lifeLessonNumberDefinitions,
  personalNumberVibrationDefinitions,
} from "./numerology-definitions"

export function NumerologyCalculator() {
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [result, setResult] = useState<NumerologyResult | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (firstName && middleName && lastName && birthdate) {
      const results = calculateNumerology(firstName, middleName, lastName, birthdate)
      setResult(results)
    }
  }

  const isMasterNumber = (number: string) => {
    const [original] = number.split("/")
    return MASTER_NUMBERS.has(Number.parseInt(original))
  }

  const getCategoryDescription = (type: NumerologyCategory): string => {
    switch (type) {
      case "soulNumber":
        return "This is what you already are."
      case "outerPersonality":
        return "This is how others see you."
      case "destinyNumber":
        return "This is what you must do."
      case "lifeLesson":
        return "This is what you must learn."
    }
  }

  const getDefinitionContent = (type: NumerologyCategory, result: NumerologyResult) => {
    const [original, reduced] = result[type].result.split("/")
    const definition =
      type === "soulNumber"
        ? soulNumberDefinitions[reduced]
        : type === "outerPersonality"
          ? outerPersonalityNumberDefinitions[reduced]
          : type === "destinyNumber"
            ? destinyNumberDefinitions[reduced]
            : lifeLessonNumberDefinitions[reduced]

    const personalVibration = personalNumberVibrationDefinitions[original]

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">{result[type].calculation}</div>
        <div className="space-y-2">
          <h4 className="font-semibold text-[#4F5D4E]">
            Single Delineation: {reduced} AS THE{" "}
            {type === "soulNumber"
              ? "SOUL NUMBER"
              : type === "outerPersonality"
                ? "OUTER PERSONALITY NUMBER"
                : type === "destinyNumber"
                  ? "PATH OF DESTINY NUMBER"
                  : "LIFE LESSON NUMBER"}
          </h4>
          <p className="text-sm">{definition?.meaning}</p>
          {definition?.biblicalReference && (
            <p className="text-sm italic text-gray-600">Biblical Reference: {definition.biblicalReference}</p>
          )}
        </div>

        {personalVibration && (
          <div className="space-y-2">
            <h4 className="font-semibold text-[#4F5D4E]">
              Double Delineation: {original}/{reduced} AS A PERSONAL NUMBER VIBRATION
            </h4>
            <p className="text-sm">{personalVibration.meaning}</p>
            {personalVibration.biblicalReference && (
              <p className="text-sm italic text-gray-600">Biblical Reference: {personalVibration.biblicalReference}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold text-[#4F5D4E]">Spiritual Associations</h4>
          <div className="space-y-1">
            <p className="text-sm">
              <strong>Tarot:</strong> {getTarotAssociation(reduced)}
            </p>
            <p className="text-sm">
              <strong>Astrology:</strong> {getAstrologyAssociation(reduced)}
            </p>
          </div>
        </div>

        {isMasterNumber(result[type].result) && (
          <Alert className="mt-2 bg-[#E07A5F] text-white border-[#4F5D4E]">
            <AlertTitle className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              Master Number
            </AlertTitle>
            <AlertDescription>
              This is a Master Number, indicating heightened spiritual potential and greater challenges.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  const getTarotAssociation = (number: string): string => {
    const tarotAssociations: { [key: string]: string } = {
      "1": "The Magician - Manifestation and self-empowerment",
      "2": "The High Priestess - Intuition and inner wisdom",
      "3": "The Empress - Creativity and abundance",
      "4": "The Emperor - Structure and authority",
      "5": "The Hierophant - Spiritual guidance and tradition",
      "6": "The Lovers - Harmony and relationships",
      "7": "The Chariot - Willpower and determination",
      "8": "Strength - Courage and inner power",
      "9": "The Hermit - Wisdom and spiritual enlightenment",
    }
    return tarotAssociations[number] || ""
  }

  const getAstrologyAssociation = (number: string): string => {
    const astrologyAssociations: { [key: string]: string } = {
      "1": "Aries energy - Leadership and initiation",
      "2": "Cancer energy - Nurturing and sensitivity",
      "3": "Sagittarius energy - Expression and optimism",
      "4": "Capricorn energy - Structure and stability",
      "5": "Gemini/Aquarius energy - Freedom and change",
      "6": "Taurus/Libra energy - Harmony and beauty",
      "7": "Pisces energy - Spirituality and mysticism",
      "8": "Scorpio energy - Power and transformation",
      "9": "Leo energy - Completion and humanitarianism",
    }
    return astrologyAssociations[number] || ""
  }

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg">
        <CardHeader className="bg-[#4F5D4E] text-white">
          <CardTitle className="text-2xl">Calculate Your Numerology Numbers</CardTitle>
          <CardDescription className="text-white/90">
            Enter your full name at birth and birthdate to discover your personal numbers.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6 bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#333333]">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="border-[#4F5D4E] focus:ring-[#4F5D4E] bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName" className="text-[#333333]">
                Middle Name
              </Label>
              <Input
                id="middleName"
                type="text"
                placeholder="Enter your middle name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                required
                className="border-[#4F5D4E] focus:ring-[#4F5D4E] bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#333333]">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="border-[#4F5D4E] focus:ring-[#4F5D4E] bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdate" className="text-[#333333]">
                Birthdate
              </Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
                className="border-[#4F5D4E] focus:ring-[#4F5D4E] bg-white"
              />
            </div>
            <Button type="submit" className="w-full bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white">
              Calculate
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg">
          <CardHeader className="bg-[#4F5D4E] text-white">
            <CardTitle className="text-2xl">Your Numerology Numbers</CardTitle>
            <CardDescription className="text-white/90">
              Numerology calculation for {firstName} {middleName} {lastName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 bg-white p-6">
            <Accordion type="single" collapsible>
              {(["soulNumber", "outerPersonality", "destinyNumber", "lifeLesson"] as const).map((type) => (
                <AccordionItem key={type} value={type}>
                  <AccordionTrigger className="flex flex-col items-start">
                    <div>
                      {type === "soulNumber"
                        ? "Soul Number"
                        : type === "outerPersonality"
                          ? "Outer Personality Number"
                          : type === "destinyNumber"
                            ? "Path of Destiny Number"
                            : "Life Lesson Number"}
                      : {result[type].result}
                    </div>
                    <div className="text-sm font-medium text-[#E07A5F] mt-1">{getCategoryDescription(type)}</div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 bg-white rounded-lg">{getDefinitionContent(type, result)}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Alert className="bg-[#4F5D4E] text-white border-[#4F5D4E]">
              <AlertTitle className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4" />
                What are Master Numbers?
              </AlertTitle>
              <AlertDescription>
                Master Numbers (11, 22, and 33) are considered to have a higher spiritual meaning and potential in
                numerology. They often indicate a greater capacity for learning, achievement, and spiritual growth, but
                may also bring increased challenges and responsibilities. When a Master Number appears in your
                numerology chart, it suggests areas of life where you may experience both significant opportunities and
                obstacles.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

