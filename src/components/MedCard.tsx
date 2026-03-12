import React from 'react';
import { Pill, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface MedCardProps {
  name: string;
  dosage: string;
  time: string;
  status: 'taken' | 'due' | 'missed' | 'upcoming';
  type: 'tablet' | 'capsule' | 'liquid';
  interactionWarning?: boolean;
}

export default function MedCard({ name, dosage, time, status, type, interactionWarning }: MedCardProps) {
  const statusColors = {
    taken: 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]',
    due: 'bg-[#FFFBEB] text-[#92400E] border-[#F59E0B]',
    missed: 'bg-[#FEF0F0] text-[#E84545] border-[#E84545]',
    upcoming: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const statusIcons = {
    taken: <CheckCircle className="w-3 h-3" />,
    due: <Clock className="w-3 h-3" />,
    missed: <XCircle className="w-3 h-3" />,
    upcoming: <Clock className="w-3 h-3" />,
  };

  return (
    <div className={clsx(
      "bg-white rounded-2xl p-5 border flex items-center gap-5 transition-all hover:shadow-md hover:border-[#0ABFB8]",
      interactionWarning ? "border-[#E84545] border-l-4" : "border-gray-200"
    )}>
      <div className={clsx(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        interactionWarning ? "bg-[#FEF0F0] text-[#E84545]" : "bg-[#E6FAFA] text-[#0ABFB8]"
      )}>
        {interactionWarning ? <AlertTriangle className="w-6 h-6" /> : <Pill className="w-6 h-6" />}
      </div>
      
      <div className="flex-1">
        <h3 className="text-[#0A1628] font-bold text-base">{name}</h3>
        <p className="text-gray-400 text-xs font-medium mt-0.5">{dosage} • {type}</p>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <div className="text-xs font-semibold text-gray-500">{time}</div>
        <div className={clsx(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
          statusColors[status]
        )}>
          {statusIcons[status]}
          {status}
        </div>
      </div>
    </div>
  );
}
