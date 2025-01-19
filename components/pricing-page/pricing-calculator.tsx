"use client"

import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import type { AddOn } from './add-ons-table'
import { addOns } from './add-ons-table'

interface PlanDetails {
  name: string;
  price: number;
  implementation: number;
  includedUsers: number;
  volumeDiscounts: { users: number; discount: number }[];
}

const pricingData: Record<string, PlanDetails> = {
  basic: {
    name: "Basic",
    price: 4788,
    implementation: 1995,
    includedUsers: 3,
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
    volumeDiscounts: [
      { users: 15, discount: 10 },
      { users: 30, discount: 15 },
      { users: 75, discount: 20 }
    ]
  }
}

type PaymentOption = 'split' | 'upfront'

export default function PricingCalculator() {
  const [selectedPlan, setSelectedPlan] = useState<string>("basic")
  const [userCount, setUserCount] = useState<number>(pricingData.basic.includedUsers)
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('split')
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  const calculatePrice = (plan: PlanDetails, users: number, paymentType: PaymentOption, addOnIds: string[]) => {
    const additionalUsers = Math.max(0, users - plan.includedUsers)
    const additionalUserCost = additionalUsers * 49 * 12 // $49 per additional user per month, annually

    let discount = 0
    for (const { users: discountUsers, discount: discountPercentage } of plan.volumeDiscounts) {
      if (users >= discountUsers) {
        discount = discountPercentage
      } else {
        break
      }
    }

    const annualCost = plan.price + additionalUserCost
    const discountedAnnualCost = annualCost * (1 - discount / 100)
    
    // Calculate add-on costs
    const selectedAddOns = addOns.filter(addon => addOnIds.includes(addon.id))
    const addOnOneTimeFees = selectedAddOns.reduce((sum: number, addon: AddOn) => sum + (addon.oneTimeFee || 0), 0)
    const addOnMonthlyFees = selectedAddOns.reduce((sum: number, addon: AddOn) => sum + (addon.monthlyFee || 0), 0)

    const addOnAnnualFees = addOnMonthlyFees * 12
    
    if (paymentType === 'split') {
      return {
        upfront: plan.implementation + addOnOneTimeFees,
        monthly: ((discountedAnnualCost + addOnAnnualFees) / 12).toFixed(2),
        additionalUsersCost: (additionalUserCost / 12).toFixed(2),
        addOnOneTimeFees,
        addOnMonthlyFees,
        discount,
        total: plan.implementation + discountedAnnualCost + addOnOneTimeFees + addOnAnnualFees
      }
    } else {
      return {
        upfront: plan.implementation + discountedAnnualCost + addOnOneTimeFees,
        monthly: (addOnMonthlyFees + (additionalUsers > 0 ? (additionalUserCost / 12) : 0)).toFixed(2),
        additionalUsersCost: (additionalUserCost / 12).toFixed(2),
        addOnOneTimeFees,
        addOnMonthlyFees,
        discount,
        total: plan.implementation + discountedAnnualCost + addOnOneTimeFees + addOnAnnualFees
      }
    }
  }

  const selectedPlanDetails = pricingData[selectedPlan]
  const pricing = calculatePrice(selectedPlanDetails, userCount, paymentOption, selectedAddOns)

  return (
    <div className="text-gray-100 flex flex-col h-full">
      <div className="sticky top-0 bg-gray-900 z-10 pb-4 mb-4 border-b border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-2 text-teal-400">Pricing Calculator</h2>
        <p className="text-gray-300 mb-4">
          Customize your plan and see real-time cost estimates. Adjust users, add-ons, and payment options to find the perfect fit for your needs.
        </p>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-teal-400">Pricing Breakdown</h3>
          <div className="space-y-4 text-white">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Upfront Payment</h4>
              <p className="text-2xl font-bold">${pricing.upfront.toLocaleString()}</p>
              <p className="text-sm text-gray-300">
                {paymentOption === 'split' 
                  ? 'Implementation fee and one-time add-ons'
                  : 'Implementation fee, annual subscription, and one-time add-ons'}
              </p>
              {pricing.addOnOneTimeFees > 0 && (
                <p className="text-sm text-gray-300 mt-1">
                  Includes ${pricing.addOnOneTimeFees.toLocaleString()} in one-time add-on fees
                </p>
              )}
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Monthly Payment</h4>
              <p className="text-2xl font-bold">${pricing.monthly}</p>
              <p className="text-sm text-gray-300">
                {paymentOption === 'split'
                  ? 'Annual subscription split monthly + Additional users + Monthly add-ons'
                  : 'Additional users + Monthly add-ons'}
              </p>
              {userCount > selectedPlanDetails.includedUsers && (
                <p className="text-sm text-gray-300 mt-1">
                  Includes ${pricing.additionalUsersCost} for {userCount - selectedPlanDetails.includedUsers} additional users
                </p>
              )}
              {pricing.addOnMonthlyFees > 0 && (
                <p className="text-sm text-gray-300 mt-1">
                  Includes ${pricing.addOnMonthlyFees.toLocaleString()} in monthly add-on fees
                </p>
              )}
            </div>

            {pricing.discount > 0 && (
              <div className="bg-teal-900/30 text-teal-100 p-4 rounded-lg">
                <h4 className="font-medium">Volume Discount Applied</h4>
                <p>{pricing.discount}% off for {userCount}+ users</p>
              </div>
            )}

            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span>Total First Year Cost:</span>
                <span className="text-xl font-bold">${pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6 overflow-y-auto flex-grow bg-gray-800/50 p-6 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="plan-select" className="text-white">Select Plan</Label>
          <Select
            value={selectedPlan}
            onValueChange={(value) => {
              setSelectedPlan(value)
              setUserCount(pricingData[value].includedUsers)
            }}
          >
            <SelectTrigger id="plan-select" className="bg-gray-700 text-white border-gray-600">
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              {Object.entries(pricingData).map(([key, plan]) => (
                <SelectItem key={key} value={key} className="hover:bg-gray-600">
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-count" className="text-white">Number of Users</Label>
          <Input
            id="user-count"
            type="number"
            min={selectedPlanDetails.includedUsers}
            value={userCount}
            onChange={(e) => setUserCount(Math.max(selectedPlanDetails.includedUsers, parseInt(e.target.value) || 0))}
            className="bg-gray-700 text-white border-gray-600"
          />
          <p className="text-sm text-gray-400">Minimum {selectedPlanDetails.includedUsers} users included with plan - each additional user is $49/user/month</p>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Payment Structure</Label>
          <RadioGroup 
            value={paymentOption} 
            onValueChange={(value: PaymentOption) => setPaymentOption(value)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="split" id="split" className="border-teal-400 text-teal-400" />
              <Label htmlFor="split" className="text-white">
                Implementation fee upfront + Monthly payments
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upfront" id="upfront" className="border-teal-400 text-teal-400" />
              <Label htmlFor="upfront" className="text-white">
                Implementation fee + Annual fee upfront
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Add-ons</Label>
          <div className="space-y-2">
            {addOns.map((addon) => (
              <div key={addon.id} className="flex items-start space-x-2">
                <Checkbox
                  id={addon.id}
                  checked={selectedAddOns.includes(addon.id)}
                  onCheckedChange={(checked: boolean | "indeterminate") => {
                    if (typeof checked === "boolean") {
                      setSelectedAddOns(
                        checked
                          ? [...selectedAddOns, addon.id]
                          : selectedAddOns.filter(id => id !== addon.id)
                      )
                    }
                  }}
                  className="border-teal-400 text-teal-400 mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor={addon.id} className="text-white">{addon.name}</Label>
                  <p className="text-sm text-gray-400">{addon.description}</p>
                  <p className="text-sm text-gray-300">
                    {addon.oneTimeFee ? `One-time fee: $${addon.oneTimeFee.toLocaleString()}${addon.isVariable ? '+' : ''}` : ''}
                    {addon.monthlyFee ? `Monthly fee: $${addon.monthlyFee.toLocaleString()}${addon.isVariable ? '+' : ''}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

