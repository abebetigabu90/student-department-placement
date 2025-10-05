import React, { useState } from 'react';
import axios from 'axios';

const FirstSemPlacement = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runPlacement = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/placement/runNaturaFirstSem');
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data || { message: 'Failed to run placement' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Natural Science Placement for first semister students</h1>
      
      <button
        onClick={runPlacement}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 mb-4"
      >
        {loading ? 'Running...' : 'Start Placement Process'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong>{error.message}
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>Success: </strong>{result.message}
          
          <div className="mt-3 text-sm">
            <div><strong>Initial Placement:</strong> {result.initialPlacement?.message}</div>
            <div><strong>Female Quota:</strong> {result.femaleQuota?.message}</div>
            <div><strong>Unplaced Students:</strong> {result.unplacedStudents?.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirstSemPlacement;