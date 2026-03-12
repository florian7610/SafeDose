"use client";

import { useState } from 'react';
import { AlertTriangle, Search, CheckCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function Interactions() {
  const [searchTerm, setSearchTerm] = useState('');

  const interactions = [
    {
      id: 1,
      drugs: ['Lisinopril', 'Aspirin'],
      severity: 'moderate',
      description: 'Nonsteroidal anti-inflammatory drugs (NSAIDs) like Aspirin may diminish the antihypertensive effect of Angiotensin-Converting Enzyme (ACE) Inhibitors like Lisinopril.',
      recommendation: 'Monitor blood pressure periodically. Consider alternative pain relief if possible.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEF0F0] text-[#E84545] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0A1628]">1</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Alert</div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0A1628]">Moderate</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Highest Severity</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0A1628]">3</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Safe Meds</div>
          </div>
        </div>
      </div>

      {/* Check Tool */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-[#0A1628] mb-4 font-['Playfair_Display']">Check New Interaction</h3>
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Type a drug name to check against your current list..." 
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0ABFB8] focus:ring-4 focus:ring-[#0ABFB8]/10 transition-all text-sm"
          />
        </div>
      </div>

      {/* Active Interactions List */}
      <div>
        <h3 className="text-lg font-bold text-[#0A1628] mb-4 font-['Playfair_Display']">Current Interaction Reports</h3>
        <div className="space-y-4">
          {interactions.map((interaction) => (
            <motion.div 
              key={interaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border-l-4 border-[#F59E0B] border-t border-r border-b border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">{interaction.drugs[0]}</span>
                  <span className="text-gray-400 text-sm font-bold">+</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">{interaction.drugs[1]}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D] text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3" />
                  {interaction.severity} Risk
                </div>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {interaction.description}
              </p>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex gap-2 items-start">
                  <Info className="w-4 h-4 text-[#0ABFB8] mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Clinical Recommendation</span>
                    <p className="text-sm text-gray-700">{interaction.recommendation}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

