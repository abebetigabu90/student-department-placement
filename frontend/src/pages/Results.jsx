import { useState, useEffect } from 'react';
import { BarChart3, Download, Users, Building2 } from 'lucide-react';
import api from '../utils/api';

const Results = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');

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

    let csvContent = 'Department,Student ID,Full Name,Gender,Region,Total Score,GPA,Entrance Score,Placement Stage\n';
    
    Object.entries(results.departments).forEach(([deptName, deptData]) => {
      deptData.students.forEach(student => {
        csvContent += `${deptName},${student.studentId},${student.fullName},${student.gender},${student.region},${student.totalScore},${student.gpa},${student.entranceScore},${student.placementStage}\n`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!results || results.totalPlaced === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Placement Results</h1>
          <p className="mt-1 text-sm text-gray-600">
            View detailed placement results and statistics
          </p>
        </div>
        <div className="card text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
          <p className="text-gray-600">Run the placement algorithm to see results here.</p>
        </div>
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
            View detailed placement results and statistics
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Placed</p>
              <p className="text-lg font-semibold text-gray-900">{results.totalPlaced}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Departments</p>
              <p className="text-lg font-semibold text-gray-900">{departmentNames.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Avg. per Dept.</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.round(results.totalPlaced / departmentNames.length)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Filter */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Department:</label>
          <select
            className="input-field w-64"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departmentNames.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Department Results */}
      <div className="space-y-6">
        {Object.entries(filteredDepartments).map(([deptName, deptData]) => (
          <div key={deptName} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{deptName}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Capacity: {deptData.capacity}</span>
                <span>Filled: {deptData.students.length}</span>
                <span>
                  Utilization: {Math.round((deptData.students.length / deptData.capacity) * 100)}%
                </span>
              </div>
            </div>

            {deptData.students.length > 0 ? (
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
                        Stage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deptData.students
                      .sort((a, b) => b.totalScore - a.totalScore)
                      .map((student, index) => (
                        <tr key={student.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                            {student.gender}
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.placementStage === 'placed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {student.placementStage === 'placed' ? 'Final' : 'Semester 1'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No students placed in this department
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;