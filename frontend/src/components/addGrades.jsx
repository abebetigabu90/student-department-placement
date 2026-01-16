import React, { useState } from 'react';
import axios from 'axios';

const AddGradesModal = ({ student, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    gpaOrcgpa: '',
    cgpa: '',
    entranceScore: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const requestData = {
        ...formData,
        gpaOrcgpa: parseFloat(formData.gpaOrcgpa),
        entranceScore: parseFloat(formData.entranceScore)
      };

      await axios.post(`http://localhost:5000/api/students/${student._id}/grades`, requestData);
      
      onSuccess();
      onClose();
    } catch (error) {
      setError('Failed to add grades. Please try again.');
      console.error('Error adding grades:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Add Grades
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Adding grades for: <span className="font-semibold">{student?.firstName}</span>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Student ID: {student?.studentId}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="gpaOrcgpa" className="block text-sm font-medium text-gray-700 mb-2">
                  gpa or cgpa *
                </label>
                <input
                  type="number"
                  id="gpaOrcgpa"
                  name="gpaOrcgpa"
                  step="0.01"
                  min="1.51"
                  max="4.0"
                  value={formData.gpaOrcgpa}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter GPA or CGPA (0.0 - 4.0)"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="entranceScore" className="block text-sm font-medium text-gray-700 mb-2">
                  Grade 12 Exam Score *
                </label>
                <input
                  type="number"
                  id="entranceScore"
                  name="entranceScore"
                  min="250"
                  max="600"
                  value={formData.entranceScore}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter exam score (0-600)"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  'Add Grades'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 focus:outline-hidden focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGradesModal;