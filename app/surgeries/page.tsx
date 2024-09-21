// Add this at the top of your file
'use client';

import React, { useState } from 'react';

type Surgery = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  details: string;
};

const surgeries: Surgery[] = [
  { id: 1, name: 'Appendectomy', description: 'Removal of the appendix', imageUrl: 'https://example.com/appendectomy.jpg', details: 'Appendectomy is a surgical procedure to remove the appendix, typically performed to treat appendicitis or other related conditions.' },
  { id: 2, name: 'Cataract Surgery', description: 'Removal of the cloudy lens from the eye', imageUrl: 'https://example.com/cataract.jpg', details: 'Cataract surgery involves removing the cloudy lens of the eye and replacing it with a clear artificial lens to restore vision.' },
  { id: 3, name: 'Knee Replacement', description: 'Replacement of a damaged knee joint', imageUrl: 'https://example.com/knee-replacement.jpg', details: 'Knee replacement surgery involves replacing a damaged knee joint with an artificial one to relieve pain and improve function.' },
  { id: 4, name: 'Gallbladder Removal', description: 'Removal of the gallbladder', imageUrl: 'https://example.com/gallbladder.jpg', details: 'Gallbladder removal is a procedure to remove the gallbladder, often performed to treat gallstones or inflammation.' },
  { id: 5, name: 'Hernia Repair', description: 'Repair of a hernia in the abdominal wall', imageUrl: 'https://example.com/hernia.jpg', details: 'Hernia repair involves surgical intervention to correct a hernia, where an organ protrudes through an abnormal opening in the abdominal wall.' },
  { id: 6, name: 'Tonsillectomy', description: 'Removal of the tonsils', imageUrl: 'https://example.com/tonsillectomy.jpg', details: 'Tonsillectomy is the surgical removal of the tonsils, typically performed to treat recurrent tonsillitis or other related issues.' },
];

export default function Surgeries() {
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);

  const handleLearnMore = (surgery: Surgery) => {
    setSelectedSurgery(surgery);
  };

  const handleClose = () => {
    setSelectedSurgery(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Surgeries</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        We offer a wide range of surgical procedures performed by experienced surgeons in state-of-the-art facilities.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surgeries.map(surgery => (
          <div key={surgery.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <img 
              src={surgery.imageUrl} 
              alt={surgery.name} 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{surgery.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{surgery.description}</p>
            <button 
              onClick={() => handleLearnMore(surgery)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Learn More
            </button>
          </div>
        ))}
      </div>

      {selectedSurgery && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg relative">
            <button 
              onClick={handleClose} 
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{selectedSurgery.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedSurgery.details}</p>
            <img 
              src={selectedSurgery.imageUrl} 
              alt={selectedSurgery.name} 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <p className="text-gray-600 dark:text-gray-300">{selectedSurgery.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

