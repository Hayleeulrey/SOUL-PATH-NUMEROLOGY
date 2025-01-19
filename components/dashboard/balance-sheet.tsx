"use client"

import { useState, useMemo } from 'react'
// ... other imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Legend, Cell, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDeterministicRandom } from '@/lib/generate-mock-data'

type BalanceSheetProps = {
  plan: 'basic' | 'pro' | 'nonprofit'
}

type Period = 'YTD' | 'QTD' | 'MTD'

function generateBalanceSheetData(period: Period) {
  const random = createDeterministicRandom(period);
  
  const randomInt = (min: number, max: number) => 
    Math.floor(random() * (max - min + 1)) + min;

  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];
  
  const trendData = years.map(year => ({
    year,
    assets: randomInt(650000 + parseInt(year) * 100000, 1000000 + parseInt(year) * 150000),
    equity: randomInt(400000 + parseInt(year) * 80000, 600000 + parseInt(year) * 120000)
  }));

  const assetComposition = [
    { name: 'Current Assets', value: 35 },
    { name: 'Fixed Assets', value: 30 },
    { name: 'Other Assets', value: 20 },
    { name: 'Investments', value: 15 }
  ];

  const liabilityComposition = [
    { name: 'Current Liabilities', value: 40 },
    { name: 'Long-term Debt', value: 35 },
    { name: 'Other Liabilities', value: 25 }
  ];

  const currentData = trendData[trendData.length - 1];
  const totalAssets = currentData.assets;
  const totalEquity = currentData.equity;
  const totalLiabilities = totalAssets - totalEquity;

  return {
    metrics: {
      totalAssets,
      totalLiabilities,
      totalEquity
    },
    trendData,
    assetComposition,
    liabilityComposition
  };
}

export function BalanceSheet({ plan }: BalanceSheetProps) { { // eslint-disable-line @typescript-eslint/no-unused-vars 
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('YTD')
  const data = useMemo(() => generateBalanceSheetData(selectedPeriod), [selectedPeriod])

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
            <CardTitle className="text-sm font-medium text-gray-300">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${(data.metrics.totalAssets / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${(data.metrics.totalLiabilities / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${(data.metrics.totalEquity / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Sheet Trend Chart */}
      <Card className="bg-[#2d2d2d] border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-300">Balance Sheet Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{
              assets: {
                label: "Assets",
                color: "#2dd4bf",
              },
              equity: {
                label: "Equity",
                color: "#ca8a04",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="year" 
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
                  dataKey="assets"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  stroke="#2dd4bf"
                />
                <Line
                  type="monotone"
                  dataKey="equity"
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

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Asset Composition */}
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-300">Asset Composition</CardTitle>
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
                    data={data.assetComposition}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.assetComposition.map((entry, index) => (
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

        {/* Liability Composition */}
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-300">Liability Composition</CardTitle>
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
                    data={data.liabilityComposition}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.liabilityComposition.map((entry, index) => (
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
      </div>
    </div>
  )
}
}
