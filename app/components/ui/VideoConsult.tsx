'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, RefreshCw, Search, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Specialty {
  _id: string;
  name: string;
  icon: string;
}

interface Symptom {
  id: number;
  name: string;
  specialty: string;
}

const commonSymptoms: Symptom[] = [
  { id: 1, name: 'Fever', specialty: 'General Practitioner' },
  { id: 2, name: 'Headache', specialty: 'Neurologist' },
  { id: 3, name: 'Cough', specialty: 'Pulmonologist' },
  { id: 4, name: 'Fatigue', specialty: 'General Practitioner' },
  { id: 5, name: 'Shortness of breath', specialty: 'Pulmonologist' },
  { id: 6, name: 'Chest pain', specialty: 'Cardiologist' },
  { id: 7, name: 'Nausea', specialty: 'Gastroenterologist' },
  { id: 8, name: 'Dizziness', specialty: 'Neurologist' },
  { id: 9, name: 'Skin rash', specialty: 'Dermatologist' },
  { id: 10, name: 'Joint pain', specialty: 'Rheumatologist' },
];

const commonConcerns = [
  { name: 'Cough & Cold', image: '/images/cough-cold.jpg' },
  { name: 'Skin Problems', image: '/images/skin-problems.jpg' },
  { name: 'Stomach Issues', image: '/images/stomach-issues.jpg' },
  { name: 'Depression', image: '/images/depression.jpg' },
];

export default function VideoConsult() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [symptomInput, setSymptomInput] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [suggestions, setSuggestions] = useState<Symptom[]>([]);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

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

  const handleSymptomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSymptomInput(value);
    if (value.length > 1) {
      const matchedSymptoms = commonSymptoms.filter(
        (symptom) => symptom.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matchedSymptoms);
    } else {
      setSuggestions([]);
    }
  };

  const addSymptom = (symptom: Symptom) => {
    if (!selectedSymptoms.some((s) => s.id === symptom.id)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
    setSymptomInput('');
    setSuggestions([]);
  };

  const removeSymptom = (symptomId: number) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s.id !== symptomId));
  };

  const handleDiagnosis = () => {
    if (selectedSymptoms.length === 0) {
      setDiagnosis("Please select at least one symptom for a diagnosis.");
      return;
    }

    const specialtyCounts: { [key: string]: number } = {};
    selectedSymptoms.forEach((symptom) => {
      specialtyCounts[symptom.specialty] = (specialtyCounts[symptom.specialty] || 0) + 1;
    });

    const recommendedSpecialty = Object.entries(specialtyCounts).reduce(
      (a, b) => (a[1] > b[1] ? a : b)
    )[0];

    setSelectedSpecialty(recommendedSpecialty);
    setDiagnosis(`Based on your symptoms, we recommend consulting a ${recommendedSpecialty}.`);
  };

  const handleSchedule = () => {
    if (selectedSpecialty) {
      router.push(`/video-consult/book?specialty=${encodeURIComponent(selectedSpecialty)}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="bg-green-50 rounded-lg p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h1 className="text-4xl font-bold text-green-800 mb-4">Skip the travel!</h1>
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Take Online Doctor Consultation</h2>
            <p className="text-green-600 mb-6">Private consultation • Starts at RS.199</p>
            <Button size="lg" onClick={() => document.getElementById('symptom-checker')?.scrollIntoView({ behavior: 'smooth' })}>
              Start Symptom Check
            </Button>
          </div>
          <div className="md:w-1/2">
            <Image src="/images/video-consult-hero.jpg" alt="Online Doctor Consultation" width={500} height={300} className="rounded-lg" />
          </div>
        </div>
      </section>

      {/* Symptom Checker */}
      <section id="symptom-checker" className="mb-12">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Symptom Checker</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="symptom-input" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your symptoms:
            </label>
            <div className="relative">
              <input
                type="text"
                id="symptom-input"
                className="w-full p-2 pr-10 border border-gray-300 rounded-md"
                value={symptomInput}
                onChange={handleSymptomInput}
                placeholder="e.g., Headache"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => {
                  const newSymptom = { id: Date.now(), name: symptomInput, specialty: 'General Practitioner' };
                  addSymptom(newSymptom);
                }}
                disabled={!symptomInput}
              >
                Add
              </Button>
            </div>
            {suggestions.length > 0 && (
              <ul className="mt-2 border border-gray-200 rounded-md bg-white">
                {suggestions.map((symptom) => (
                  <li
                    key={symptom.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => addSymptom(symptom)}
                  >
                    {symptom.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Selected Symptoms:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symptom) => (
                <span key={symptom.id} className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full flex items-center">
                  {symptom.name}
                  <button
                    type="button"
                    onClick={() => removeSymptom(symptom.id)}
                    className="bg-transparent hover:bg-green-200 rounded-full h-4 w-4 inline-flex items-center justify-center ml-1"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {symptom.name}</span>
                  </button>
                </span>
              ))}
            </div>
          </div>
          <Button onClick={handleDiagnosis} className="w-full mb-4">
            Get Diagnosis
          </Button>
          {diagnosis && (
            <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">
              {diagnosis}
            </div>
          )}
          {selectedSpecialty && (
            <Button onClick={handleSchedule} className="w-full">
              Schedule Consultation with {selectedSpecialty}
            </Button>
          )}
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="mb-12">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Choose a Specialty</h2>
        {isLoading ? (
          <p className="text-gray-600">Loading specialties...</p>
        ) : error ? (
          <div className="text-red-500 flex items-center">
            <span>{error}</span>
            <button 
              onClick={fetchSpecialties} 
              className="ml-4 p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              aria-label="Retry loading specialties"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        ) : specialties.length === 0 ? (
          <p className="text-gray-600">No specialties available at the moment.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {specialties.map(specialty => (
              <button
                key={specialty._id}
                onClick={() => setSelectedSpecialty(specialty.name)}
                className={`p-4 rounded-md text-center transition-colors ${
                  selectedSpecialty === specialty.name
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-800 hover:bg-green-100'
                }`}
              >
                <div className="text-4xl mb-2">{specialty.icon}</div>
                <h3 className="font-semibold">{specialty.name}</h3>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Common Health Concerns Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Common Health Concerns</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {commonConcerns.map((concern, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image src={concern.image} alt={concern.name} width={300} height={200} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="text-green-700 font-semibold">{concern.name}</h3>
                <Link href="#" className="text-green-600 text-sm hover:underline">Consult Now</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works Section */}
      <section>
        <h2 className="text-2xl font-bold text-green-800 mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">1</span>
            </div>
            <h3 className="font-semibold text-green-700 mb-2">Check Your Symptoms</h3>
            <p className="text-green-600">Use our symptom checker to get a preliminary diagnosis</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">2</span>
            </div>
            <h3 className="font-semibold text-green-700 mb-2">Book a Consultation</h3>
            <p className="text-green-600">Select a convenient time slot for your consultation</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">3</span>
            </div>
            <h3 className="font-semibold text-green-700 mb-2">Consult with Doctor</h3>
            <p className="text-green-600">Connect with the doctor via video call at the scheduled time</p>
          </div>
        </div>
      </section>
    </div>
  );
}