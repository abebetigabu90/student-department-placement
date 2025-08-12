import { useState } from 'react';
import { Upload as UploadIcon, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
      setResult(null);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/admin/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Students</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload student data via CSV file
        </p>
      </div>

      {/* Upload Section */}
      <div className="card mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload CSV File</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>

          {file && (
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">{file.name}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary inline-flex items-center"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <UploadIcon className="h-4 w-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card mb-6 border-red-200 bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="card mb-6 border-green-200 bg-green-50">
          <div className="flex items-center mb-3">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Upload Successful!</span>
          </div>
          <p className="text-green-700">{result.message}</p>
        </div>
      )}

      {/* CSV Format Guide */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">CSV Format Requirements</h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Your CSV file should include the following columns:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm">
              studentId,fullName,gender,region,entranceScore,entranceMax,gpa
            </code>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>studentId:</strong> Unique identifier (e.g., dtu14R0059)</p>
            <p><strong>fullName:</strong> Student's full name</p>
            <p><strong>gender:</strong> Male or Female</p>
            <p><strong>region:</strong> Student's region</p>
            <p><strong>entranceScore:</strong> Entrance exam score</p>
            <p><strong>entranceMax:</strong> Maximum possible score (600 or 700)</p>
            <p><strong>gpa:</strong> Current GPA (0.0 to 4.0)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;