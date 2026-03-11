import React from 'react';

export default function DashboardHome() {
  const stats = [
    { label: 'Active Medications', value: '4' },
    { label: 'Adherence Rate', value: '92%' },
    { label: 'Next Dose', value: '2:00 PM' },
  ];

  const todaysMeds = [
    { name: 'Metformin', dosage: '500mg', time: '8:00 AM', taken: true },
    { name: 'Lisinopril', dosage: '10mg', time: '2:00 PM', taken: false },
    { name: 'Atorvastatin', dosage: '20mg', time: '8:00 PM', taken: false },
  ];

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded border border-gray-200">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Today's Medications</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {todaysMeds.map((med, idx) => (
            <div key={idx} className="px-6 py-4 flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">{med.name}</div>
                <div className="text-sm text-gray-600">{med.dosage}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{med.time}</span>
                <span 
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    med.taken 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {med.taken ? 'Taken' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}