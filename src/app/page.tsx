import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <nav className="border-b border-gray-200 px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SafeDose</h1>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Medication Management Made Simple
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Track your medications, set reminders, and stay healthy with SafeDose.
          </p>
          <Link 
            href="/login" 
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded text-lg hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-8 mt-20">
          <div className="p-6 border border-gray-200 rounded">
            <h3 className="text-lg font-bold mb-2">Track Medications</h3>
            <p className="text-gray-600">Keep all your medications organized in one place.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded">
            <h3 className="text-lg font-bold mb-2">Set Reminders</h3>
            <p className="text-gray-600">Never miss a dose with smart notifications.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded">
            <h3 className="text-lg font-bold mb-2">View Reports</h3>
            <p className="text-gray-600">Monitor your adherence with detailed reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}