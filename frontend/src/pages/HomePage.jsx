import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            School Platform
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            A comprehensive school management platform for administrators, teachers, and parents.
          </p>
          
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/test"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Test API Connection
            </Link>
            
            <Link
              to="/app"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Go to App
            </Link>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Backend Status</h3>
                <p className="mt-2 text-sm text-gray-500">
                  API server running on port 5001
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Running
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Frontend Status</h3>
                <p className="mt-2 text-sm text-gray-500">
                  React app running on port 3000
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Running
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Database Status</h3>
                <p className="mt-2 text-sm text-gray-500">
                  MySQL connected successfully
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
