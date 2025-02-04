export type NumerologyCategory = "soulNumber" | "outerPersonality" | "destinyNumber" | "lifeLesson"

export interface NumerologyCalculation {
  result: string
  calculation: string
}

export interface NumerologyResult {
  soulNumber: NumerologyCalculation
  outerPersonality: NumerologyCalculation
  destinyNumber: NumerologyCalculation
  lifeLesson: NumerologyCalculation
  [key: string]: NumerologyCalculation // Add index signature
}

