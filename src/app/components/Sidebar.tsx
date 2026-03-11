import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router';
import { LayoutDashboard, Pill, ShieldAlert, BarChart3, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';

export default function Sidebar() {
  const navigate = useNavigate();
  const navItems = [
    { section: "DASHBOARD", items: [
      { name: 'Dashboard', path: '/app', icon: LayoutDashboard, end: true }
    ]},
    { section: "MANAGEMENT", items: [
      { name: 'Med Manager', path: '/app/meds', icon: Pill },
      { name: 'Interactions', path: '/app/interactions', icon: ShieldAlert, badge: '2' },
    ]},
    { section: "REPORTS", items: [
      { name: 'Reports', path: '/app/reports', icon: BarChart3 },
      { name: 'Settings', path: '/app/settings', icon: Settings },
    ]}
  ];

  return (
    <div className="w-[230px] bg-[#0A1628] flex flex-col h-screen fixed left-0 top-0 border-r border-white/5 text-slate-400 font-[Outfit]">
      {/* Logo */}
      <Link to="/" className="p-6 border-b border-white/5 block hover:bg-white/5 transition-colors">
        <div className="font-['Playfair_Display'] text-[#0ABFB8] text-xl font-bold tracking-tight">
          Safe<span className="text-white">Dose</span>
        </div>
      </Link>

      {/* User Profile */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#0ABFB8] flex items-center justify-center text-white font-bold text-sm">
          JD
        </div>
        <div>
          <div className="text-white text-sm font-semibold">Jane Doe</div>
          <div className="text-xs text-slate-500">Premium Member</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navItems.map((group, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-widest text-slate-600 uppercase">
              {group.section}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive 
                      ? "bg-[#0ABFB8]/15 text-[#0ABFB8]" 
                      : "hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-[#E84545] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-3 py-2 w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
