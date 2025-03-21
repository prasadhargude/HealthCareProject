"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Bell, Lock, Shield, CreditCard, Moon, Sun, Globe, LogOut, Save } from 'lucide-react'

interface NotificationSettings {
  email: {
    appointments: boolean
    reminders: boolean
    promotions: boolean
    updates: boolean
  }
  sms: {
    appointments: boolean
    reminders: boolean
    promotions: boolean
  }
}

interface PrivacySettings {
  shareHealthData: boolean
  allowAnonymizedDataUse: boolean
  showProfileToPublic: boolean
}

interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

interface Settings {
  notifications: NotificationSettings
  privacy: PrivacySettings
  language: string
  darkMode: boolean
  paymentMethods: PaymentMethod[]
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("notifications")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/user/settings")
        
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        } else {
          // If API fails, use mock data
          setSettings({
            notifications: {
              email: {
                appointments: true,
                reminders: true,
                promotions: false,
                updates: true
              },
              sms: {
                appointments: true,
                reminders: true,
                promotions: false
              }
            },
            privacy: {
              shareHealthData: false,
              allowAnonymizedDataUse: true,
              showProfileToPublic: false
            },
            language: "en",
            darkMode: false,
            paymentMethods: [
              {
                id: "pm1",
                type: "visa",
                last4: "4242",
                expiryMonth: 12,
                expiryYear: 2025,
                isDefault: true
              },
              {
                id: "pm2",
                type: "mastercard",
                last4: "5555",
                expiryMonth: 10,
                expiryYear: 2024,
                isDefault: false
              }
            ]
          })
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchSettings()
    }
  }, [session])

  const handleToggleChange = (category: string, section: string, setting: string) => {
    setSettings(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        [category]: {
          ...prev[category as keyof Settings] as Record<string, any>,
          [section]: {
            ...(prev[category as keyof Settings] as Record<string, any>)[section],
            [setting]: !(prev[category as keyof Settings] as Record<string, any>)[section][setting]
          }
        }
      }
    })
  }

  const handleSimpleToggle = (setting: string) => {
    setSettings(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        [setting]: !prev[setting as keyof Settings]
      }
    })
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        language: e.target.value
      }
    })
  }

  const handleSetDefaultPaymentMethod = (paymentMethodId: string) => {
    setSettings(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        paymentMethods: prev.paymentMethods.map(pm => ({
          ...pm,
          isDefault: pm.id === paymentMethodId
        }))
      }
    })
  }

  const handleRemovePaymentMethod = (paymentMethodId: string) => {
    setSettings(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        paymentMethods: prev.paymentMethods.filter(pm => pm.id !== paymentMethodId)
      }
    })
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      setSaveSuccess(false)
      
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="md:col-span-3">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Settings Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't find your settings information. Please try refreshing the page or contact support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
        
        {saveSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative dark:bg-green-900 dark:border-green-800 dark:text-green-300" role="alert">
            <span className="block sm:inline">Settings saved successfully!</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === "notifications"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <Bell className="mr-3 h-5 w-5" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === "privacy"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <Shield className="mr-3 h-5 w-5" />
                Privacy & Security
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === "payment"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <CreditCard className="mr-3 h-5 w-5" />
                Payment Methods
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === "preferences"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <Globe className="mr-3 h-5 w-5" />
                Preferences
              </button>
              <hr className="border-gray-200 dark:border-gray-700 my-2" />
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to sign out?")) {
                    // Sign out logic here
                  }
                }}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {activeTab === "notifications" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Appointment Confirmations</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive email confirmations for appointments</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.notifications.email.appointments}
                            onChange={() => handleToggleChange("notifications", "email", "appointments")}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Medication Reminders</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive reminders for medication schedules</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.notifications.email.reminders}
                            onChange={() => handleToggleChange("notifications", "email", "reminders")}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Promotional Emails</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive offers and promotional content</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.notifications.email.promotions}
                            onChange={() => handleToggleChange("notifications", "email", "promotions")}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform Updates</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about new features and services</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.notifications.email.updates}
                            onChange={() => handleToggleChange("notifications", "email", "updates")}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">SMS Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Appointment Alerts</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive SMS alerts for upcoming appointments</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.notifications.sms.appointments}
                            onChange={() => handleToggleChange("notifications", "sms", "appointments")}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Medication Reminders</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive SMS reminders for medication schedules</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.notifications.sms.reminders}
                            onChange={() => handleToggleChange("notifications", "sms", "reminders")}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Promotional SMS</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive offers and promotional content via SMS</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.notifications.sms.promotions}
                            onChange={() => handleToggleChange("notifications", "sms", "promotions")}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "privacy" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Privacy & Security Settings</h2>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Share Health Data with Doctors</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Allow doctors to access your health records</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.privacy.shareHealthData}
                            onChange={() => handleToggleChange("privacy", "", "shareHealthData")}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Anonymized Data Use</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Allow your anonymized data to be used for research and service improvement</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.privacy.allowAnonymizedDataUse}
                            onChange={() => handleToggleChange("privacy", "", "allowAnonymizedDataUse")}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300
                           dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Profile to Public</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Make your profile visible to other users</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.privacy.showProfileToPublic}
                            onChange={() => handleToggleChange("privacy", "", "showProfileToPublic")}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Password</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
                        </div>
                        <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                          Change
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                          Setup
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Login Sessions</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your active login sessions</p>
                        </div>
                        <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                          View
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all data</p>
                        </div>
                        <button className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "payment" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Payment Methods</h2>
                  
                  {settings.paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Payment Methods</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't added any payment methods yet.</p>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        Add Payment Method
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {settings.paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md dark:border-gray-700">
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md dark:bg-gray-700">
                              {method.type === "visa" ? (
                                <span className="text-blue-600 font-bold dark:text-blue-400">VISA</span>
                              ) : method.type === "mastercard" ? (
                                <span className="text-red-600 font-bold dark:text-red-400">MC</span>
                              ) : (
                                <CreditCard className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {method.type.charAt(0).toUpperCase() + method.type.slice(1)} ending in {method.last4}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Expires {method.expiryMonth}/{method.expiryYear}
                              </p>
                            </div>
                            {method.isDefault && (
                              <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {!method.isDefault && (
                              <button 
                                onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              >
                                Set Default
                              </button>
                            )}
                            <button 
                              onClick={() => handleRemovePaymentMethod(method.id)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Add New Payment Method
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "preferences" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Language</h3>
                      <div className="max-w-xs">
                        <select
                          value={settings.language}
                          onChange={handleLanguageChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="ta">Tamil</option>
                          <option value="te">Telugu</option>
                          <option value="mr">Marathi</option>
                          <option value="bn">Bengali</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Appearance</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.darkMode}
                            onChange={() => handleSimpleToggle("darkMode")}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {settings.darkMode ? (
                              <Moon className="w-4 h-4" />
                            ) : (
                              <Sun className="w-4 h-4" />
                            )}
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Accessibility</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Larger Text</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Increase text size for better readability</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}