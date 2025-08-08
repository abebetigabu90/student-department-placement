import { useState, useEffect } from 'react';
import { Download, Users, Award, Filter } from 'lucide-react';
import api from '../utils/api';

const Results = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [sortBy, setSortBy] = useState('score');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await api.get('/placement/results');
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results) return;

    let csvContent = 'Department,Student ID,Full Name,Gender,Region,Total Score,GPA,Entrance Score,Disability\n';
    
    Object.entries(results.departments).forEach(([deptName, deptData]) => {
      deptData.students.forEach(student => {
        csvContent += `${deptName},${student.studentId},${student.fullName},${student.gender},${student.region},${student.totalScore},${student.gpa},${student.entranceScore},${student.disability}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'placement_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getDepartmentStudents = (deptName, deptData) => {
    let students = [...deptData.students];
    
    if (sortBy === 'score') {
      students.sort((a, b) => b.totalScore - a.totalScore);
    } else if (sortBy === 'name') {
      students.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortBy === 'studentId') {
      students.sort((a, b) => a.studentId.localeCompare(b.studentId));
    }
    
    return students;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!results || results.totalPlaced === 0) {
    return (
      <div className="text-center py-12">
        <Award className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No placement results</h3>
        <p className="mt-1 text-sm text-gray-500">
          Run the placement algorithm first to see results here.
        </p>
      </div>
    );
  }

  const departmentNames = Object.keys(results.departments);
  const filteredDepartments = selectedDepartment 
    ? { [selectedDepartment]: results.departments[selectedDepartment] }
    : results.departments;

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placement Results</h1>
          <p className="mt-1 text-sm text-gray-600">
            {results.totalPlaced} students have been placed across departments
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={exportResults}
            className="btn-primary inline-flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Department
            </label>
            <select
              className="input-field"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departmentNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              className="input-field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="score">Total Score</option>
              <option value="name">Name</option>
              <option value="studentId">Student ID</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {Object.keys(filteredDepartments).length} of {departmentNames.length} departments
            </div>
          </div>
        </div>
      </div>

      {/* Results by Department */}
      <div className="space-y-6">
        {Object.entries(filteredDepartments).map(([deptName, deptData]) => {
          const students = getDepartmentStudents(deptName, deptData);
          const femaleCount = students.filter(s => s.gender === 'Female').length;
          const femalePercentage = students.length > 0 ? Math.round((femaleCount / students.length) * 100) : 0;
          
          return (
            <div key={deptName} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{deptName}</h3>
                  <p className="text-sm text-gray-600">
                    {students.length}/{deptData.capacity} students placed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Gender Distribution
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      {students.length - femaleCount}M / {femaleCount}F
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      femalePercentage >= 20 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {femalePercentage}% Female
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GPA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entrance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disability
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.studentId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.gender === 'Female' 
                              ? 'bg-pink-100 text-pink-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {student.gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.totalScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.gpa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.entranceScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.disability !== 'None' && student.disabilityVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {student.disability}
                            </span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Results;