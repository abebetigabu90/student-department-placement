import React from 'react';

const DepartmentList = ({ departments, onEdit, onDelete, loading, editingDepartmentId }) => {
  if (loading) return <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-600">Loading departments...</div>;
  if (!departments.length) return <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-600">No departments found</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Departments ({departments.length})</h2>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {departments.map(dept => (
          <div 
            key={dept._id} 
            className={`border rounded-lg p-4 transition-colors ${
              editingDepartmentId === dept._id 
                ? 'bg-blue-50 border-blue-300 shadow-sm' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {/* Header with badges */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                  {dept.isFinalPref && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Final Preference</span>
                  )}
                  {dept.PrefTypeCategory === 'Unique' && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Unique</span>
                  )}
                </div>
                
                {/* Department details in rows */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-32">Department ID:</span>
                    <span className="text-gray-900">{dept.deptID}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-32">Capacity:</span>
                    <span className="text-gray-900">{dept.capacity}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-32">Stream:</span>
                    <span className="text-gray-900">{dept.stream}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-32">Time Category:</span>
                    <span className="text-gray-900">{dept.PrefTimeCategory}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-32">Type Category:</span>
                    <span className="text-gray-900">{dept.PrefTypeCategory}</span>
                  </div>
                  {dept.totalAssignedStudents > 0 && (
                    <div className="flex items-center">
                      <span className="font-medium text-blue-700 w-32">Assigned Students:</span>
                      <span className="text-blue-900 font-medium">{dept.totalAssignedStudents}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-3 ml-4">
                <button 
                  onClick={() => onEdit(dept)} 
                  disabled={editingDepartmentId}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(dept._id)} 
                  disabled={editingDepartmentId}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentList;