import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { ArrowRight, BarChart2, Zap, Shield } from 'lucide-react'
import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 text-teal-400">
        Financial and operational dashboards for the discerning professionals
        </h1>
        <p className="text-xl mb-12 max-w-3xl mx-auto text-gray-300">
        DashPro provides tailored financial and operational solutions to drive your business forward. Make data-informed decisions with ease and efficiency.
        </p>
        <div className="flex justify-center space-x-4">
          <Button 
            asChild
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-300"
          >
            <Link href="/demo">
              Try Our Demo
            </Link>
          </Button>
          <Button 
            asChild
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors duration-300"
          >
            <Link href="/pricing">
              View Pricing
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <h2 className="text-3xl font-bold mb-12 text-center text-teal-400">Why Choose Our Dashboards?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<BarChart2 className="w-12 h-12 text-teal-400" />}
            title="Real-time Insights"
            description="Get up-to-the-minute data on your financial performance, enabling quick and informed decision-making."
          />
          <FeatureCard 
            icon={<Zap className="w-12 h-12 text-teal-400" />}
            title="Customizable Solutions"
            description="Tailor your dashboard to your specific needs, focusing on the metrics that matter most to your business."
          />
          <FeatureCard 
            icon={<Shield className="w-12 h-12 text-teal-400" />}
            title="Secure and Reliable"
            description="Rest easy knowing your financial data is protected with state-of-the-art security measures."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-6 text-teal-400">Ready to Transform Your Financial & Operational Insights?</h2>
        <p className="text-xl mb-8 text-gray-300">
          Join the growing number of businesses leveraging our custom financial dashboards.
        </p>
        <Button 
          asChild
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-300"
        >
          <Link href="/contact" className="inline-flex items-center">
            Get Started Today <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center text-teal-400">{title}</h3>
      <p className="text-gray-300 text-center">{description}</p>
    </div>
  )
}

