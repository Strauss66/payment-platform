import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../lib/env';

const TestConnection = () => {
  const [apiStatus, setApiStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    setLoading(true);
    const endpoints = [
      { name: 'API Root', url: API_ENDPOINTS.AUTH.replace('/auth', '') },
      { name: 'Health Check', url: API_ENDPOINTS.HEALTH },
      { name: 'Auth Info', url: API_ENDPOINTS.AUTH }
    ];

    const results = {};
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url);
        const data = await response.json();
        results[endpoint.name] = {
          status: response.status,
          data: data,
          success: true
        };
      } catch (error) {
        results[endpoint.name] = {
          status: 'Error',
          error: error.message,
          success: false
        };
      }
    }
    
    setApiStatus(results);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Testing API connections...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>
      
      <div className="mb-6">
        <button 
          onClick={testConnections}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Connections Again
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(apiStatus).map(([name, result]) => (
          <div key={name} className={`p-4 rounded-lg border ${
            result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
          }`}>
            <h3 className="font-semibold text-lg mb-2">{name}</h3>
            <div className="text-sm">
              <p><strong>Status:</strong> {result.status}</p>
              {result.success ? (
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              ) : (
                <p className="text-red-600 mt-2"><strong>Error:</strong> {result.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Configuration:</h3>
        <p><strong>API Base URL:</strong> {API_ENDPOINTS.AUTH.replace('/auth', '')}</p>
        <p><strong>Frontend URL:</strong> {window.location.origin}</p>
      </div>
    </div>
  );
};

export default TestConnection;
