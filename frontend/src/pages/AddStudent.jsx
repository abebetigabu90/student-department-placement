import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../utils/api';

const AddStudent = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    gender: '',
    region: '',
    entranceScore: '',
    entranceMax: '600',
    gpa: '',
    disability: 'None',
    disabilityVerified: false,
    preferences: []
  });

  const regions = [
    'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa',
    'Gambella', 'Harari', 'Oromia', 'Sidama', 'SNNP', 'Somali', 'Tigray'
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/students', formData);
      navigate('/students');
    } catch (error) {
      console.error('Error creating student:', error);
      alert(error.response?.data?.message || 'Error creating student');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: checked
        ? [...prev.preferences, value]
        : prev.preferences.filter(p => p !== value)
    }));
  };

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Students
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter student information and department preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student ID *
              </label>
              <input
                type="text"
                name="studentId"
                required
                className="input-field mt-1"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g., dtu14R0059"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                className="input-field mt-1"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender *
              </label>
              <select
                name="gender"
                required
                className="input-field mt-1"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Region *
              </label>
              <select
                name="region"
                required
                className="input-field mt-1"
                value={formData.region}
                onChange={handleChange}
              >
                <option value="">Select Region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Entrance Score *
              </label>
              <input
                type="number"
                name="entranceScore"
                required
                min="0"
                className="input-field mt-1"
                value={formData.entranceScore}
                onChange={handleChange}
                placeholder="e.g., 555"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Entrance Max Score *
              </label>
              <select
                name="entranceMax"
                required
                className="input-field mt-1"
                value={formData.entranceMax}
                onChange={handleChange}
              >
                <option value="600">600</option>
                <option value="700">700</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                GPA *
              </label>
              <input
                type="number"
                name="gpa"
                required
                min="0"
                max="4"
                step="0.01"
                className="input-field mt-1"
                value={formData.gpa}
                onChange={handleChange}
                placeholder="e.g., 3.5"
              />
            </div>
          </div>
        </div>

        {/* Disability Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Disability Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Disability Status
              </label>
              <input
                type="text"
                name="disability"
                className="input-field mt-1"
                value={formData.disability}
                onChange={handleChange}
                placeholder="None or specify disability"
              />
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                name="disabilityVerified"
                id="disabilityVerified"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.disabilityVerified}
                onChange={handleChange}
              />
              <label htmlFor="disabilityVerified" className="ml-2 block text-sm text-gray-900">
                Disability Verified
              </label>
            </div>
          </div>
        </div>

        {/* Department Preferences */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Department Preferences</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select up to 5 departments in order of preference
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map(dept => (
              <label key={dept._id} className="flex items-center">
                <input
                  type="checkbox"
                  value={dept.name}
                  checked={formData.preferences.includes(dept.name)}
                  onChange={handlePreferenceChange}
                  disabled={formData.preferences.length >= 5 && !formData.preferences.includes(dept.name)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">{dept.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {formData.preferences.length}/5
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Create Student
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;