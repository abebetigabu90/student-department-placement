// import { useState, useEffect } from 'react';

// const MyPlacementPage = () => {
//   const [placement, setPlacement] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchPlacementStatus = async () => {
//       try {
//         // Get student ID from localStorage
//         const storedUserData = localStorage.getItem('userData');
//         if (!storedUserData) {
//           setError('User data not found. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         const userData = JSON.parse(storedUserData);
//         const studentId = userData.studentId;

//         if (!studentId) {
//           setError('Student ID not found in user data.');
//           setLoading(false);
//           return;
//         }

//         // Fetch placement data from API
//         const response = await fetch(`http://localhost:5000/api/my/placement/${studentId}`);
        
//         if (!response.ok) {
//           if (response.status === 404) {
//             // No placement found - this is normal
//             setPlacement(null);
//           } else {
//             throw new Error('Failed to fetch placement data');
//           }
//         } else {
//           const placementData = await response.data();
//           setPlacement(placementData);
//         }
//       } catch (err) {
//         setError(err.message || 'An error occurred while fetching placement data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPlacementStatus();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Checking your placement status...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
//           <div className="text-red-500 text-center">
//             <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <h2 className="text-xl font-semibold mb-2">Error</h2>
//             <p className="text-gray-600">{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl mx-auto">
//         <div className="text-center mb-12">
//           <h1 className="text-3xl font-bold text-gray-900 mb-4">
//             Placement Status
//           </h1>
//           <p className="text-lg text-gray-600">
//             Check your current placement allocation
//           </p>
//         </div>

//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           {placement ? (
//             // Placement Found
//             <div className="p-8">
//               <div className="flex items-center justify-center mb-6">
//                 <div className="bg-green-100 p-3 rounded-full">
//                   <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
              
//               <div className="text-center mb-6">
//                 <h2 className="text-2xl font-bold text-green-600 mb-2">
//                   Congratulations! 🎉
//                 </h2>
//                 <p className="text-gray-600 text-lg">
//                   You have been successfully placed in a department
//                 </p>
//               </div>

//               <div className="bg-gray-50 rounded-lg p-6 mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
//                   Placement Details
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="text-center">
//                     <p className="text-sm text-gray-500 mb-1">Department</p>
//                     <p className="text-lg font-semibold text-gray-900">
//                       {placement.department?.name || 'Department Name'}
//                     </p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-sm text-gray-500 mb-1">Priority</p>
//                     <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
//                       Priority {placement.priority}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="text-center text-gray-500 text-sm">
//                 <p>Allocated on: {new Date(placement.createdAt).toLocaleDateString()}</p>
//               </div>
//             </div>
//           ) : (
//             // No Placement Found
//             <div className="p-8 text-center">
//               <div className="flex items-center justify-center mb-6">
//                 <div className="bg-yellow-100 p-3 rounded-full">
//                   <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
              
//               <h2 className="text-2xl font-bold text-gray-900 mb-4">
//                 Placement Pending
//               </h2>
              
//               <p className="text-gray-600 text-lg mb-6">
//                 You haven't been placed in any department yet. Please wait for the allocation process to complete.
//               </p>
              
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//                 <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                   What's Next?
//                 </h3>
//                 <ul className="text-blue-800 text-left space-y-2">
//                   <li className="flex items-center">
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                     Wait for the placement allocation process
//                   </li>
//                   <li className="flex items-center">
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                     Check back here for updates
//                   </li>
//                   <li className="flex items-center">
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                     Contact administration for queries
//                   </li>
//                 </ul>
//               </div>
              
//               <button 
//                 onClick={() => window.location.reload()}
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
//               >
//                 Refresh Status
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Additional Information */}
//         <div className="mt-8 text-center text-gray-500 text-sm">
//           <p>If you believe there's an issue with your placement, please contact the placement office.</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyPlacementPage;

import { useState, useEffect } from 'react';
import axios from 'axios';

const MyPlacementPage = () => {
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlacementStatus = async () => {
      try {
        // Get student ID from localStorage
        const storedUserData = localStorage.getItem('userData');
        if (!storedUserData) {
          setError('User data not found. Please log in again.');
          setLoading(false);
          return;
        }

        const userData = JSON.parse(storedUserData);
        const studentId = userData.studentId;
        if (!studentId) {
          setError('Student ID not found in user data.');
          setLoading(false);
          return;
        }

        // Fetch placement data using Axios
        const response = await axios.get(`http://localhost:5000/api/my/placement/${studentId}`);
        
        if (response.data) {
          setPlacement(response.data.placement);
        }
      } catch (err) {
        // Handle 404 (no placement) differently from other errors
        if (err.response && err.response.status === 404) {
          setPlacement(null); // No placement found
        } else {
          setError(err.response?.data?.message || err.message || 'An error occurred while fetching placement data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your placement status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Placement Status
          </h1>
          <p className="text-lg text-gray-600">
            Check your current placement allocation
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {placement ? (
            // Placement Found
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Congratulations! 🎉
                </h2>
                <p className="text-gray-600 text-lg">
                  You have been successfully placed in a department
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Placement Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Department</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {placement.department?.name || 'Department Name'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Priority</p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Priority {placement.priority}
                    </div>
                  </div>
                </div>
                {placement.department?.description && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{placement.department.description}</p>
                  </div>
                )}
              </div>

              <div className="text-center text-gray-500 text-sm">
                <p>Allocated on: {new Date(placement.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            // No Placement Found
            <div className="p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Placement Pending
              </h2>
              
              <p className="text-gray-600 text-lg mb-6">
                You haven't been placed in any department yet. Please wait for the allocation process to complete.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  What's Next?
                </h3>
                <ul className="text-blue-800 text-left space-y-2">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Wait for the placement allocation process
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Check back here for updates
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Contact administration for queries
                  </li>
                </ul>
              </div>
              
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              >
                Refresh Status
              </button>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>If you believe there's an issue with your placement, please contact the placement office.</p>
        </div>
      </div>
    </div>
  );
};

export default MyPlacementPage;