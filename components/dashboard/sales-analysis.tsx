"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Legend, Cell, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDeterministicRandom } from '@/lib/generate-mock-data'

type SalesAnalysisProps = {
  plan: 'basic' | 'pro' | 'nonprofit'
}

type Period = 'YTD' | 'QTD' | 'MTD'

function generateSalesData(period: Period) {
  const random = createDeterministicRandom(period);
  
  const randomInt = (min: number, max: number) => 
    Math.floor(random() * (max - min + 1)) + min;

  const randomFloat = (min: number, max: number) => 
    parseFloat((random() * (max - min) + min).toFixed(2));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsInPeriod = period === 'YTD' ? 12 : period === 'QTD' ? 3 : 1;
  
  const salesTrend = Array.from({ length: monthsInPeriod }, (_, i) => ({
    month: months[i],
    sales: randomInt(450000, 600000)
  }));

  const topCustomers = [
    { name: 'Enterprise A', value: randomInt(30, 40) },
    { name: 'Enterprise B', value: randomInt(25, 35) },
    { name: 'Enterprise C', value: randomInt(20, 30) },
    { name: 'Others', value: randomInt(10, 20) }
  ];

  const totalSales = salesTrend.reduce((sum, month) => sum + month.sales, 0);
  const avgMonthlySales = totalSales / monthsInPeriod;
  const growthRate = randomFloat(10, 20);

  return {
    metrics: {
      totalSales,
      avgMonthlySales,
      growthRate
    },
    salesTrend,
    topCustomers,
    monthlyDistribution: salesTrend
  };
}

export function SalesAnalysis({ plan }: SalesAnalysisProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('YTD')
  const data = useMemo(() => generateSalesData(selectedPeriod), [selectedPeriod])

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
            <CardTitle className="text-sm font-medium text-gray-300">Total Sales YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${(data.metrics.totalSales / 1000000).toFixed(2)}M
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              ${(data.metrics.avgMonthlySales / 1000).toFixed(0)}K
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              +{data.metrics.growthRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card className="bg-[#2d2d2d] border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-300">Sales Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ChartContainer
            config={{
              sales: {
                label: "Sales",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                  dataKey="sales"
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
        {/* Top Customers */}
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-300">Top Customers</CardTitle>
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
                    data={data.topCustomers}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.topCustomers.map((entry, index) => (
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

        {/* Monthly Distribution */}
        <Card className="bg-[#2d2d2d] border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-300">Monthly Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer
              config={{
                sales: {
                  label: "Sales",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                  <Bar dataKey="sales" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

