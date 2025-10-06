import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminPref from '../components/prefTable';

const VerySimpleAdminPreferencesPage = () => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch preferences
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/view/stuPreferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Student Preferences</h1>
        <p className="text-gray-600">All student department preferences</p>
      </div>

      {/* Stats */}
      <div className="mb-6 flex justify-center">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-center w-40">
          <div className="text-3xl font-bold text-blue-600">{preferences.length}</div>
          <div className="text-gray-500 text-sm mt-1">Students</div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4 border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-700">Student Department Choices</h2>
          <button
            onClick={fetchPreferences}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md shadow-sm transition-all duration-200"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 animate-pulse">
            Loading student preferences...
          </div>
        ) : (
          <AdminPref preferences={preferences} />
        )}
      </div>
    </div>
  );
};

export default VerySimpleAdminPreferencesPage;
