import React, { useState } from 'react';

const CreateDepartmentForm = ({ onSubmit, loading = false }) => {
  const [form, setForm] = useState({
    deptID: '',
    name: '',
    capacity: '',
    stream: 'natural',
    PrefTimeCategory: 'FirstSem',
    PrefTypeCategory: 'PreEngineering',
    isFinalPref: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      capacity: parseInt(form.capacity)
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Department</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input 
            name="deptID" 
            value={form.deptID} 
            onChange={handleChange} 
            placeholder="Department ID" 
            required 
            className="border p-2 rounded" 
          />
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="Department Name" 
            required 
            className="border p-2 rounded" 
          />
        </div>

        <input 
          type="number" 
          name="capacity" 
          value={form.capacity} 
          onChange={handleChange} 
          placeholder="Capacity" 
          required 
          min="1" 
          className="border p-2 rounded w-full" 
        />

        <div className="grid grid-cols-2 gap-4">
          <select name="stream" value={form.stream} onChange={handleChange} className="border p-2 rounded">
            <option value="natural">Natural</option>
            <option value="social">Social</option>
          </select>

          <select name="PrefTimeCategory" value={form.PrefTimeCategory} onChange={handleChange} className="border p-2 rounded">
            <option value="FirstSem">First Semester</option>
            <option value="SecSemFirst">Second Semester First</option>
            <option value="SecSemSec">Second Semester Second</option>
          </select>
        </div>

        <select name="PrefTypeCategory" value={form.PrefTypeCategory} onChange={handleChange} className="border p-2 rounded w-full">
          <option value="PreEngineering">Pre-Engineering</option>
          <option value="OtherNatural">Other Natural</option>
          <option value="OtherSocial">Other Social</option>
          <option value="Unique">Unique</option>
        </select>

        <label className="flex items-center">
          <input 
            type="checkbox" 
            name="isFinalPref" 
            checked={form.isFinalPref} 
            onChange={handleChange} 
            className="mr-2" 
          />
          Final Preference
        </label>

        <button 
          type="submit" 
          disabled={loading} 
          className="bg-blue-600 text-white p-2 rounded w-full disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Department'}
        </button>
      </form>
    </div>
  );
};

export default CreateDepartmentForm;