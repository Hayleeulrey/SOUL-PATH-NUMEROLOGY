"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Legend} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDeterministicRandom } from '@/lib/generate-mock-data'

type BudgetAnalysisProps = {
  plan: 'basic' | 'pro' | 'nonprofit'
}

type Period = 'YTD' | 'QTD' | 'MTD'

function generateBudgetData(period: Period) {
  const random = createDeterministicRandom(period);
  
  const randomInt = (min: number, max: number) => 
    Math.floor(random() * (max - min + 1)) + min;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsInPeriod = period === 'YTD' ? 12 : period === 'QTD' ? 3 : 1;

  const trendData = Array.from({ length: monthsInPeriod }, (_, i) => {
    const budget = randomInt(90000, 180000);
    const variance = randomInt(-5000, 5000);
    return {
      month: months[i],
      budget,
      actual: budget + variance
    };
  });

  const categories = [
    { name: 'Revenue', budget: randomInt(1500000, 1800000) },
    { name: 'COGS', budget: randomInt(900000, 1000000) },
    { name: 'Operating Expenses', budget: randomInt(400000, 500000) },
    { name: 'Marketing', budget: randomInt(200000, 300000) },
    { name: 'R&D', budget: randomInt(100000, 150000) }
  ];

  const categoryData = categories.map(cat => ({
    ...cat,
    actual: cat.budget + randomInt(-50000, 50000)
  }));

  const totalBudget = categoryData.reduce((sum, cat) => sum + cat.budget, 0);
  const totalActual = categoryData.reduce((sum, cat) => sum + cat.actual, 0);
  const variance = totalActual - totalBudget;
  const variancePercent = (variance / totalBudget) * 100;

  return {
    metrics: {
      totalBudget,
      totalActual,
      variance,
      variancePercent
    },
    trendData,
    categoryData
  };
}

export function BudgetAnalysis({ plan }: BudgetAnalysisProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('YTD')
  const data = useMemo(() => generateBudgetData(selectedPeriod), [selectedPeriod])

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Budget YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${(data.metrics.totalBudget / 1000000).toFixed(2)}M
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Actual YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${(data.metrics.totalActual / 1000000).toFixed(2)}M
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.metrics.variance >= 0 ? 'text-yellow-500' : 'text-red-500'}`}>
              {data.metrics.variance >= 0 ? '+' : ''} 
              ${(Math.abs(data.metrics.variance) / 1000).toFixed(0)}K
              ({data.metrics.variancePercent >= 0 ? '+' : ''}
              {data.metrics.variancePercent.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual Trend Chart */}
      <Card className="bg-[#2d2d2d] border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-300">Budget vs Actual Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{
              budget: {
                label: "Budget",
                color: "#2dd4bf",
              },
              actual: {
                label: "Actual",
                color: "#ca8a04",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="month" 
                  stroke="#888888"
                  fontSize={12}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value: number) => `${value/1000}K`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="budget"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  stroke="#2dd4bf"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  stroke="#ca8a04"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Budget vs Actual by Category Chart */}
      <Card className="bg-[#2d2d2d] border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-300">Budget vs Actual by Category</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{
              budget: {
                label: "Budgeted",
                color: "#2dd4bf",
              },
              actual: {
                label: "Actual",
                color: "#ca8a04",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value: number) => `${value/1000}K`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="budget" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#ca8a04" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

