"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Legend, Cell, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDeterministicRandom } from '@/lib/generate-mock-data'

type ExpenseAnalysisProps = {
  plan: 'basic' | 'pro' | 'nonprofit'
}

type Period = 'YTD' | 'QTD' | 'MTD'

function generateExpenseData(period: Period) {
  const random = createDeterministicRandom(period);
  
  const randomInt = (min: number, max: number) => 
    Math.floor(random() * (max - min + 1) + min);
  
  const randomFloat = (min: number, max: number) => 
    parseFloat((random() * (max - min) + min).toFixed(2));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsInPeriod = period === 'YTD' ? 12 : period === 'QTD' ? 3 : 1;
  
  const expenseTrend = Array.from({ length: monthsInPeriod }, (_, i) => ({
    month: months[i],
    expenses: randomInt(300000, 400000)
  }));

  const topVendors = [
    { name: 'Vendor A', value: 26 },
    { name: 'Vendor B', value: 21 },
    { name: 'Vendor C', value: 16 },
    { name: 'Others', value: 37 }
  ];

  const expenseCategories = [
    { category: 'Labor', amount: randomInt(150000, 180000) },
    { category: 'Materials', amount: randomInt(120000, 150000) },
    { category: 'Overhead', amount: randomInt(90000, 120000) },
    { category: 'Marketing', amount: randomInt(60000, 90000) },
    { category: 'Admin', amount: randomInt(45000, 60000) }
  ];

  const totalExpenses = expenseTrend.reduce((sum, month) => sum + month.expenses, 0);
  const avgMonthlyExpenses = totalExpenses / monthsInPeriod;
  const expenseRatio = randomFloat(70, 75);

  return {
    metrics: {
      totalExpenses,
      avgMonthlyExpenses,
      expenseRatio
    },
    expenseTrend,
    topVendors,
    expenseCategories
  };
}

export function ExpenseAnalysis({ plan }: ExpenseAnalysisProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('YTD')
  const data = useMemo(() => generateExpenseData(selectedPeriod), [selectedPeriod])

  const COLORS = ['#2dd4bf', '#0d9488', '#ca8a04', '#525252'];

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
            <CardTitle className="text-sm font-medium text-gray-300">Total Expenses YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${(data.metrics.totalExpenses / 1000000).toFixed(2)}M
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${(data.metrics.avgMonthlyExpenses / 1000).toFixed(0)}K
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Expense Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              {data.metrics.expenseRatio.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Expense Trend Chart */}
      <Card className="bg-[#2d2d2d] border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-300">Monthly Expense Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{
              expenses: {
                label: "Expenses",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.expenseTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                  dataKey="expenses"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  stroke="#2dd4bf"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Vendors */}
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-300">Top Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Percentage",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.topVendors}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.topVendors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-300">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer
              config={{
                amount: {
                  label: "Amount",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.expenseCategories} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis
                    dataKey="category"
                    stroke="#888888"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickFormatter={(value: number) => `${value/1000}K`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

