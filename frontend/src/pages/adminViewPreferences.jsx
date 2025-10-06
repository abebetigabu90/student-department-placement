import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import SimplePreferencesTable from './components/SimplePreferencesTable';
// import SimpleFilters from './components/SimpleFilters';

const AdminPreferencesPage = () => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Fetch preferences
  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/view/preferences');
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

  // Filter preferences
  const filteredPreferences = preferences.filter(pref => {
    const matchesSearch = 
      pref.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pref.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pref.student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment ? 
      pref.department?.name === selectedDepartment : true;

    return matchesSearch && matchesDepartment;
  });

  // Get departments for filter
  const departments = [...new Set(preferences
    .map(pref => pref.department?.name)
    .filter(Boolean)
  )];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Student Preferences</h1>
        <p>View all student department preferences</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded border text-center">
          <div className="text-xl font-bold">{preferences.length}</div>
          <div className="text-gray-600">Total Preferences</div>
        </div>
        <div className="bg-white p-4 rounded border text-center">
          <div className="text-xl font-bold">
            {[...new Set(preferences.map(p => p.student?._id))].length}
          </div>
          <div className="text-gray-600">Students</div>
        </div>
        <div className="bg-white p-4 rounded border text-center">
          <div className="text-xl font-bold">{departments.length}</div>
          <div className="text-gray-600">Departments</div>
        </div>
      </div>

      {/* Filters */}
      {/* <SimpleFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        departments={departments}
      /> */}

      {/* Table */}
      {/* {loading ? (
        <div className="text-center py-8">Loading preferences...</div>
      ) : (
        <SimplePreferencesTable preferences={filteredPreferences} />
      )} */}

      {/* Refresh Button */}
      <div className="mt-4 text-right">
        <button
          onClick={fetchPreferences}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default AdminPreferencesPage;