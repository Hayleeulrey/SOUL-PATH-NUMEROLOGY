import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface AddOn {
  id: string
  name: string
  description: string
  oneTimeFee: number | null
  monthlyFee: number | null
  isVariable?: boolean
}

export const addOns: AddOn[] = [
  {
    id: "custom-report",
    name: "Custom Report",
    description: "Tailored reports designed to meet your specific business needs and metrics",
    oneTimeFee: 200,
    monthlyFee: null,
    isVariable: true
  },
  {
    id: "technical-training",
    name: "Additional Technical Training (8 hours)",
    description: "Extended training sessions for your team to master the dashboard features",
    oneTimeFee: 499,
    monthlyFee: null
  },
  {
    id: "kpi-build",
    name: "Custom KPI Build",
    description: "Development of custom Key Performance Indicators specific to your organization",
    oneTimeFee: 1000,
    monthlyFee: null,
    isVariable: true
  },
  {
    id: "okr-build",
    name: "Custom OKR Build",
    description: "Implementation of Objectives and Key Results framework into your dashboard",
    oneTimeFee: 2000,
    monthlyFee: null,
    isVariable: true
  },
  {
    id: "extended-support",
    name: "Extended Ongoing Support",
    description: "Priority support with extended hours and dedicated response times",
    oneTimeFee: null,
    monthlyFee: 200
  },
  {
    id: "white-labeling",
    name: "White Labeling",
    description: "Custom branding and white-label options for the dashboard",
    oneTimeFee: 300,
    monthlyFee: null
  }
]

export function AddOnsTable() {
  return (
    <div className="w-full bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-teal-400">Available Add-ons</h2>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead className="text-white">Build</TableHead>
            <TableHead className="text-white">Description</TableHead>
            <TableHead className="text-white text-right">One-Time Fee</TableHead>
            <TableHead className="text-white text-right">Monthly Fee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {addOns.map((addon) => (
            <TableRow key={addon.id} className="border-gray-700">
              <TableCell className="font-medium text-white">{addon.name}</TableCell>
              <TableCell className="text-gray-300">{addon.description}</TableCell>
              <TableCell className="text-right text-white">
                {addon.oneTimeFee 
                  ? `$${addon.oneTimeFee.toLocaleString()}${addon.isVariable ? '+' : ''}`
                  : 'NA'}
              </TableCell>
              <TableCell className="text-right text-white">
                {addon.monthlyFee 
                  ? `$${addon.monthlyFee.toLocaleString()}${addon.isVariable ? '+' : ''}`
                  : 'NA'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

