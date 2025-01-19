"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { BarChart2, DollarSign, FileText, PieChart, Wallet, Calculator } from 'lucide-react'
import { OverallHealth } from '@/components/dashboard/overall-health'
import { SalesAnalysis } from '@/components/dashboard/sales-analysis'
import { ExpenseAnalysis } from '@/components/dashboard/expense-analysis'
import { CashManagement } from '@/components/dashboard/cash-management'
import { BudgetAnalysis } from '@/components/dashboard/budget-analysis'
import { BalanceSheet } from '@/components/dashboard/balance-sheet'

type Plan = 'basic' | 'pro' | 'nonprofit'
type Page = 'overall' | 'sales' | 'expenses' | 'cash' | 'budget' | 'balance'

const pages = [
  { id: 'overall', label: 'Overall Health', icon: BarChart2 },
  { id: 'sales', label: 'Sales Analysis', icon: DollarSign },
  { id: 'expenses', label: 'Expense Analysis', icon: FileText },
  { id: 'cash', label: 'Cash Management', icon: Wallet },
  { id: 'budget', label: 'Budget Analysis', icon: Calculator },
  { id: 'balance', label: 'Balance Sheet', icon: FileText },
]

export default function DemoPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('basic')
  const [selectedPage, setSelectedPage] = useState<Page>('overall')
  const plans: Plan[] = ['basic', 'pro', 'nonprofit']

  const renderContent = () => {
    switch (selectedPage) {
      case 'overall':
        return <OverallHealth plan={selectedPlan} />
      case 'sales':
        return <SalesAnalysis plan={selectedPlan} />
      case 'expenses':
        return <ExpenseAnalysis plan={selectedPlan} />
      case 'cash':
        return <CashManagement plan={selectedPlan} />
      case 'budget':
        return <BudgetAnalysis plan={selectedPlan} />
      case 'balance':
        return <BalanceSheet plan={selectedPlan} />
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-teal-400">Interactive Dashboard Demo</h1>
      
      <div className="flex space-x-4 mb-6">
        {plans.map((plan) => (
          <Button
            key={plan}
            onClick={() => setSelectedPlan(plan)}
            variant={selectedPlan === plan ? "default" : "secondary"}
            className={`${
              selectedPlan === plan
                ? "bg-white text-gray-900 hover:bg-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </Button>
        ))}
      </div>

      <div className="bg-[#1e1e1e] rounded-lg overflow-hidden">
        <div className="grid grid-cols-[240px_1fr]">
          <div className="bg-[#1a1a1a] border-r border-gray-800">
            <div className="p-4">
              <div className="border border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center text-gray-500">
                INSERT LOGO
              </div>
            </div>
            <nav className="p-2 mt-4">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id as Page)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedPage === page.id 
                    ? 'bg-teal-400/10 text-teal-400' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
                  }`}
                >
                  <page.icon className="w-4 h-4" />
                  <span>{page.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="min-h-[800px] bg-[#1e1e1e] p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2 text-teal-400">Demo Instructions</h2>
        <p className="text-gray-300">
          This interactive demo showcases our financial dashboard capabilities. You can switch between different plan types using the buttons at the top, and explore various financial metrics using the navigation menu on the left. Each section represents a different aspect of financial analysis that our dashboards provide.
        </p>
      </div>
    </div>
  )
}

