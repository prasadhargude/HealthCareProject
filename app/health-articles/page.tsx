'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Link from 'next/link'

interface Article {
  _id: string;
  title: string;
  category: string;
  author: string;
  date: string;
}

export default function HealthArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/health-articles')
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
      } else {
        console.error('Failed to fetch articles')
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    }
  }

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Health Articles</h1>
      
      <div className="mb-8">
        <div className="flex">
          <input
            type="text"
            placeholder="Search articles"
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
        {filteredArticles.map(article => (
          <div key={article._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{article.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">Category: {article.category}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">By {article.author}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Published on {article.date}</p>
            <Link href={`/health-articles/${article._id}`} className="text-green-600 dark:text-green-400 hover:underline">Read More</Link>
          </div>
        ))}
      </div>
    </div>
  )
}