import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch all students
    const fetchStudents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/view/students');
            setStudents(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch students');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Delete student
    const handleDelete = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/students/${studentId}`);
                fetchStudents(); // Refresh the list
            } catch (err) {
                setError('Failed to delete student');
            }
        }
    };

    // Toggle student status
    const handleToggleStatus = async (studentId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await axios.patch(`http://localhost:5000/api/admin/updateStudentAccount/${studentId}`, {
                AccountStatus: newStatus
            });
            fetchStudents(); // Refresh the list
        } catch (err) {
            setError('Failed to update student status');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-64">
            <div className="text-lg">Loading...</div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center min-h-64">
            <div className="text-red-500 text-lg">{error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Student Accounts Management
                    </h1>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600">
                            Manage student accounts and their status
                        </p>
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                            <span className="text-sm text-gray-600">Total Students: </span>
                            <span className="font-semibold text-gray-900">{students.length}</span>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Student ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Account Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map((student, index) => (
                                    <tr 
                                        key={student._id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {student.studentId || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {student.firstName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {student.Department || 'Not assigned'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(student._id, student.AccountStatus)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                                    student.AccountStatus === 'active' 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                                    student.AccountStatus === 'active' ? 'bg-green-500' : 'bg-red-500'
                                                }`}></span>
                                                {student.AccountStatus === 'active' ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(student._id)}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {students.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-lg">No students found</div>
                            <p className="text-gray-500 mt-2">No student accounts have been created yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageStudents;