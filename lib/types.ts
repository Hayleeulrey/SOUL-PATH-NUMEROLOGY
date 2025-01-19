export type Period = 'YTD' | 'QTD' | 'MTD'

export interface MonthlyData {
  month: string
  revenue: number
  income: number
  expenses: number
}

export interface Metrics {
  totalRevenue: number
  netIncome: number
  cashOnHand: number
  expenseRatio: number
}

export interface MockData {
  revenueData: MonthlyData[]
  incomeStatementData: MonthlyData[]
  metrics: Metrics
}

