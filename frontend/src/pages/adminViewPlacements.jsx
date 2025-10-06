import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewPlacements = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch placed students
  const fetchPlacedStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/viewPlacements');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching placed students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacedStudents();
  }, []);

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.middleName?.toLowerCase().includes(searchLower) ||
      student.studentId?.toLowerCase().includes(searchLower) ||
      student.Department?.name?.toLowerCase().includes(searchLower) ||
      student.gender?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading placements...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Student Placements</h1>
        <p>View All Placed Students and Their Assigned Departments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded border text-center">
          <div className="text-xl font-bold">{students.length}</div>
          <div className="text-gray-600">Total Placed</div>
        </div>
        <div className="bg-white p-4 rounded border text-center">
          <div className="text-xl font-bold">
            {students.filter(s => s.gender === 'Female').length}
          </div>
          <div className="text-gray-600">Female Students</div>
        </div>
        <div className="bg-white p-4 rounded border text-center">
          <div className="text-xl font-bold">
            {[...new Set(students.map(s => s.Department?.name))].length}
          </div>
          <div className="text-gray-600">Assigned Departments</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, ID, department, or gender..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-sm text-gray-500 mt-1">
          Showing {filteredStudents.length} of {students.length} placed students
        </div>
      </div>

      {/* Table */}
      <div className="border rounded">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Student ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Gender</th>
              <th className="px-4 py-2 text-left">GPA</th>
              <th className="px-4 py-2 text-left">Grade 12</th>
              <th className="px-4 py-2 text-left">Total Score</th>
              <th className="px-4 py-2 text-left">Department</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-mono">{student.studentId}</td>
                <td className="px-4 py-2">
                  {student.firstName} {student.middleName}
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    student.gender === 'Female' 
                      ? 'bg-pink-100 text-pink-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {student.gender}
                  </span>
                </td>
                <td className="px-4 py-2">{student.gpa}</td>
                <td className="px-4 py-2">{student.entranceScore}</td>
                <td className="px-4 py-2 font-medium">{student.totalScore}</td>
                <td className="px-4 py-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {student.Department?.name}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results Message */}
      {filteredStudents.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No placed students found matching "{searchTerm}"
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-4">
        <button
          onClick={fetchPlacedStudents}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default ViewPlacements;