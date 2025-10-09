// frontend/src/pages/admin/PreferenceSettingPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PreferenceSettingPage = () => {
  const [settings, setSettings] = useState({
    isFirstSemPrefEnabled: false,
    isSecSemPrefEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // ✅ Fetch existing setting from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/setting/preferenceSetting');
        if (res.data) setSettings(res.data);
      } catch (error) {
        console.error('Error fetching preference settings:', error);
        setMessage('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ✅ Toggle handler for both switches
  const handleToggle = (field) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // ✅ Save updated settings to backend
  const handleSave = async () => {
    try {
      setMessage('');
      const res = await axios.put('http://localhost:5000/api/admin/setting/preferenceSetting', settings);
      setMessage('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Error updating settings');
    }
  };

  if (loading) return <p className="text-center mt-8">Loading settings...</p>;

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Preference Submission Settings
      </h2>

      <div className="flex items-center justify-between mb-6">
        <label className="text-lg text-gray-700">
          Enable First Semester Preference Submission
        </label>
        <input
          type="checkbox"
          checked={settings.isFirstSemPrefEnabled}
          onChange={() => handleToggle('isFirstSemPrefEnabled')}
          className="w-5 h-5 accent-blue-600 cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between mb-6">
        <label className="text-lg text-gray-700">
          Enable Second Semester Preference Submission
        </label>
        <input
          type="checkbox"
          checked={settings.isSecSemPrefEnabled}
          onChange={() => handleToggle('isSecSemPrefEnabled')}
          className="w-5 h-5 accent-green-600 cursor-pointer"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
      >
        Save Settings
      </button>

      {message && (
        <p className="text-center mt-4 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default PreferenceSettingPage;
