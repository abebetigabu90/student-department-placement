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
    setResult(null);

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
      document.getElementById('file-upload').value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Students CSV</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload a CSV file containing student data
        </p>
      </div>

      {/* Upload Form */}
      <div className="card mb-6">
        <div className="text-center">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Select CSV file to upload
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFileChange}
              />
              <span className="btn-primary mt-4 inline-flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </span>
            </label>
          </div>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-sm text-blue-900">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </span>
            </div>
          </div>
        )}

        {file && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary inline-flex items-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload CSV
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="card mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="card mb-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-sm text-green-700 font-medium">
              Upload Successful!
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {result.message}
          </p>
        </div>
      )}

      {/* CSV Format Guide */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">CSV Format Requirements</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Required Columns:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code className="bg-gray-100 px-1 rounded">studentId</code> - Unique student identifier</li>
              <li>• <code className="bg-gray-100 px-1 rounded">fullName</code> - Student's full name</li>
              <li>• <code className="bg-gray-100 px-1 rounded">gender</code> - Male or Female</li>
              <li>• <code className="bg-gray-100 px-1 rounded">region</code> - Student's region</li>
              <li>• <code className="bg-gray-100 px-1 rounded">entranceScore</code> - Entrance exam score</li>
              <li>• <code className="bg-gray-100 px-1 rounded">entranceMax</code> - Maximum entrance score (600 or 700)</li>
              <li>• <code className="bg-gray-100 px-1 rounded">gpa</code> - Grade Point Average (0-4)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Optional Columns:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code className="bg-gray-100 px-1 rounded">disability</code> - Disability status (default: "None")</li>
              <li>• <code className="bg-gray-100 px-1 rounded">disabilityVerified</code> - Boolean (true/false)</li>
            </ul>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Make sure your CSV file has headers in the first row and follows the exact column names listed above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;