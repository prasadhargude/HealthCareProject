import Link from 'next/link';
import { Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col min-h-screen justify-center">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Your Home for Health</h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">Find and Book the Best Healthcare Services</p>
          <form className="flex flex-col items-center">
            <div className="relative mb-4 w-full max-w-md">
              <input
                type="text"
                placeholder="Enter location"
                className="p-2 border border-gray-300 rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="relative mb-4 w-full max-w-md">
              <input
                type="text"
                placeholder="Search doctors, clinics, hospitals, etc."
                className="p-2 border border-gray-300 rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button type="submit" className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 flex items-center">
              <Search className="w-6 h-6 mr-2" />
              Search
            </button>
          </form>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Find Doctors Near You</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Book appointments with top doctors in your area.</p>
            <Link href="/find-doctors" className="text-green-600 dark:text-green-400 font-semibold hover:underline">Find Now →</Link>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Instant Video Consultation</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Connect with doctors online for quick medical advice.</p>
            <Link href="/video-consult" className="text-green-600 dark:text-green-400 font-semibold hover:underline">Consult Now →</Link>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Surgeries</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Safe and trusted surgery centers for various procedures.</p>
            <Link href="/surgeries" className="text-green-600 dark:text-green-400 font-semibold hover:underline">Explore →</Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Our Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Medicines', 'Lab Tests', 'Health Articles', 'For Hospitals'].map((service) => (
              <div key={service} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{service}</h3>
                <Link href={`/${service.toLowerCase().replace(' ', '-')}`} className="text-green-600 dark:text-green-400 hover:underline">Learn More</Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}