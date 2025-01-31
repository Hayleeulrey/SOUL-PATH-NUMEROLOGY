import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-teal-400">DashPro</h2>
            <p>Empowering businesses through custom financial and operational dashboards</p>
          </div>
          <div>
            <ul className="flex space-x-4">
              <li><Link href="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>&copy; 2025 DashPro All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

