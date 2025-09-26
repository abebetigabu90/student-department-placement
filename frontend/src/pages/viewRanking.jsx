import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RankingPage = () => {
  const { departmentName } = useParams();
  const navigate = useNavigate();
  const [rankingData, setRankingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRanking() {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/ranking/${encodeURIComponent(departmentName)}`
        );
        setRankingData(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load ranking data");
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, [departmentName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ranking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Back to Preferences
          </button>
          
          <h1 className="text-2xl font-bold text-blue-800">
            {rankingData.department} - First Preference Students
          </h1>
          
          <div className="flex justify-center gap-6 mt-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="text-sm text-blue-700">Department Capacity</p>
              <p className="text-xl font-bold">{rankingData.capacity}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <p className="text-sm text-green-700">First Choice Applicants</p>
              <p className="text-xl font-bold">{rankingData.totalApplicants}</p>
            </div>
          </div>
        </div>

        {rankingData.totalApplicants === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No First Preference Applications
            </h3>
            <p className="text-gray-600">
              No students have selected {rankingData.department} as their first preference.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm text-gray-600">
                📋 Showing {rankingData.totalApplicants} student(s) who selected this department as their first preference
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Student ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">GPA</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Entrance Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Total Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Preference</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.ranking.map((student) => (
                    <tr key={student.studentId} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{student.rank}</td>
                      <td className="px-4 py-3 text-sm font-medium">{student.studentId}</td>
                      <td className="px-4 py-3 text-sm">{student.studentName}</td>
                      <td className="px-4 py-3 text-sm">{student.gpa}</td>
                      <td className="px-4 py-3 text-sm">{student.entranceScore}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{student.totalScore}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          1st Choice
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingPage;