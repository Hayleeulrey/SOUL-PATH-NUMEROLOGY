export type NumerologyCategory = "soulNumber" | "outerPersonality" | "destinyNumber" | "lifeLesson"
export type NameField = "firstName" | "middleName" | "lastName"

export interface NumerologyCalculation {
  result: string
  calculation: string
}

export interface NumerologyResult {
  soulNumber: NumerologyCalculation
  outerPersonality: NumerologyCalculation
  destinyNumber: NumerologyCalculation
  lifeLesson: NumerologyCalculation
}

export interface YPosition {
  nameField: NameField
  position: number
  isVowel: boolean
}

