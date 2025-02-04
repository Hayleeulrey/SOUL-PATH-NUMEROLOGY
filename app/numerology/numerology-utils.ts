import type { NumerologyResult } from "./types"

// Letter to number conversion table
const LETTER_VALUES: { [key: string]: number } = {
  A: 1,
  J: 1,
  S: 1,
  B: 2,
  K: 2,
  T: 2,
  C: 3,
  L: 3,
  U: 3,
  D: 4,
  M: 4,
  V: 4,
  E: 5,
  N: 5,
  W: 5,
  F: 6,
  O: 6,
  X: 6,
  G: 7,
  P: 7,
  Y: 7,
  H: 8,
  Q: 8,
  Z: 8,
  I: 9,
  R: 9,
}

export const MASTER_NUMBERS = new Set([11, 22, 33])

function isVowel(char: string): boolean {
  return ["A", "E", "I", "O", "U"].includes(char.toUpperCase())
}

function reduceNumber(num: number): { reduced: number; original: number } {
  if (num <= 9) return { reduced: num, original: num }
  if (MASTER_NUMBERS.has(num)) return { reduced: num, original: num }
  if (num > 78) {
    const sum = num
      .toString()
      .split("")
      .reduce((acc, digit) => acc + Number.parseInt(digit), 0)
    return reduceNumber(sum)
  }
  const digits = num.toString().split("").map(Number)
  const firstReduction = digits[0] + digits[1]
  if (firstReduction > 9 && !MASTER_NUMBERS.has(firstReduction)) {
    const finalDigits = firstReduction.toString().split("").map(Number)
    return { reduced: finalDigits[0] + finalDigits[1], original: num }
  }
  return { reduced: firstReduction, original: num }
}

function calculateLetterValue(char: string): number {
  return LETTER_VALUES[char.toUpperCase()] || 0
}

function calculateSoulNumber(
  firstName: string,
  middleName: string,
  lastName: string,
): { result: string; calculation: string } {
  const fullName = `${firstName} ${middleName} ${lastName}`
  const vowels = fullName
    .toUpperCase()
    .split("")
    .filter((char) => isVowel(char))
  const values = vowels.map((v) => calculateLetterValue(v))
  const total = values.reduce((sum, val) => sum + val, 0)
  const { reduced, original } = reduceNumber(total)
  return {
    result: `${original}/${reduced}`,
    calculation: `Vowels (${vowels.join(", ")}) = ${values.join(" + ")} = ${total} → ${original}/${reduced}`,
  }
}

function calculateOuterPersonality(
  firstName: string,
  middleName: string,
  lastName: string,
): { result: string; calculation: string } {
  const fullName = `${firstName} ${middleName} ${lastName}`
  const consonants = fullName
    .toUpperCase()
    .split("")
    .filter((char) => !isVowel(char) && char !== " ")
  const values = consonants.map((c) => calculateLetterValue(c))
  const total = values.reduce((sum, val) => sum + val, 0)
  const { reduced, original } = reduceNumber(total)
  return {
    result: `${original}/${reduced}`,
    calculation: `Consonants (${consonants.join(", ")}) = ${values.join(" + ")} = ${total} → ${original}/${reduced}`,
  }
}

function calculateDestinyNumber(soulNumber: string, outerPersonality: string): { result: string; calculation: string } {
  const soulValue = Number.parseInt(soulNumber.split("/")[0])
  const personalityValue = Number.parseInt(outerPersonality.split("/")[0])
  const total = soulValue + personalityValue
  const { reduced, original } = reduceNumber(total)
  return {
    result: `${original}/${reduced}`,
    calculation: `Soul (${soulNumber}) + Outer Personality (${outerPersonality}) = ${total} → ${original}/${reduced}`,
  }
}

function calculateLifeLesson(birthdate: string): { result: string; calculation: string } {
  const [year, month, day] = birthdate.split("-").map(Number)
  const yearDigits = year.toString().split("").map(Number)
  const yearSum = yearDigits.reduce((sum, digit) => sum + digit, 0)
  const total = month + day + yearSum
  const { reduced, original } = reduceNumber(total)
  return {
    result: `${original}/${reduced}`,
    calculation: `${month} + ${day} + (${yearDigits.join("+")}) = ${total} → ${original}/${reduced}`,
  }
}

export function calculateNumerology(
  firstName: string,
  middleName: string,
  lastName: string,
  birthdate: string,
): NumerologyResult {
  const soulNumber = calculateSoulNumber(firstName, middleName, lastName)
  const outerPersonality = calculateOuterPersonality(firstName, middleName, lastName)
  const destinyNumber = calculateDestinyNumber(soulNumber.result, outerPersonality.result)
  const lifeLesson = calculateLifeLesson(birthdate)

  return {
    soulNumber,
    outerPersonality,
    destinyNumber,
    lifeLesson,
  }
}

