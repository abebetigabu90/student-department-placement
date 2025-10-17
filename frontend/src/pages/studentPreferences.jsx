// components/StudentPreferences.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentPreferences = () => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      // Get student ID from localStorage or your auth system
      const storedUserData = localStorage.getItem('userData');
      if (!storedUserData) {
        setError('User data not found');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(storedUserData);
      const studentId = userData.studentId;
      
      if (!studentId) {
        setError('Student ID not found');
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/my/preferences/${studentId}`);
      
      if (response.data.success) {
        setPreferences(response.data.data);
      } else {
        setError('Failed to fetch preferences');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching preferences');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            My Department Preferences
          </h1>
          <p className="text-blue-100">
            View your submitted department preferences in order of priority
          </p>
        </div>

        {/* Preferences List */}
        <div className="p-6">
          {preferences.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Preferences Submitted
              </h3>
              <p className="text-gray-500">
                You haven't submitted any department preferences yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {preferences.map((preference, index) => (
                <div
                  key={preference._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    {/* Priority Badge */}
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                        #{preference.priority}
                      </span>
                    </div>
                    
                    {/* Department Info - FIXED: using deptID instead of code */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {preference.department?.name || 'Department Name'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Department ID: {preference.department?.deptID || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Submitted
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        {preferences.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Last updated: {preferences[0]?.updatedAt ? 
                  new Date(preferences[0].updatedAt).toLocaleDateString() : 
                  'N/A'}
              </span>
              <span>
                Total preferences: {preferences.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPreferences;