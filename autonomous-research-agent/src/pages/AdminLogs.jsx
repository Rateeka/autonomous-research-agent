import { useState, useEffect } from "react";
import { FaTerminal, FaSyncAlt, FaExclamationCircle } from "react-icons/fa";
import api from "../api/api";

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/logs");
      if (res.data?.success) {
        setLogs(res.data.logs);
      } else {
        setError("Failed to retrieve system operations logs.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "An error occurred while fetching logs."
      );
    } finally {
      setLoading(false);
    }
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case "ERROR":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "WARN":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "SUCCESS":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      default:
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaTerminal className="text-indigo-500 text-2.5xl" />
            <span>Operations Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track and monitor critical backend execution runs, API endpoint pings, and pipeline exceptions.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="text-xs py-2 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-200 transition font-semibold flex items-center gap-2"
        >
          <FaSyncAlt className={loading ? "animate-spin text-indigo-400" : "text-slate-400"} />
          <span>Refresh Console</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-800/40 p-4 rounded-xl text-xs">
          <FaExclamationCircle className="shrink-0 text-sm" />
          <span>{error}</span>
        </div>
      )}

      {/* Terminal logs list */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/40">
          <FaTerminal className="text-indigo-400" />
          <span>Live Console Stream</span>
        </h3>

        {loading ? (
          <div className="py-16 flex justify-center items-center text-slate-450 text-xs gap-2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Fetching operations cache...</span>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-10">No recent system operations logs found.</p>
        ) : (
          <div className="bg-black/90 p-4 rounded-2xl border border-slate-850 h-[450px] overflow-y-auto font-mono text-[11px] leading-relaxed scrollbar-thin select-text space-y-2">
            {logs.map((log, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-900/60 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500">[{log.timestamp}]</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getLevelStyle(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-indigo-400/80 font-semibold">{log.source}:</span>
                  <span className="text-slate-300 font-sans">{log.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLogs;
