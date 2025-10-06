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
      setError(err.response?.data || { message: 'Failed to run placement process' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Natural Science First Semister Placement System
        </h1>
        <p className="text-gray-600">
          Run automated placement process for Natural Science First semister students
        </p>
      </div>

      {/* Control Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <button
          onClick={runPlacement}
          disabled={loading}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Running Placement Process...</span>
            </div>
          ) : (
            '🚀 Run Complete Placement Process'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800 mb-1">
            <span>❌</span>
            <h3 className="font-semibold">Error</h3>
          </div>
          <p className="text-red-700">{error.message}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <span>✅</span>
              <h3 className="font-semibold">{result.message}</h3>
            </div>
          </div>

          {/* Overall Summary */}
          {result.totals && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">Overall Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.totals.overallStudentsPlaced}</div>
                  <div className="text-blue-700">Total Students Placed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.totals.totalQuotaReplacements}</div>
                  <div className="text-blue-700">Quota Adjustments</div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Initial Placement */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Initial Placement</h4>
              {result.placementResult && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students Placed:</span>
                    <span className="font-medium text-green-600">
                      {result.placementResult.placements ? result.placementResult.placements.length : 0}
                    </span>
                  </div>
                  <p className="text-gray-700 text-xs mt-2">{result.placementResult.message}</p>
                </div>
              )}
            </div>

            {/* Female Quota */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Female Quota</h4>
              {result.quotaResult && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processed:</span>
                    <span className="font-medium">{result.quotaResult.processed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Skipped:</span>
                    <span className="font-medium">{result.quotaResult.skipped}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Errors:</span>
                    <span className="font-medium">{result.quotaResult.errors}</span>
                  </div>
                  <p className="text-gray-700 text-xs mt-2">{result.quotaResult.message}</p>
                </div>
              )}
            </div>

            {/* Unplaced Students */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Unplaced Students</h4>
              {result.unplacedResult && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Placed:</span>
                    <span className="font-medium text-green-600">{result.unplacedResult.placed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{result.unplacedResult.total}</span>
                  </div>
                  <p className="text-gray-700 text-xs mt-2">{result.unplacedResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!loading && !result && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Process Flow</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>1. Initial placement based on first preferences</li>
            <li>2. Female quota adjustment (20% target)</li>
            <li>3. Placement for remaining unplaced students</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FirstSemPlacement;