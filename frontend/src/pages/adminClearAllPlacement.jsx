import React, { useState } from 'react';
import axios from 'axios';

const ClearPlacements = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleClear = async () => {
        if (!window.confirm('Are you sure you want to clear ALL placements? This will reset all student assignments and cannot be undone.')) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await axios.delete('http://localhost:5000/api/admin/placement/ClearPlacements');
            setMessage('✅ ' + (response.data.message || 'All placements cleared successfully!'));
        } catch (error) {
            setMessage('❌ ' + (error.response?.data?.error || 'Failed to clear placements'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            maxWidth: '500px', 
            margin: '50px auto', 
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        }}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>Clear Placements</h2>
            
            <div style={{ 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                padding: '15px',
                marginBottom: '20px'
            }}>
                <strong>⚠️ This will:</strong>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li>Reset all student assignments</li>
                    <li>Clear placement data</li>
                    <li>Reset department counters</li>
                </ul>
            </div>

            <button 
                onClick={handleClear}
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: loading ? '#6c757d' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Clearing...' : 'Clear All Placements'}
            </button>

            {message && (
                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    borderRadius: '6px',
                    textAlign: 'center',
                    backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                    color: message.includes('✅') ? '#155724' : '#721c24'
                }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default ClearPlacements;