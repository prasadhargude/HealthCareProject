'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

interface Plan {
  _id: string;
  name: string;
  price: number;
  features: string[];
}

export default function ForHospitals() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [features, setFeatures] = useState<string[]>([])

  useEffect(() => {
    fetchPlans()
    fetchFeatures()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/hospital-plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      } else {
        console.error('Failed to fetch plans')
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/hospital-features')
      if (response.ok) {
        const data = await response.json()
        setFeatures(data)
      } else {
        console.error('Failed to fetch features')
      }
    } catch (error) {
      console.error('Error fetching features:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">For Hospitals</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Our Solutions</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          HealthConnect offers comprehensive solutions for hospitals and healthcare providers. Our platform is designed to streamline operations, improve patient care, and increase efficiency.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <Check className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{feature}</h3>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Pricing Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${selectedPlan === plan._id ? 'ring-2 ring-green-600' : ''}`}>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{plan.name}</h3>
              <p className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">${plan.price}<span className="text-sm font-normal">/month</span></p>
              <ul className="mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center mb-2">
                    <Check className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSelectedPlan(plan._id)}
                className={`w-full py-2 px-4 rounded-md ${
                  selectedPlan === plan._id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-green-600 hover:text-white'
                }`}
              >
                {selectedPlan === plan._id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}