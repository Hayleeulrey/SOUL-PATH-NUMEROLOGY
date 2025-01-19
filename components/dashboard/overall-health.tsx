"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateMockData } from '@/lib/generate-mock-data'

type OverallHealthProps = {
  plan: 'basic' | 'pro' | 'nonprofit'
}

type Period = 'YTD' | 'QTD' | 'MTD'

export function OverallHealth({ plan }: OverallHealthProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('YTD')

  const data = useMemo(() => generateMockData(selectedPeriod), [selectedPeriod])

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex items-center gap-2 bg-[#2d2d2d] p-4 rounded-lg border border-gray-800">
        <span className="text-sm text-gray-300">Period:</span>
        <Select defaultValue={selectedPeriod} onValueChange={(value: Period) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-[200px] bg-[#1f1f1f] border-gray-700 text-gray-300">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent className="bg-[#1f1f1f] border-gray-700">
            <SelectItem value="YTD" className="text-gray-300 hover:bg-gray-800">Year-to-Date</SelectItem>
            <SelectItem value="QTD" className="text-gray-300 hover:bg-gray-800">Quarter-to-Date</SelectItem>
            <SelectItem value="MTD" className="text-gray-300 hover:bg-gray-800">Month-to-Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-teal-400">
              ${data.metrics.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Net Income</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-teal-400">
              ${data.metrics.netIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Cash on Hand</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-teal-400">
              ${data.metrics.cashOnHand.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Expense Ratio</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-teal-400">
              {data.metrics.expenseRatio.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card className="bg-[#2d2d2d] border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-300">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="month" 
                  stroke="#888888"
                  fontSize={12}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value: number) => `$${value/1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  stroke="#2dd4bf"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monthly Income Statement Chart */}
      <Card className="bg-[#2d2d2d] border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-300">Monthly Income Statement</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{
              income: {
                label: "Income",
                color: "#2dd4bf",
              },
              expenses: {
                label: "Expenses",
                color: "#b8a000",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.incomeStatementData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value: number) => `$${value/1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="income" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#b8a000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

