import React, { useState, useEffect } from 'react';
import CreateDepartmentForm from '../components/CreateDepartmentForm';
import UpdateDepartmentForm from '../components/UpdateDepartmentForm';
import DepartmentList from '../components/DepartmentList';

const DepartmentAdmin = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingDepartment, setEditingDepartment] = useState(null);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/view/departments');
      const data = await response.json();
      if (response.ok) setDepartments(data);
      else setError('Failed to fetch departments');
    } catch (err) {
      setError('Error fetching departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/create/department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setSuccess('Department created successfully!');
        fetchDepartments();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Create failed');
      }
    } catch (err) {
      setError('Error creating department');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updateInfo) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/update/department/${updateInfo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateInfo.data)
      });
      
      if (response.ok) {
        setSuccess('Department updated successfully!');
        setEditingDepartment(null);
        fetchDepartments();
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Update failed: ${response.status}`);
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/delete/department/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess('Department deleted successfully!');
        if (editingDepartment?._id === id) setEditingDepartment(null);
        fetchDepartments();
      } else setError('Delete failed');
    } catch (err) {
      setError('Error deleting department');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Department Management</h1>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {editingDepartment ? 'Update Department' : 'Create New Department'}
            </h2>
            {editingDepartment ? (
              <UpdateDepartmentForm
                department={editingDepartment}
                onUpdate={handleUpdate}
                onCancel={() => setEditingDepartment(null)}
                loading={loading}
              />
            ) : (
              <CreateDepartmentForm onSubmit={handleCreate} loading={loading} />
            )}
          </div>

          {/* Department List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Departments ({departments.length})
            </h2>
            <DepartmentList
              departments={departments}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading && !departments.length}
              editingDepartmentId={editingDepartment?._id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAdmin;