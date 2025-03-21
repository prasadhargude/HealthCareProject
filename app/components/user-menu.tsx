"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { User, Settings, LogOut, UserCircle, Heart, Calendar, FileText, ShoppingBag, Bell } from 'lucide-react'

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Open user menu</span>
        {user.image ? (
          <div className="relative">
            <Image
              src={user.image || "/placeholder.svg"}
              alt={user.name || "User"}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
          </div>
        ) : (
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserCircle className="h-6 w-6" />}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
          </div>
        )}
        <span className="ml-2 hidden lg:block">{user.name?.split(" ")[0]}</span>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
            <div className="flex items-center">
              {user.image ? (
                <Image
                  src={user.image || "/placeholder.svg"}
                  alt={user.name || "User"}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserCircle className="h-8 w-8" />}
                </div>
              )}
              <div className="ml-3">
                <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
              Your Profile
            </Link>

            <Link
              href="/appointments"
              className="flex items-center px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Calendar className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
              Appointments
            </Link>

            <Link
              href="/medical-records"
              className="flex items-center px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FileText className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
              Medical Records
            </Link>

            <Link
              href="/orders"
              className="flex items-center px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
              Orders
            </Link>

            <Link
              href="/saved-doctors"
              className="flex items-center px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
              Saved Doctors
            </Link>

            <Link
              href="/notifications"
              className="flex items-center px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Bell className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
              Notifications
              <span className="ml-auto bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">
                3
              </span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
              Settings
            </Link>
          </div>

          <div className="py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-5 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}