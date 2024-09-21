'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

const labTests = [
  { id: 1, name: 'Complete Blood Count (CBC)', price: 29.99, description: 'Measures different components of blood' },
  { id: 2, name: 'Lipid Panel', price: 39.99, description: 'Measures cholesterol and triglycerides' },
  { id: 3, name: 'Thyroid Function Test', price: 49.99, description: 'Measures thyroid hormone levels' },
  { id: 4, name: 'Diabetes Test (HbA1c)', price: 34.99, description: 'Measures average blood sugar levels' },
  { id: 5, name: 'Liver Function Test', price: 44.99, description: 'Assesses liver health and function' },
  { id: 6, name: 'Kidney Function Test', price: 39.99, description: 'Evaluates kidney health and function' },
]

export default function LabTests() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTests = labTests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Lab Tests</h1>
      
      <div className="mb-8">
        <div className="flex">
          <input
            type="text"
            placeholder="Search lab tests"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded-l-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button className="bg-green-600 text-white p-2 rounded-r-md hover:bg-green-700">
            <Search className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map(test => (
          <div key={test.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{test.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">{test.description}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Price: ${test.price.toFixed(2)}</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Book Test</button>
          </div>
        ))}
      </div>
    </div>
  )
}