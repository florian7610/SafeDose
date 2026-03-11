import React from 'react';
import { User, Bell, Lock, Smartphone } from 'lucide-react';

export default function Settings() {
  const sections = [
    {
      title: 'Profile Settings',
      icon: User,
      items: ['Personal Information', 'Medical Profile', 'Insurance Details']
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: ['Dose Reminders', 'Refill Alerts', 'Appointment Reminders']
    },
    {
      title: 'Security',
      icon: Lock,
      items: ['Change Password', 'Two-Factor Authentication', 'Connected Devices']
    },
    {
      title: 'App Preferences',
      icon: Smartphone,
      items: ['Theme', 'Language', 'Data Usage']
    }
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {sections.map((section, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500">
              <section.icon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#0A1628]">{section.title}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {section.items.map((item, i) => (
              <button key={i} className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors">
                <span className="text-sm font-medium text-gray-700">{item}</span>
                <span className="text-gray-400 group-hover:text-[#0ABFB8] transition-colors text-lg">›</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
