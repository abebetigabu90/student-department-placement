// import { useEffect, useState } from "react";
// import axios from "axios";

// const AuditLogs = () => {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchAuditLogs();
//   }, []);

//   const fetchAuditLogs = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/admin/audit-logs");
//       setLogs(res.data);
//     } catch (err) {
//       console.error("Failed to load audit logs", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatAction = (action) => {
//     return action.replaceAll("_", " ");
//   };

//   if (loading) return <p>Loading audit logs...</p>;

//   return (
//     <div className="container">
//       <h2>Audit Logs</h2>

//       <table className="table">
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>Actor</th>
//             <th>Role</th>
//             <th>Action</th>
//             <th>Target</th>
//             <th>Details</th>
//             <th>Date</th>
//           </tr>
//         </thead>

//         <tbody>
//           {logs.length === 0 && (
//             <tr>
//               <td colSpan="7" style={{ textAlign: "center" }}>
//                 No audit records found
//               </td>
//             </tr>
//           )}

//           {logs.map((log, index) => (
//             <tr key={log._id}>
//               <td>{index + 1}</td>

//               <td>
//               {log.actorId ? log.actorId.name : "System"}
//               </td>

//               <td>{log.actorRole}</td>

//               <td>{formatAction(log.action)}</td>

//               <td>{log.targetModel}</td>

//               <td>
//                 {log.action === "UPDATE_STUDENT" &&
//                   log.changes?.updatedFields?.length > 0 && (
//                     <small>
//                       Updated: {log.changes.updatedFields.join(", ")}
//                     </small>
//                   )}

//                 {log.action !== "UPDATE_STUDENT" && (
//                   <small>—</small>
//                 )}
//               </td>

//               <td>
//                 {new Date(log.createdAt).toLocaleString()}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AuditLogs;



import { useEffect, useState } from "react";
import axios from "axios";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // Filter by action type
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/audit-logs");
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action) => {
    return action.replaceAll("_", " ");
  };

  // Filter logs based on selected filter and search term
  const filteredLogs = logs.filter((log) => {
    // Filter by action type
    if (filter !== "all" && log.action !== filter) return false;
    
    // Search across multiple fields
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (log.actorId?.name?.toLowerCase() || "system").includes(term) ||
        log.actorRole.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.targetModel.toLowerCase().includes(term) ||
        log.changes?.changedFields?.some(field => 
          field.toLowerCase().includes(term)
        )
      );
    }
    return true;
  });

  // Group actions for filter dropdown
  const actionTypes = ["all", ...new Set(logs.map(log => log.action))];

  // Get badge color based on action type
  const getActionColor = (action) => {
    if (action.includes("CREATE")) return "bg-green-100 text-green-800";
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800";
    if (action.includes("DELETE")) return "bg-red-100 text-red-800";
    if (action.includes("LOGIN") || action.includes("LOGOUT")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
          <p className="text-gray-600">Track all system activities and changes</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action === "all" ? "All Actions" : formatAction(action)}
              </option>
            ))}
          </select>

          {/* Refresh button */}
          <button
            onClick={fetchAuditLogs}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-500">Total Logs</div>
          <div className="text-2xl font-bold text-gray-800">{logs.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-500">Updates</div>
          <div className="text-2xl font-bold text-blue-600">
            {logs.filter(l => l.action.includes("UPDATE")).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-500">Creates</div>
          <div className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.action.includes("CREATE")).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-500">Today</div>
          <div className="text-2xl font-bold text-purple-600">
            {logs.filter(l => {
              const today = new Date().toDateString();
              const logDate = new Date(l.createdAt).toDateString();
              return logDate === today;
            }).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No audit logs found</p>
                      <p className="text-sm">Try adjusting your filters or search term</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr 
                    key={log._id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">
                            {log.actorId?.name?.charAt(0) || "S"}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.actorId?.name || "System"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.actorId?.email || "System Action"}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        log.actorRole === "ADMIN" ? "bg-purple-100 text-purple-800" :
                        log.actorRole === "TEACHER" ? "bg-blue-100 text-blue-800" :
                        log.actorRole === "STUDENT" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {log.actorRole}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.targetModel}</div>
                      {log.targetId && (
                        <div className="text-xs text-gray-500">ID: {log.targetId.studentId}</div>
                      )}
                    </td>
                    
                    {/* <td className="px-6 py-4">
                      {log.action === "UPDATE_STUDENT" &&
                        log.changes?.changedFields?.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            Updated {log.changes.changedFields.length} fields
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {log.changes.changedFields.map((field, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : log.action.includes("CREATE") ? (
                        <span className="text-sm text-green-600 font-medium">Created new record</span>
                      ) : log.action.includes("DELETE") ? (
                        <span className="text-sm text-red-600 font-medium">Deleted record</span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td> */}
                    <td className="px-6 py-4">
                    {log.action === "UPDATE_STUDENT" &&
                    log.changes?.changedFields?.length > 0 ? (

                      <div className="space-y-2">
                        {/* Summary */}
                        <div className="text-sm font-medium text-gray-900">
                          Updated {log.changes.changedFields.length} field(s)
                        </div>

                        {/* Field-by-field changes */}
                        <div className="space-y-1">
                          {log.changes.changedFields.map((field, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-blue-50 border border-blue-100 rounded px-2 py-1"
                            >
                              <span className="font-semibold text-blue-700">
                                {field}
                              </span>
                              <span className="mx-1 text-gray-500">:</span>
                              <span className="text-red-600">
                                {String(log.changes.oldValues?.[field] ?? "—")}
                              </span>
                              <span className="mx-1">→</span>
                              <span className="text-green-700">
                                {String(log.changes.newValues?.[field] ?? "—")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    ) : log.action.includes("CREATE") ? (

                      <span className="text-sm text-green-600 font-medium">
                        Created new record
                      </span>

                    ) : log.action.includes("DELETE") ? (

                      <span className="text-sm text-red-600 font-medium">
                        Deleted record
                      </span>

                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer with info */}
        {filteredLogs.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredLogs.length}</span> of{" "}
              <span className="font-medium">{logs.length}</span> logs
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;