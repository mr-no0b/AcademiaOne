'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-900 mb-4">
            AcademiaOne
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Complete University Management System
          </p>
          <div className="mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold mb-6">
            System Running
          </div>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Architecture */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              Architecture
            </h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>State Machine Pattern</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Strategy Pattern</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Adapter Pattern</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Observer Pattern</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Facade Pattern</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Factory Pattern</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Decorator Pattern</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Singleton Pattern</span>
              </div>
            </div>
          </div>

          {/* Core Modules */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              Core Modules
            </h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Course Registration</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Classroom Management</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Attendance Tracking</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Results & Rankings</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Forum Q&A</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Elections</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Notices & Notes</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>Book Recommendations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login Credentials */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Credentials</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-purple-900 mb-2">Admin</h3>
              <p className="text-sm text-gray-700">
                <strong>User ID:</strong> ADMIN-001<br />
                <strong>Password:</strong> admin123
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Teacher</h3>
              <p className="text-sm text-gray-700">
                <strong>User ID:</strong> TCH-001<br />
                <strong>Password:</strong> teacher123
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-900 mb-2">Student</h3>
              <p className="text-sm text-gray-700">
                <strong>User ID:</strong> STU-001<br />
                <strong>Password:</strong> student123
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Start</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">1. Seed Test Data</h3>
              <pre className="bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                npm run seed
              </pre>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">2. Test Login API</h3>
              <pre className="bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto text-sm">
                curl -X POST http://localhost:3000/api/auth/login \<br />
                {`  -H "Content-Type: application/json" \\`}<br />
                {`  -d '{"userId":"STU-001","password":"student123"}'`}
              </pre>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">3. Check System Health</h3>
              <pre className="bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                curl http://localhost:3000/api/health/db
              </pre>
            </div>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="mt-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Documentation</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/QUICKSTART.md"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Quick Start Guide
            </a>
            <a
              href="/DOCUMENTATION.md"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Full Documentation
            </a>
            <a
              href="/API_TESTING.md"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              API Testing Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
