import React, { useState } from 'react';

const UpdateDepartmentForm = ({ department, onUpdate, onCancel, loading = false }) => {
  const [form, setForm] = useState({
    deptID: department?.deptID || '', name: department?.name || '', capacity: department?.capacity || '',
    stream: department?.stream || 'natural', PrefTimeCategory: department?.PrefTimeCategory || 'FirstSem',
    PrefTypeCategory: department?.PrefTypeCategory || 'PreEngineering', isFinalPref: department?.isFinalPref || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      id: department._id,  // The department ID to update
      data: {
        ...form,
        capacity: parseInt(form.capacity)
      }
        });
    // onUpdate({ ...form, capacity: parseInt(form.capacity) });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  if (!department) return <div className="bg-white rounded-lg border p-6">No department selected</div>;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Department</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input name="deptID" value={form.deptID} onChange={handleChange} placeholder="Department ID" required className="border p-2 rounded" />
          <input name="name" value={form.name} onChange={handleChange} placeholder="Department Name" required className="border p-2 rounded" />
        </div>

        <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder="Capacity" required min="1" className="border p-2 rounded w-full" />

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
          <input type="checkbox" name="isFinalPref" checked={form.isFinalPref} onChange={handleChange} className="mr-2" />
          Final Preference
        </label>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded flex-1 disabled:opacity-50">
            {loading ? 'Updating...' : 'Update'}
          </button>
          <button type="button" onClick={onCancel} className="border p-2 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UpdateDepartmentForm;