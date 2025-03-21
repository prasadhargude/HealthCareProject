"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu, X, ShoppingCart } from 'lucide-react'
import { useSession } from "next-auth/react"
import UserMenu from "./user-menu"

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated" && session?.user

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg" 
          : "bg-white dark:bg-gray-800 shadow-md"
      }`}
    >
      {/* Top gradient line */}
      <div className="h-1 w-full bg-gradient-to-r from-green-400 via-teal-500 to-green-500"></div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link 
            href="/" 
            className="text-2xl font-bold relative group"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-500 dark:from-green-400 dark:to-teal-300 transition-all duration-300 group-hover:from-teal-500 group-hover:to-green-600">
              HealthConnect
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-600 to-teal-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                {[
                  { name: 'Find Doctors', href: '/find-doctors' },
                  { name: 'Video Consult', href: '/video-consult' },
                  { name: 'Surgeries', href: '/surgeries' },
                  { name: 'Medicines', href: '/medicines' },
                  { name: 'Lab Tests', href: '/lab-tests' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors relative group"
                    >
                      {link.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center space-x-5">
              {isAuthenticated ? (
                <div className="flex items-center space-x-5">
                  <Link
                    href="/cart"
                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors relative"
                    aria-label="Shopping cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">
                      0
                    </span>
                  </Link>
                  <UserMenu user={session.user} />
                </div>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 text-white px-5 py-2 rounded-md font-medium transition-colors shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="md:hidden flex items-center space-x-3">
            {isAuthenticated && (
              <Link
                href="/cart"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors relative"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">
                  0
                </span>
              </Link>
            )}
            
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            
            {isAuthenticated && (
              <div className="mr-1">
                <UserMenu user={session.user} />
              </div>
            )}
            
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors p-1"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-gray-100 dark:border-gray-700 pt-4">
            <nav>
              <ul className="space-y-3">
                {[
                  { name: 'Find Doctors', href: '/find-doctors' },
                  { name: 'Video Consult', href: '/video-consult' },
                  { name: 'Surgeries', href: '/surgeries' },
                  { name: 'Medicines', href: '/medicines' },
                  { name: 'Lab Tests', href: '/lab-tests' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
                      onClick={toggleMenu}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                
                {!isAuthenticated && (
                  <div className="flex flex-col space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Link
                      href="/signin"
                      className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
                      onClick={toggleMenu}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 text-white px-4 py-2 rounded-md font-medium transition-colors inline-block text-center"
                      onClick={toggleMenu}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}