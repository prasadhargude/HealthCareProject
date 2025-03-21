"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Mail, Phone, MapPin, ExternalLink, ChevronRight } from 'lucide-react'

export function Footer() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <footer className="bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="space-y-6">
            <div>
              <Link href="/" className="inline-block">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500 dark:from-green-400 dark:to-teal-300">
                  HealthConnect
                </h3>
              </Link>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Connecting you to better health through innovative healthcare solutions.
              </p>
            </div>
            
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social, index) => (
                <a 
                  key={social}
                  href="#" 
                  className="group"
                  aria-label={social}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:bg-green-500 group-hover:text-white group-hover:scale-110 group-hover:shadow-lg">
                    <SocialIcon name={social} />
                  </div>
                </a>
              ))}
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                &copy; {new Date().getFullYear()} HealthConnect. All rights reserved.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center">
              <span className="w-8 h-0.5 bg-green-500 mr-3"></span>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Find Doctors', href: '/find-doctors' },
                { name: 'Video Consult', href: '/video-consult' },
                { name: 'Surgeries', href: '/surgeries' },
                { name: 'Medicines', href: '/medicines' },
                { name: 'Lab Tests', href: '/lab-tests' }
              ].map((link, index) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center">
              <span className="w-8 h-0.5 bg-green-500 mr-3"></span>
              For Patients
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Search for Doctors', href: '/search' },
                { name: 'Login', href: '/signin' },
                { name: 'Register', href: '/signup' },
                { name: 'Health Articles', href: '/health-articles' },
                { name: 'FAQs', href: '/faq' }
              ].map((link, index) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center">
              <span className="w-8 h-0.5 bg-green-500 mr-3"></span>
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="group">
                <a href="#" className="flex items-start">
                  <div className="mt-1 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-green-600 dark:text-green-400 transition-all duration-300 group-hover:bg-green-500 group-hover:text-white group-hover:scale-110">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 dark:text-white font-medium">Our Location</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      123 Healthcare Avenue, Mumbai, Maharashtra 400001
                    </p>
                  </div>
                </a>
              </li>
              <li className="group">
                <a href="tel:+918000123456" className="flex items-start">
                  <div className="mt-1 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-green-600 dark:text-green-400 transition-all duration-300 group-hover:bg-green-500 group-hover:text-white group-hover:scale-110">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 dark:text-white font-medium">Call Us</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      +91 8000 123 456
                    </p>
                  </div>
                </a>
              </li>
              <li className="group">
                <a href="mailto:support@healthconnect.com" className="flex items-start">
                  <div className="mt-1 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-green-600 dark:text-green-400 transition-all duration-300 group-hover:bg-green-500 group-hover:text-white group-hover:scale-110">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 dark:text-white font-medium">Email Us</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      support@healthconnect.com
                    </p>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div 
            className={`flex flex-col md:flex-row justify-between items-center transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex space-x-6 mb-4 md:mb-0">
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm">
                Sitemap
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-500 mr-2">Made with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-sm text-gray-500 dark:text-gray-500 ml-2">in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ name }: { name: string }) {
  switch (name) {
    case 'facebook':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
      )
    case 'twitter':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
      )
    case 'instagram':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      )
    case 'linkedin':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      )
    default:
      return null
  }
}

export default Footer