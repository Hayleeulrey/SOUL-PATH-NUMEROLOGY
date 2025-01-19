"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo, useEffect, useId } from "react"
import { createDeterministicRandom } from '@/lib/generate-mock-data'

type CashManagementProps = {
  plan: 'basic' | 'pro' | 'nonprofit'
}

type Period = 'YTD' | 'MTD' | 'QTD'

// Helper function to generate random data
const generateDeterministicData = (period: Period) => {
  const rng = createDeterministicRandom(period); // Use the period as a seed

  const randomInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1) + min);
  const randomFloat = (min: number, max: number) => parseFloat((rng() * (max - min) + min).toFixed(2));

  const generateCashFlowData = (numPeriods: number) => {
    return Array.from({ length: numPeriods }, (_, i) => ({
      period: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      operating: randomFloat(40000, 60000),
      investing: randomFloat(-25000, -5000),
      financing: randomFloat(-15000, 15000)
    }))
  }

  const cashFlowData = {
    YTD: generateCashFlowData(12),
    QTD: generateCashFlowData(3),
    MTD: generateCashFlowData(1)
  }

  return {
    apAging: [
      { period: '0-30 days', amount: randomInt(15000, 30000) },
      { period: '31-60 days', amount: randomInt(10000, 20000) },
      { period: '61-90 days', amount: randomInt(5000, 15000) },
      { period: '90+ days', amount: randomInt(2000, 10000) },
    ],
    unpaidBills: [
      { name: 'Vendor A', value: randomInt(20, 40) },
      { name: 'Vendor B', value: randomInt(20, 40) },
      { name: 'Vendor C', value: randomInt(20, 40) },
    ],
    metrics: {
      totalApAging: randomInt(40000, 70000),
      unpaidBills: randomInt(30000, 50000),
      cashPosition: randomInt(100000, 200000),
    },
    cashFlow: cashFlowData[period]
  }
}

export function CashManagement({ plan }: CashManagementProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const uniqueId = useId();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('YTD')
  const [data, setData] = useState(() => generateDeterministicData('YTD'));

  useEffect(() => {
    setData(generateDeterministicData(selectedPeriod));
  }, [selectedPeriod]);

  const filteredData = useMemo(() => {
    return {
      metrics: {
        totalApAging: data.metrics.totalApAging,
        unpaidBills: data.metrics.unpaidBills,
        cashPosition: data.metrics.cashPosition,
      },
      apAging: data.apAging,
      unpaidBills: data.unpaidBills,
      cashFlow: data.cashFlow,
    }
  }, [data])

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex items-center gap-2 bg-[#2d2d2d] p-4 rounded-lg border border-gray-800">
        <span className="text-sm text-gray-300">Period:</span>
        <Select onValueChange={(value: Period) => setSelectedPeriod(value)} value={selectedPeriod} key={uniqueId}>
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
            <CardTitle className="text-sm font-medium text-gray-300">Total AP Aging</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${filteredData.metrics.totalApAging.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Unpaid Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${filteredData.metrics.unpaidBills.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Cash Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${filteredData.metrics.cashPosition.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AP Aging Chart */}
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-300">AP Aging</CardTitle>
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
                <BarChart 
                  data={filteredData.apAging} 
                  margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                >
                  <XAxis
                    dataKey="period"
                    stroke="#888888"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="amount" 
                    fill="#2dd4bf"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Unpaid Bills by Vendor */}
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-300">Unpaid Bills by Vendor</CardTitle>
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
                    data={filteredData.unpaidBills}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {filteredData.unpaidBills.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#2dd4bf', '#0d9488', '#ca8a04'][index % 3]} />
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

      {/* Cash Flow Statement */}
      <Card className="bg-[#2d2d2d] border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-300">Cash Flow Statement</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{
              operating: {
                label: "Operating",
                color: "#2dd4bf",
              },
              investing: {
                label: "Investing",
                color: "#0d9488",
              },
              financing: {
                label: "Financing",
                color: "#ca8a04",
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={filteredData.cashFlow}
                margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
              >
                <XAxis dataKey="period" stroke="#888888" fontSize={12} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="operating"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  dot={{ fill: "#2dd4bf" }}
                />
                <Line
                  type="monotone"
                  dataKey="investing"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ fill: "#0d9488" }}
                />
                <Line
                  type="monotone"
                  dataKey="financing"
                  stroke="#ca8a04"
                  strokeWidth={2}
                  dot={{ fill: "#ca8a04" }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

