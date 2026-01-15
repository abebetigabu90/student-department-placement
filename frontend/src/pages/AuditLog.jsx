import { useEffect, useState } from "react";
import axios from "axios";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading audit logs...</p>;

  return (
    <div className="container">
      <h2>Audit Logs</h2>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Actor</th>
            <th>Role</th>
            <th>Action</th>
            <th>Target</th>
            <th>Details</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {logs.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No audit records found
              </td>
            </tr>
          )}

          {logs.map((log, index) => (
            <tr key={log._id}>
              <td>{index + 1}</td>

              <td>
              {log.actorId ? log.actorId.name : "System"}
              </td>

              <td>{log.actorRole}</td>

              <td>{formatAction(log.action)}</td>

              <td>{log.targetModel}</td>

              <td>
                {log.action === "UPDATE_STUDENT" &&
                  log.changes?.updatedFields?.length > 0 && (
                    <small>
                      Updated: {log.changes.updatedFields.join(", ")}
                    </small>
                  )}

                {log.action !== "UPDATE_STUDENT" && (
                  <small>—</small>
                )}
              </td>

              <td>
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogs;
