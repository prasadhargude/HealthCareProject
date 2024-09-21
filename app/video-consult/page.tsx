'use client';

import { useState, useEffect } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Specialty {
  _id: string;
  name: string;
}

export default function VideoConsult() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchSpecialties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/specialties');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSpecialties(data);
    } catch (err) {
      console.error('Error fetching specialties:', err);
      setError('Failed to load specialties. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const handleSchedule = () => {
    if (selectedSpecialty) {
      router.push(`/video-consult/book?specialty=${encodeURIComponent(selectedSpecialty)}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Video Consultation</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Choose a Specialty</h2>
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading specialties...</p>
        ) : error ? (
          <div className="text-red-500 flex items-center">
            <span>{error}</span>
            <button 
              onClick={fetchSpecialties} 
              className="ml-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              aria-label="Retry loading specialties"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        ) : specialties.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No specialties available at the moment.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {specialties.map(specialty => (
              <button
                key={specialty._id}
                onClick={() => setSelectedSpecialty(specialty.name)}
                className={`p-4 rounded-md text-center transition-colors ${
                  selectedSpecialty === specialty.name
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-green-100 dark:hover:bg-green-900'
                }`}
              >
                {specialty.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSpecialty && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Book a Video Consultation with a {selectedSpecialty}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Get expert medical advice from the comfort of your home.</p>
          <button 
            onClick={handleSchedule}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center transition-colors"
          >
            <Calendar className="mr-2" />
            Schedule Now
          </button>
        </div>
      )}
    </div>
  );
}