import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">HealthConnect</h3>
            <p className="text-gray-600 dark:text-gray-300">Your trusted healthcare partner</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Services</h3>
            <ul className="space-y-2">
              <li><Link href="/find-doctors" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Find Doctors</Link></li>
              <li><Link href="/video-consult" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Video Consult</Link></li>
              <li><Link href="/surgeries" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Surgeries</Link></li>
              <li><Link href="/medicines" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Medicines</Link></li>
              <li><Link href="/lab-tests" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Lab Tests</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Contact</Link></li>
              <li><Link href="/careers" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
          © 2023 HealthConnect. All rights reserved.
        </div>
      </div>
    </footer>
  )
}