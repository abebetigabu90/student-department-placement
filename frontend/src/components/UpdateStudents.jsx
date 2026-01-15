// import React, { useState } from 'react';
// import axios from 'axios';

// const UpdateGradesModal = ({ student, onClose, onSuccess }) => {
//   const [formData, setFormData] = useState({
//     gpaOrcgpa: student.gpa || '',
//     entranceScore: student.entranceScore || ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const requestData = {
//         ...formData,
//         gpaOrcgpa: parseFloat(formData.gpa),
//         entranceScore: parseFloat(formData.entranceScore)
//       };

//       await axios.put(`http://localhost:5000/api/students/${student._id}/updateGrades`, requestData);
      
//       onSuccess();
//       onClose();
//     } catch (error) {
//       setError('Failed to update grades. Please try again.');
//       console.error('Error updating grades:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">
//               Update Grades
//             </h2>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//               disabled={loading}
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
          
//           <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
//             <p className="text-sm text-yellow-800">
//               Updating grades for: <span className="font-semibold">{student?.firstName}</span>
//             </p>
//             <p className="text-sm text-yellow-600 mt-1">
//               Student ID: {student?.studentId}
//             </p>
//             {student.totalScore && (
//               <p className="text-sm text-yellow-600 mt-1">
//                 Current Total Score: {student.totalScore}
//               </p>
//             )}
//           </div>

//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//               <p className="text-sm text-red-800">{error}</p>
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="update-gpa" className="block text-sm font-medium text-gray-700 mb-2">
//                   GPA/CGPA *
//                 </label>
//                 <input
//                   type="number"
//                   placeholder={student?.gpa !== undefined ? String(student.gpa) : ""}
//                   id="update-gpa"
//                   name="gpa"
//                   step="0.01"
//                   min="0"
//                   max="4.0"
//                   value={formData.gpa}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                   required
//                   disabled={loading}
//                 />
//               </div>
//               <div>
//                 <label htmlFor="update-entranceScore" className="block text-sm font-medium text-gray-700 mb-2">
//                   Grade 12 Exam Score *
//                 </label>
//                 <input
//                   type="number"
//                   placeholder={student?.entranceScore !== undefined ? String(student.entranceScore) : ""}
//                   id="update-entranceScore"
//                   name="entranceScore"
//                   min="0"
//                   max="600"
//                   value={formData.entranceScore}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                   required
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             <div className="flex gap-3 mt-8">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//               >
//                 {loading ? (
//                   <span className="flex items-center justify-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Updating...
//                   </span>
//                 ) : (
//                   'Update Grades'
//                 )}
//               </button>
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={loading}
//                 className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 focus:outline-hidden focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UpdateGradesModal;







import React, { useState } from 'react';
import axios from 'axios';

const UpdateStudent = ({ student, onClose, onSuccess }) => {

  const [formData, setFormData] = useState({
    studentId: student.studentId || '',
    firstName: student.firstName || '',
    middleName: student.middleName || '',
    gender: student.gender || '',
    stream: student.stream || '',

    gpa: student.gpa || '',
    entranceScore: student.entranceScore || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Build object with only fields that the user filled
    const requestData = {};

    if (formData.studentId !== '') requestData.studentId = formData.studentId;
    if (formData.firstName !== '') requestData.firstName = formData.firstName;
    if (formData.middleName !== '') requestData.middleName = formData.middleName;
    if (formData.gender !== '') requestData.gender = formData.gender;
    if (formData.stream !== '') requestData.stream = formData.stream;

    if (formData.gpa !== '') requestData.gpaOrcgpa = parseFloat(formData.gpa);
    if (formData.entranceScore !== '') requestData.entranceScore = parseFloat(formData.entranceScore);



      const storedUserData = localStorage.getItem('userData');
      if (!storedUserData) {
        console.log('User data not found');
      }
      const userData = JSON.parse(storedUserData);
      const userId = userData._id;
  

    await axios.patch(
      `http://localhost:5000/api/students/${student._id}`,
      {
        userId: userId,
        Role:'registrar',
        requestData:requestData
    }
    );

    onSuccess();
    onClose();
  } catch (error) {
    console.error('Error updating student:', error);
    setError('Failed to update student information. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">

        <h2 className="text-2xl font-bold mb-4">Update Student Information</h2>

        {error && (
          <div className="p-3 mb-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Student ID */}
          <div>
            <label className="block font-medium text-sm mb-1">Student ID</label>
            <input
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block font-medium text-sm mb-1">First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Middle Name */}
          <div>
            <label className="block font-medium text-sm mb-1">Middle Name</label>
            <input
              name="middleName"
              value={formData.middleName}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block font-medium text-sm mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Stream */}
          {/* <div>
            <label className="block font-medium text-sm mb-1">Stream</label>
            <input
              name="stream"
              value={formData.stream}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div> */}
          {/* Gender */}
          <div>
            <label className="block font-medium text-sm mb-1">Stream</label>
            <select
              name="stream"
              value={formData.stream}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Stream</option>
              <option value="Natural Science">Natural</option>
              <option value="Social Science">Social</option>
            </select>
          </div>

          {/* GPA */}
          <div>
            <label className="block font-medium text-sm mb-1">GPA / CGPA</label>
            <input
              type="number"
              step="0.01"
              name="gpa"
              value={formData.gpa}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Entrance Score */}
          <div>
            <label className="block font-medium text-sm mb-1">Grade 12 Exam</label>
            <input
              type="number"
              name="entranceScore"
              value={formData.entranceScore}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-3 rounded text-white font-semibold"
          >
            {loading ? "Updating..." : "Update Student"}
          </button>

        </form>

        <button
          onClick={onClose}
          className="w-full mt-3 bg-gray-500 py-2 rounded text-white"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};

export default UpdateStudent;
