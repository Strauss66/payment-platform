import React from 'react';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">School Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/test" className="text-gray-500 hover:text-gray-700">Test API</a>
              <a href="/app" className="text-gray-500 hover:text-gray-700">App</a>
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;