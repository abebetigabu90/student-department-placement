import React, { useState } from 'react';

const AdminPref = ({ preferences }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter students based on search
  const filteredStudents = preferences.filter((student) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.middleName?.toLowerCase().includes(searchLower) ||
      student.studentId?.toLowerCase().includes(searchLower) ||
      student.priority1?.toLowerCase().includes(searchLower) ||
      student.priority2?.toLowerCase().includes(searchLower) ||
      student.priority3?.toLowerCase().includes(searchLower) ||
      student.priority4?.toLowerCase().includes(searchLower) ||
      student.priority5?.toLowerCase().includes(searchLower) ||
      student.priority6?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-white shadow-md rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by name, ID, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400
                     transition duration-200"
        />
        <div className="text-sm text-gray-500 mt-2 italic">
          Showing <span className="font-semibold text-blue-600">{filteredStudents.length}</span> of{' '}
          <span className="font-semibold">{preferences.length}</span> students
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Stream</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">GPA</th>
              <th className="px-4 py-3">Grade 12</th>
              <th className="px-4 py-3">Total Result</th>
              <th className="px-4 py-3">Priority 1</th>
              <th className="px-4 py-3">Priority 2</th>
              <th className="px-4 py-3">Priority 3</th>
              <th className="px-4 py-3">Priority 4</th>
              <th className="px-4 py-3">Priority 5</th>
              <th className="px-4 py-3">Priority 6</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.map((student, index) => (
              <tr
                key={student._id}
                className={`transition duration-200 hover:bg-blue-50 ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="px-4 py-2 font-medium text-gray-800">
                  {student.firstName} {student.middleName}
                </td>
                <td className="px-4 py-2 text-gray-700">{student.studentId}</td>
                <td className="px-4 py-2 text-gray-700">{student.stream}</td>
                <td className="px-4 py-2 text-gray-700">{student.region}</td>
                <td className="px-4 py-2 text-gray-700">{student.gpa}</td>
                <td className="px-4 py-2 text-gray-700">{student.entranceScore}</td>
                <td className="px-4 py-2 text-gray-700 font-semibold">{student.totalScore}</td>
                <td className="px-4 py-2">{student.priority1}</td>
                <td className="px-4 py-2">{student.priority2}</td>
                <td className="px-4 py-2">{student.priority3}</td>
                <td className="px-4 py-2">{student.priority4}</td>
                <td className="px-4 py-2">{student.priority5}</td>
                <td className="px-4 py-2">{student.priority6}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results Message */}
      {filteredStudents.length === 0 && searchTerm && (
        <div className="text-center py-10 text-gray-500 text-lg font-medium">
          No students found matching "<span className="text-blue-600">{searchTerm}</span>"
        </div>
      )}
    </div>
  );
};

export default AdminPref;
