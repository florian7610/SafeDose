import React, { useState } from 'react';

export default function MedManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const meds = [
    { id: 1, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
    { id: 2, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    { id: 3, name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' },
    { id: 4, name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
  ];

  const filteredMeds = meds.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Medications</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Medication
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search medications..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Medications List */}
      <div className="bg-white rounded border border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
            <div>Name</div>
            <div>Dosage</div>
            <div>Frequency</div>
            <div>Actions</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredMeds.map((med) => (
            <div key={med.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="font-medium text-gray-900">{med.name}</div>
                <div className="text-gray-600">{med.dosage}</div>
                <div className="text-gray-600">{med.frequency}</div>
                <div className="flex gap-2">
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Edit
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Medication</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication Name
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Aspirin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 100mg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500">
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Three times daily</option>
                  <option>As needed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}