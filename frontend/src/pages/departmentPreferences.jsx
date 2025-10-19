import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DepartmentPreferencePage = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const storedUserData = localStorage.getItem("userData");
        if (!storedUserData) {
          alert('Please log in first');
          return;
        }

        const userData = JSON.parse(storedUserData);
        const studentId = userData.studentId;

        // Get student info
        const studentRes = await axios.get(`http://localhost:5000/api/student/${studentId}`);
        const studentData = studentRes.data;
        setStudentInfo(studentData);

        // Get departments for student's stream
        const deptRes = await axios.get(`http://localhost:5000/api/departments/FirstSem/${studentId}`);
        const availableDepts = deptRes.data;
        
        if (availableDepts.length > 0) {
          setDepartments(availableDepts);
          // Create empty preferences array matching department count
          setPreferences(Array(availableDepts.length).fill(""));
        }else if(deptRes.data.message){
          setMessage(deptRes.data.message)
        }
         else {
          setErrorMsg(`No departments found for ${studentData.stream} stream`);
        }

      } catch (error) {
          if (error.response && error.response.status === 404) {
          setDepartments([]); // no departments
          setErrorMsg(error.response.data.message || 'No departments available.');
        } else {
          setErrorMsg('Server error. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handlePreferenceChange = (index, departmentName) => {
    const newPreferences = [...preferences];
    newPreferences[index] = departmentName;
    setPreferences(newPreferences);
  };

  const viewRanking = (departmentName) => {
    if (!departmentName) {
      alert("Please select a department first.");
      return;
    }
    navigate(`/ranking/${departmentName}`);
  };

  const submitPreferences = async () => {
    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData) {
      alert("Please log in again.");
      return;
    }

    const userData = JSON.parse(storedUserData);
    const studentId = userData.studentId;

    // Check if all preferences are selected
    if (preferences.includes("")) {
      alert(`Please select all ${departments.length} preferences`);
      return;
    }

    // Check for duplicates
    if (new Set(preferences).size !== preferences.length) {
      alert("Please select different departments for each preference");
      return;
    }

    setSubmitting(true);
    try {
      const preferencesToSubmit = preferences.map((departmentName, index) => ({
        priority: index + 1,
        department: departmentName
      }));

      await axios.post(
        `http://localhost:5000/api/student/preferences/${studentId}`,
        { choices: preferencesToSubmit }
      );
      
      alert("Preferences submitted successfully!");
    } catch (error) {
      alert("Failed to submit preferences");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Department Preferences</h1>
          {studentInfo && (
            <p className="text-blue-600">Stream: {studentInfo.stream}</p>
          )}
        </div>

        {studentInfo && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between text-center">
              <div>
                <p className="text-sm">GPA</p>
                <p className="font-bold">{studentInfo.gpa}</p>
              </div>
              <div>
                <p className="text-sm">Entrance Score</p>
                <p className="font-bold">{studentInfo.entranceScore}</p>
              </div>
              <div>
                <p className="text-sm">Total Score</p>
                <p className="font-bold">{studentInfo.totalScore}</p>
              </div>
            </div>
          </div>
        )}

            {errorMsg ? (
              <div className="text-center">
                <p className="text-red-600">{errorMsg}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Try Again
                </button>
              </div>
            ) : message ? (
              <div className="text-center">
                <h1 className="text-red-600">{message}</h1>
              </div>
            ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Rank all {departments.length} departments:
            </h3>

            {preferences.map((departmentName, index) => (
              <div key={index} className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded">
                <span className="font-bold w-20">#{index + 1}:</span>
                <select
                  value={departmentName}
                  onChange={(e) => handlePreferenceChange(index, e.target.value)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => viewRanking(departmentName)}
                  disabled={!departmentName}
                  className="px-3 py-2 bg-purple-500 text-white rounded disabled:bg-gray-400"
                >
                  View Rank
                </button>
              </div>
            ))}

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gray-500 text-white rounded"
              >
                Back
              </button>
              <button
                onClick={submitPreferences}
                disabled={submitting}
                className="px-6 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-4">
              You must rank all {departments.length} available departments
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentPreferencePage;