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

  // Simple print to PDF function
  const printToPDF = () => {
    window.print();
  };

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
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0.5in;
          }
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .print-table {
            border-collapse: collapse;
            width: 100%;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
          }
          .print-table th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          .print-header {
            text-align: center;
            margin-bottom: 1.5rem;
            border-bottom: 2px solid #374151;
            padding-bottom: 1rem;
          }
          .print-stats {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          .badge {
            background-color: #f3f4f6 !important;
            color: #374151 !important;
            border: 1px solid #d1d5db !important;
          }
        }
      `}</style>

      {/* Main Content Area for Printing */}
      <div className="print-area">
        {/* Header */}
        <div className="print-header">
          <h1 className="text-2xl font-bold">Student Placements</h1>
          <p className="text-gray-600">View All Placed Students and Their Assigned Departments</p>
        </div>

        {/* Stats - Hidden in print by default, shown with print-stats class */}
        <div className="print-stats no-print">
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

        {/* Search Bar - Hidden in print */}
        <div className="mb-4 no-print">
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
          <table className="min-w-full print-table">
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
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full no-print ${
                      student.gender === 'Female' 
                        ? 'bg-pink-100 text-pink-800' 
                        : 'bg-blue-100 text-blue-800'
                    } badge print:bg-gray-100 print:text-gray-800 print:border`}>
                      {student.gender}
                    </span>
                    {/* Simple text for print */}
                    <span className="print-only hidden print:inline">{student.gender}</span>
                  </td>
                  <td className="px-4 py-2">{student.gpa}</td>
                  <td className="px-4 py-2">{student.entranceScore}</td>
                  <td className="px-4 py-2 font-medium">{student.totalScore}</td>
                  <td className="px-4 py-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm no-print badge print:bg-gray-100 print:text-gray-800 print:border">
                      {student.Department?.name}
                    </span>
                    {/* Simple text for print */}
                    <span className="print-only hidden print:inline">{student.Department?.name}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results Message */}
        {filteredStudents.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500 no-print">
            No placed students found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Action Buttons - Hidden in print */}
      <div className="mt-4 flex gap-2 no-print">
        <button
          onClick={fetchPlacedStudents}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Refresh Data
        </button>
        <button
          onClick={printToPDF}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Print/Export PDF
        </button>
      </div>
    </div>
  );
};

export default ViewPlacements;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ViewPlacements = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   // Fetch placed students
//   const fetchPlacedStudents = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('http://localhost:5000/api/admin/viewPlacements');
//       setStudents(response.data);
//     } catch (error) {
//       console.error('Error fetching placed students:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPlacedStudents();
//   }, []);

  // // Simple print to PDF function
  // const printToPDF = () => {
  //   window.print();
  // };

//   // Filter students based on search
//   const filteredStudents = students.filter(student => {
//     if (!searchTerm) return true;
    
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       student.firstName?.toLowerCase().includes(searchLower) ||
//       student.middleName?.toLowerCase().includes(searchLower) ||
//       student.studentId?.toLowerCase().includes(searchLower) ||
//       student.Department?.name?.toLowerCase().includes(searchLower) ||
//       student.gender?.toLowerCase().includes(searchLower)
//     );
//   });

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="text-center py-8">Loading placements...</div>
//       </div>
//     );
//   }

//   return (
    // <div className="p-6">
    //   {/* Print-specific styles */}
    //   <style>
    //     {`
    //       @media print {
    //         body * {
    //           visibility: hidden;
    //         }
    //         .print-content, .print-content * {
    //           visibility: visible;
    //         }
    //         .print-content {
    //           position: absolute;
    //           left: 0;
    //           top: 0;
    //           width: 100%;
    //           padding: 20px;
    //         }
    //         .no-print {
    //           display: none !important;
    //         }
    //         .print-stats {
    //           display: grid;
    //           grid-template-columns: 1fr 1fr 1fr;
    //           gap: 1rem;
    //           margin-bottom: 1.5rem;
    //         }
    //         .print-table {
    //           width: 100%;
    //           border-collapse: collapse;
    //         }
    //         .print-table th,
    //         .print-table td {
    //           border: 1px solid #ddd;
    //           padding: 8px;
    //           text-align: left;
    //         }
    //         .print-table th {
    //           background-color: #f5f5f5;
    //           font-weight: bold;
    //         }
    //         .print-header {
    //           text-align: center;
    //           margin-bottom: 1.5rem;
    //           border-bottom: 2px solid #333;
    //           padding-bottom: 1rem;
    //         }
    //       }
    //     `}
    //   </style>

//       {/* Header */}
//       <div className="print-content">
//         <div className="print-header">
//           <h1 className="text-2xl font-bold">Student Placements</h1>
//           <p>View All Placed Students and Their Assigned Departments</p>
//           <p className="text-sm text-gray-600 mt-2">
//             Generated on: {new Date().toLocaleDateString()} | Total Records: {filteredStudents.length}
//           </p>
//         </div>

//         {/* Stats */}
//         <div className="print-stats no-print">
//           <div className="bg-white p-4 rounded border text-center">
//             <div className="text-xl font-bold">{students.length}</div>
//             <div className="text-gray-600">Total Placed</div>
//           </div>
//           <div className="bg-white p-4 rounded border text-center">
//             <div className="text-xl font-bold">
//               {students.filter(s => s.gender === 'Female').length}
//             </div>
//             <div className="text-gray-600">Female Students</div>
//           </div>
//           <div className="bg-white p-4 rounded border text-center">
//             <div className="text-xl font-bold">
//               {[...new Set(students.map(s => s.Department?.name))].length}
//             </div>
//             <div className="text-gray-600">Assigned Departments</div>
//           </div>
//         </div>

//         {/* Search Bar - Hidden in print */}
//         <div className="mb-4 no-print">
//           <input
//             type="text"
//             placeholder="Search by name, ID, department, or gender..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <div className="text-sm text-gray-500 mt-1">
//             Showing {filteredStudents.length} of {students.length} placed students
//           </div>
//         </div>

//         {/* Table */}
//         <div className="border rounded">
//           <table className="min-w-full print-table">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-2 text-left">Student ID</th>
//                 <th className="px-4 py-2 text-left">Name</th>
//                 <th className="px-4 py-2 text-left">Gender</th>
//                 <th className="px-4 py-2 text-left">GPA</th>
//                 <th className="px-4 py-2 text-left">Grade 12</th>
//                 <th className="px-4 py-2 text-left">Total Score</th>
//                 <th className="px-4 py-2 text-left">Department</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredStudents.map((student) => (
//                 <tr key={student._id} className="border-t hover:bg-gray-50">
//                   <td className="px-4 py-2 font-mono">{student.studentId}</td>
//                   <td className="px-4 py-2">
//                     {student.firstName} {student.middleName}
//                   </td>
//                   <td className="px-4 py-2">{student.gender}</td>
//                   <td className="px-4 py-2">{student.gpa}</td>
//                   <td className="px-4 py-2">{student.entranceScore}</td>
//                   <td className="px-4 py-2 font-medium">{student.totalScore}</td>
//                   <td className="px-4 py-2">{student.Department?.name}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* No Results Message */}
//         {filteredStudents.length === 0 && searchTerm && (
//           <div className="text-center py-8 text-gray-500">
//             No placed students found matching "{searchTerm}"
//           </div>
//         )}
//       </div>

//       {/* Action Buttons - Hidden in print */}
//       <div className="mt-4 flex gap-2 no-print">
//         <button
//           onClick={fetchPlacedStudents}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         >
//           Refresh Data
//         </button>
        // <button
        //   onClick={printToPDF}
        //   className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        // >
        //   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        //     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        //   </svg>
        //   Print/Export PDF
        // </button>
//       </div>
//     </div>
//   );
// };

// export default ViewPlacements;