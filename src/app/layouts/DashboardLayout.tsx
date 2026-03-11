import React from 'react';
import { Outlet, Link } from 'react-router';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">SafeDose</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">John Doe</span>
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              Logout
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="space-y-1">
            <Link 
              to="/app" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Dashboard
            </Link>
            <Link 
              to="/app/meds" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Medications
            </Link>
            <Link 
              to="/app/reports" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Reports
            </Link>
            <Link 
              to="/app/settings" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Settings
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}