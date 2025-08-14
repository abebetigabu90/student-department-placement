import { useState, useEffect } from 'react';
import { Play, RotateCcw, Users, Building2, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

const Placement = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    eligibleSem1: 0,
    eligibleSem2: 0,
    totalDepartments: 0
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, departmentsRes] = await Promise.all([
        api.get('/students'),
        api.get('/departments')
      ]);

      const students = studentsRes.data;
      const departments = departmentsRes.data;
      
      const eligibleSem1 = students.filter(s => 
        s.placementStage === 'admitted' && 
        s.gpa != null && 
        s.preferences?.length > 0
      ).length;

      const eligibleSem2 = students.filter(s => 
        s.placementStage === 'after-sem1' && 
        s.cgpa != null && 
        s.preferences?.length > 0
      ).length;

      setStats({
        totalStudents: students.length,
        eligibleSem1,
        eligibleSem2,
        totalDepartments: departments.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const runPlacement = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/placement/run');
      setResult(response.data);
      fetchStats(); // Refresh stats after placement
    } catch (err) {
      setError(err.response?.data?.message || 'Placement failed');
    } finally {
      setLoading(false);
    }
  };

  const clearPlacements = async () => {
    if (!window.confirm('Are you sure you want to clear all placements? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/placement/clear');
      setResult(null);
      fetchStats(); // Refresh stats after clearing
      alert('All placements cleared successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear placements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Placement Algorithm</h1>
        <p className="mt-1 text-sm text-gray-600">
          Run the automated student placement system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Eligible Sem 1</p>
              <p className="text-lg font-semibold text-gray-900">{stats.eligibleSem1}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Eligible Sem 2</p>
              <p className="text-lg font-semibold text-gray-900">{stats.eligibleSem2}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Departments</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalDepartments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Placement Actions</h3>
        <div className="flex space-x-4">
          <button
            onClick={runPlacement}
            disabled={loading}
            className="btn-primary inline-flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Placement Algorithm
          </button>

          <button
            onClick={clearPlacements}
            disabled={loading}
            className="btn-danger inline-flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All Placements
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card mb-6 border-red-200 bg-red-50">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Placement Results */}
      {result && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Placement Results</h3>
          
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800">Total Placed</p>
              <p className="text-2xl font-bold text-green-900">{result.summary.placedStudents}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">Unplaced</p>
              <p className="text-2xl font-bold text-yellow-900">{result.summary.unplacedStudents}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Total Students</p>
              <p className="text-2xl font-bold text-blue-900">{result.summary.totalStudents}</p>
            </div>
          </div>

          {/* Semester Results */}
          {result.summary.semester1Results && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Semester 1 Results</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Placed: </span>
                  <span className="font-semibold">{result.summary.semester1Results.placed}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Unplaced: </span>
                  <span className="font-semibold">{result.summary.semester1Results.unplaced}</span>
                </div>
              </div>
            </div>
          )}

          {result.summary.semester2Results && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Semester 2 Results</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Placed: </span>
                  <span className="font-semibold">{result.summary.semester2Results.placed}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Unplaced: </span>
                  <span className="font-semibold">{result.summary.semester2Results.unplaced}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Placement;