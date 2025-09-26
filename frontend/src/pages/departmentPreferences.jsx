import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DepartmentPreferencePage = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [choices, setChoices] = useState({ choice1: "", choice2: "", choice3: "", choice4: "",choice5:"",choice6:"" });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch student info
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          const studentId = parsedUserData.studentId;
          alert(studentId);
          const studentRes = await axios.get(`http://localhost:5000/api/student/${studentId}`);
          setStudentInfo(studentRes.data);
        } else {
          alert('Student id cannot be found in localStorage');
        }
        
        // Fetch departments
        const deptRes = await axios.get("http://localhost:5000/api/departments");
        if (deptRes.data?.length > 0) {
          setDepartments(deptRes.data);
        } else {
          setErrorMsg("No departments available for your stream.");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChoiceChange = (e) => {
    setChoices({ ...choices, [e.target.name]: e.target.value });
  };

  const viewRanking = (departmentName) => {
    if (!departmentName) {
      alert("Please select a department first.");
      return;
    }
    navigate(`/ranking/${departmentName}`);
  };

  const submitPreferences = async () => {
    // Get studentId from localStorage
    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData) {
      alert("Student data not found. Please log in again.");
      return;
    }

    const parsedUserData = JSON.parse(storedUserData);
    const studentId = parsedUserData.studentId;

    // Filter out empty choices and create preference objects
    const selectedChoices = Object.entries(choices)
      .map(([key, value], index) => ({
        priority: index + 1,
        department: value,
      }))
      .filter(item => item.department !== "");

    // Validate all 4 choices are selected
    if (selectedChoices.length !== 6) {
      alert("Please select all 6 department choices.");
      return;
    }

    // Check for duplicates
    const departmentNames = selectedChoices.map(choice => choice.department);
    if (new Set(departmentNames).size !== departmentNames.length) {
      alert("Each choice must be a different department.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `http://localhost:5000/api/student/preferences/${studentId}`,
        { choices: selectedChoices }
      );
      alert("Preferences submitted successfully!");
      // Optional: Reset choices or navigate to another page
      // setChoices({ choice1: "", choice2: "", choice3: "", choice4: "" });
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to submit preferences. Please try again.";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading department preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
        <div className="text-center border-b-2 border-blue-500 pb-4 mb-4">
          <h1 className="text-2xl font-bold">Department Preference Selection</h1>
        </div>

        {studentInfo && (
          <div className="flex justify-around bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-md mb-6 text-center">
            <div>
              <h4 className="text-purple-700 font-semibold">Your GPA</h4>
              <p className="font-bold text-xl">{studentInfo.gpa}</p>
            </div>
            <div>
              <h4 className="text-purple-700 font-semibold">Grade 12 Exam</h4>
              <p className="font-bold text-xl">{studentInfo.entranceScore}</p>
            </div>
            <div>
              <h4 className="text-purple-700 font-semibold">Total Score</h4>
              <p className="font-bold text-xl">{studentInfo.totalScore}</p>
            </div>
          </div>
        )}

        {errorMsg ? (
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-4">{errorMsg}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Select your department preferences (in order of priority):
            </h3>
            
            {["choice1", "choice2", "choice3", "choice4","choice5","choice6"].map((key, index) => (
              <div
                key={key}
                className="flex items-center mb-4 p-3 bg-gray-100 rounded-md border border-gray-300"
              >
                <span className="font-bold min-w-[90px]">{index + 1}. Choice:</span>
                <select
                  name={key}
                  value={choices[key]}
                  onChange={handleChoiceChange}
                  className="flex-1 mx-3 p-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name} (Capacity: {dept.capacity})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => viewRanking(choices[key])}
                  disabled={!choices[key]}
                  className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  View Ranking
                </button>
              </div>
            ))}

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-all"
              >
                Back
              </button>
              <button
                onClick={submitPreferences}
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? "Submitting..." : "Submit Preferences"}
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Note: Please select 6 different departments in order of your preference.</p>
              <p>Choice 1 is your highest priority, Choice 6 is your lowest.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentPreferencePage;