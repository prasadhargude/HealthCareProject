'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu, X } from 'lucide-react'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-600 dark:text-green-400">
            HealthConnect
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <nav>
              <ul className="flex space-x-4">
                <li><Link href="/find-doctors" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Find Doctors</Link></li>
                <li><Link href="/video-consult" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Video Consult</Link></li>
                <li><Link href="/surgeries" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Surgeries</Link></li>
                <li><Link href="/medicines" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Medicines</Link></li>
                <li><Link href="/lab-tests" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Lab Tests</Link></li>
              </ul>
            </nav>
            <Link href="/signin" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
              Login
            </Link>
            <Link href="/signup" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
              Sign Up
            </Link>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
              aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 mr-2"
              aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <nav className="mt-4 md:hidden">
            <ul className="flex flex-col space-y-2">
              <li><Link href="/find-doctors" className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Find Doctors</Link></li>
              <li><Link href="/video-consult" className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Video Consult</Link></li>
              <li><Link href="/surgeries" className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Surgeries</Link></li>
              <li><Link href="/medicines" className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Medicines</Link></li>
              <li><Link href="/lab-tests" className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Lab Tests</Link></li>
              <li><Link href="/signin" className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Login</Link></li>
              <li><Link href="/signup" className="block bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">Sign Up</Link></li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}