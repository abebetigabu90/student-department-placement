import { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../utils/api';

const Placement = () => {
  const [running, setRunning] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const runPlacement = async () => {
    setRunning(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/placement/run');
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Placement algorithm failed');
    } finally {
      setRunning(false);
    }
  };

  const clearPlacements = async () => {
    if (!window.confirm('Are you sure you want to clear all placements? This action cannot be undone.')) {
      return;
    }

    setClearing(true);
    setError('');

    try {
      await api.post('/placement/clear');
      setResult(null);
      alert('All placements cleared successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear placements');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Placement Algorithm</h1>
        <p className="mt-1 text-sm text-gray-600">
          Run the student placement algorithm to assign students to departments
        </p>
      </div>

      {/* Control Panel */}
      <div className="card mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Algorithm Controls</h3>
        <div className="flex space-x-4">
          <button
            onClick={runPlacement}
            disabled={running}
            className="btn-primary inline-flex items-center"
          >
            {running ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running Algorithm...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Placement
              </>
            )}
          </button>
          <button
            onClick={clearPlacements}
            disabled={clearing || running}
            className="btn-danger inline-flex items-center"
          >
            {clearing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Clearing...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All Placements
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="card mb-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-lg font-medium text-green-700">
              Placement Algorithm Completed Successfully!
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {result.summary.totalStudents}
              </div>
              <div className="text-sm text-blue-700">Total Students</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {result.summary.placedStudents}
              </div>
              <div className="text-sm text-green-700">Placed Students</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">
                {result.summary.unplacedStudents}
              </div>
              <div className="text-sm text-orange-700">Unplaced Students</div>
            </div>
          </div>

          <h4 className="text-md font-medium text-gray-900 mb-3">Department Summary</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Males
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Females
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Female %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.summary.departments.map((dept) => (
                  <tr key={dept.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.filled}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.males}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.females}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        dept.femalePercentage >= 20 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {dept.femalePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Algorithm Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">How the Algorithm Works</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-medium text-primary-600">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Score Calculation</h4>
              <p>Each student receives a total score based on:</p>
              <ul className="mt-1 ml-4 list-disc">
                <li>GPA (50% weight)</li>
                <li>Entrance Score (20% weight)</li>
                <li>Affirmative Action Points (Female: +5, Disability: +5, Emerging Region: +5)</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-medium text-primary-600">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Merit-Based Placement</h4>
              <p>Students are ranked by total score and placed in their preferred departments based on availability.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-medium text-primary-600">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Gender Quota Enforcement</h4>
              <p>Ensures at least 20% female representation in each department by replacing lowest-scoring males with highest-scoring available females when necessary.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Placement;