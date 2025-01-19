"use client"

import { Check, X, Star, TrendingUp, Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { FloatingCalculatorButton } from './floating-calculator-button'

const pricingData = {
  basic: {
    name: "Basic",
    price: 4788,
    implementation: 1995,
    includedUsers: 3,
    icon: TrendingUp,
    iconLabel: "For Growing Businesses",
    features: [
      "Financial Overview Dashboard",
      "Cash Management Dashboard",
      "Sales Analysis Dashboard",
      "Expense Analysis Dashboard",
      "Balance Sheet Dashboard",
      "Basic Data Visualization",
      "Email Support",
      "Quarterly Updates (when required)",
      "8 Hours of Training Support",
      "Choice between 5 color templates"
    ],
    volumeDiscounts: [
      { users: 10, discount: 5 },
      { users: 20, discount: 10 },
      { users: 50, discount: 15 }
    ]
  },
  pro: {
    name: "Pro",
    price: 7188,
    implementation: 2995,
    includedUsers: 6,
    icon: Star,
    iconLabel: "Most Popular",
    features: [
      "All Basic Dashboards",
      "Year-over-Year Analysis",
      "Full Fiscal Analysis Report",
      "Advanced Data Visualization",
      "Priority Support",
      "Quarterly Updates (when required)",
      "Team Training Session + 8 Hours of Additional Support",
      "White Label Options",
    ],
    volumeDiscounts: [
      { users: 25, discount: 10 },
      { users: 50, discount: 15 },
      { users: 100, discount: 20 }
    ]
  },
  nonprofit: {
    name: "Nonprofit & Education",
    price: 3830,
    implementation: 1596,
    includedUsers: 3,
    icon: Heart,
    iconLabel: "Best Value for Nonprofits",
    features: [
      "Fund Accounting Dashboard",
      "Grant Management Tracker",
      "Donor Analytics Dashboard",
      "Program Expense Tracking",
      "Form 990 Preparation Tools",
      "Basic Data Visualization",
      "Email Support",
      "Quarterly Updates (when required)",
      "12 Hours of Training Support",
      "Choice between 5 color templates"
    ],
    volumeDiscounts: [
      { users: 15, discount: 10 },
      { users: 30, discount: 15 },
      { users: 75, discount: 20 }
    ]
  }
}

const featureComparisonData = [
  { feature: "Included Users", basic: "3", pro: "6", nonprofit: "3" },
  { feature: "Financial Overview Dashboard", basic: true, pro: true, nonprofit: true },
  { feature: "Cash Management Dashboard", basic: true, pro: true, nonprofit: true },
  { feature: "Sales Analysis Dashboard", basic: true, pro: true, nonprofit: false },
  { feature: "Expense Analysis Dashboard", basic: true, pro: true, nonprofit: true },
  { feature: "Balance Sheet Dashboard", basic: true, pro: true, nonprofit: true },
  { feature: "Year-over-Year Analysis", basic: false, pro: true, nonprofit: true },
  { feature: "Full Fiscal Analysis Report", basic: false, pro: true, nonprofit: true },
  { feature: "Fund Accounting Dashboard", basic: false, pro: false, nonprofit: true },
  { feature: "Grant Management Tracker", basic: false, pro: false, nonprofit: true },
  { feature: "Donor Analytics Dashboard", basic: false, pro: false, nonprofit: true },
  { feature: "Program Expense Tracking", basic: false, pro: false, nonprofit: true },
  { feature: "Form 990 Preparation Tools", basic: false, pro: false, nonprofit: true },
  { feature: "Basic Data Visualization", basic: true, pro: false, nonprofit: true },
  { feature: "Advanced Data Visualization", basic: false, pro: true, nonprofit: false },
  { feature: "Email Support", basic: true, pro: true, nonprofit: true },
  { feature: "Priority Support", basic: false, pro: true, nonprofit: false },
  { feature: "Quarterly Updates (when required)", basic: true, pro: true, nonprofit: true },
  { feature: "8 Hours of Training Support", basic: true, pro: false, nonprofit: false },
  { feature: "12 Hours of Training Support", basic: false, pro: false, nonprofit: true },
  { feature: "Team Training Session + 8 Hours of Additional Support", basic: false, pro: true, nonprofit: false },
  { feature: "Choice between 5 color templates", basic: true, pro: true, nonprofit: true },
  { feature: "White Label Options", basic: false, pro: true, nonprofit: false },
]

export default function PricingTable() {
  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-4 text-white">Empower Your Business with Custom Financial Dashboards</h2>
        <p className="text-xl text-gray-300">
          Effortlessly track your financial data, visualize growth, and drive decisions with our comprehensive dashboards tailored to your business needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {Object.entries(pricingData).map(([key, plan]) => (
          <Card key={key} className="flex flex-col bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl text-teal-400">{plan.name}</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <plan.icon className="h-6 w-6 text-teal-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{plan.iconLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription>
                <div className="mt-4 space-y-1">
                  <p className="text-3xl font-bold text-white">
                    ${key === 'basic' ? '399' : key === 'pro' ? '599' : '319'}/month
                  </p>
                  <p className="text-sm text-gray-300">
                    Billed annually (${plan.price.toLocaleString()})
                  </p>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-4">
                <Badge variant="secondary" className="mb-2 bg-teal-900 text-teal-200">Implementation</Badge>
                <div className="text-sm text-white">One-time fee: ${plan.implementation.toLocaleString()}</div>
              </div>
              
              <div className="mb-4">
                <Badge variant="secondary" className="mb-2 bg-teal-900 text-teal-200">Users Included</Badge>
                <div className="text-sm text-white">{plan.includedUsers} users included</div>
                <div className="text-sm text-gray-300">
                  Additional users: $49/user/month
                </div>
              </div>

              <div className="mb-4">
                <Badge variant="secondary" className="mb-2 bg-teal-900 text-teal-200">Volume Discounts</Badge>
                <div className="space-y-1">
                  {plan.volumeDiscounts.map((tier) => (
                    <div key={tier.users} className="text-sm text-white">
                      {tier.discount}% off at {tier.users}+ users
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-4 text-teal-400">Features</h3>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <div className={cn(buttonVariants({ variant: "default" }), "w-full cursor-pointer bg-teal-600 hover:bg-teal-700 text-lg font-bold")}>
                        GET STARTED TODAY
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>12-month minimum commitment</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {key === 'nonprofit' && (
                  <div className="text-sm text-center text-gray-300 mt-4">
                    20% discount applied for nonprofits and educational institutions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 mb-12 text-center text-sm text-gray-300">
        <p>All plans include:</p>
        <ul className="mt-2">
          <li>Free updates during subscription period</li>
          <li>99.9% uptime guarantee</li>
          <li>Secure data encryption</li>
          <li>Basic onboarding support</li>
        </ul>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-12">
        <h3 className="text-2xl font-bold text-white mb-4">Feature Comparison</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Feature</TableHead>
              <TableHead className="text-white">Basic</TableHead>
              <TableHead className="text-white">Pro</TableHead>
              <TableHead className="text-white">Nonprofit & Education</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {featureComparisonData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-white">{row.feature}</TableCell>
                <TableCell className="text-center">
                  {row.basic === true ? (
                    <Check className="h-5 w-5 text-green-400 mx-auto" />
                  ) : row.basic === false ? (
                    <X className="h-5 w-5 text-red-400 mx-auto" />
                  ) : (
                    <span className="text-white">{row.basic}</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {row.pro === true ? (
                    <Check className="h-5 w-5 text-green-400 mx-auto" />
                  ) : row.pro === false ? (
                    <X className="h-5 w-5 text-red-400 mx-auto" />
                  ) : (
                    <span className="text-white">{row.pro}</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {row.nonprofit === true ? (
                    <Check className="h-5 w-5 text-green-400 mx-auto" />
                  ) : row.nonprofit === false ? (
                    <X className="h-5 w-5 text-red-400 mx-auto" />
                  ) : (
                    <span className="text-white">{row.nonprofit}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <FloatingCalculatorButton />
    </div>
  )
}

