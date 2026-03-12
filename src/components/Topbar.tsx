import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useLocation } from 'react-router';

export default function Topbar() {
  const location = useLocation();
  
  const getPageTitle = (path: string) => {
    switch(true) {
      case path === '/app': return { title: 'Dashboard', subtitle: 'Overview of your medication adherence' };
      case path.includes('/meds'): return { title: 'Med Manager', subtitle: 'Add, edit, and track your prescriptions' };
      case path.includes('/interactions'): return { title: 'Interaction Center', subtitle: 'Analyze potential drug conflicts' };
      case path.includes('/reports'): return { title: 'Health Reports', subtitle: 'Weekly and monthly adherence analytics' };
      case path.includes('/settings'): return { title: 'Settings', subtitle: 'Manage your profile and preferences' };
      default: return { title: 'Dashboard', subtitle: 'Welcome back, Jane' };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-[#0A1628] font-['Playfair_Display']">{title}</h2>
        <p className="text-xs text-gray-400 font-[Outfit] mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0ABFB8] w-64 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#0ABFB8] transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#E84545] rounded-full border-2 border-white"></span>
          </button>
          
          <div className="w-9 h-9 rounded-full bg-[#0ABFB8] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity">
            JD
          </div>
        </div>
      </div>
    </div>
  );
}
