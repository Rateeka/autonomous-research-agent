import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHistory,
  FaCalendarAlt,
  FaAngleRight,
  FaFileAlt,
  FaExclamationTriangle,
  FaSearch,
  FaDatabase
} from "react-icons/fa";
import api from "../api/api";

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/research/history");
      setHistory(res.data.reverse()); // Descending order
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve research logs from database.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = history.filter(item =>
    item.query.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaHistory className="text-indigo-500 text-2xl" />
            <span>Research Archives</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and load any academic inquiry session stored in the MongoDB history log.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <FaSearch size={12} />
          </span>
          <input
            type="text"
            placeholder="Search query archives..."
            className="glass-input pl-9 pr-4 py-2.5 rounded-xl text-xs w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl min-h-[400px] flex flex-col justify-between">
        
        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="w-full h-16 bg-slate-900/40 border border-slate-800/40 rounded-xl animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/10 to-transparent animate-progress-loading" />
              </div>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-250 p-4 rounded-xl flex items-center gap-3 text-sm">
            <FaExclamationTriangle className="text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty States */}
        {!loading && !error && filtered.length === 0 && (
          <div className="py-16 text-center max-w-sm mx-auto space-y-4 my-auto">
            <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
              <FaDatabase size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-350">Archives Empty</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                {search ? "No archives match your search keywords." : "You have not compiled any research queries yet."}
              </p>
            </div>
            {search ? (
              <button
                onClick={() => setSearch("")}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Clear Search Filter
              </button>
            ) : (
              <button
                onClick={() => navigate("/research")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Launch Workspace
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800/80">
                  <th className="p-4">Research Query</th>
                  <th className="p-4">Papers Extracted</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">APA Citations</th>
                  <th className="p-4">Execution Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-900/30 transition duration-150 group">
                    <td className="p-4 font-semibold text-slate-200 group-hover:text-indigo-400 transition max-w-xs truncate">
                      {item.query}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium">
                        {item.papers?.length || 0} items
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded font-medium ${
                          item.verification?.is_reliable
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {item.verification?.is_reliable ? "Reliable" : "Review Needed"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-450 font-medium">
                      {item.citations?.length || 0} formatted
                    </td>
                    <td className="p-4 text-slate-450 font-medium">
                      <span className="flex items-center gap-1.5">
                        <FaCalendarAlt size={10} className="text-slate-500" />
                        {new Date(parseInt(item._id.substring(0, 8), 16) * 1000).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate("/research", { state: { loadedResult: item } })}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-350 transition flex items-center gap-1 ml-auto"
                      >
                        <span>Load Workspace</span>
                        <FaAngleRight size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;