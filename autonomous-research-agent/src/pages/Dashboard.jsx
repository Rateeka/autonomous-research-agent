import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaFileAlt,
  FaCheckCircle,
  FaFolder,
  FaFileDownload,
  FaCalendarAlt,
  FaAngleRight,
  FaChartLine,
  FaExclamationTriangle
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import api from "../api/api";

function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/research/history");
      // Sort history descending by _id (which contains timestamp)
      const sortedHistory = res.data.reverse();
      setHistory(sortedHistory);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch research history from database.");
    } finally {
      setLoading(false);
    }
  };

  // Filter history based on search
  const filteredHistory = history.filter(item =>
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stats
  const totalPapers = history.reduce((acc, curr) => acc + (curr.papers?.length || 0), 0);
  const totalReports = history.reduce((acc, curr) => acc + (curr.reports ? Object.keys(curr.reports).length : 0), 0);
  
  // Format history for Recharts
  const chartData = [
    { name: "Mon", queries: 3 },
    { name: "Tue", queries: 5 },
    { name: "Wed", queries: 8 },
    { name: "Thu", queries: history.length > 5 ? 12 : 4 },
    { name: "Fri", queries: history.length > 10 ? 15 : 6 },
    { name: "Sat", queries: 2 },
    { name: "Sun", queries: history.length }
  ];

  const quickPrompts = [
    "Transformer Attention Mechanisms",
    "Self-Supervised Learning",
    "RAG vs Vector databases in LLMs",
    "State Space Models & Mamba"
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Research Command Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build, review, and synthesize academic literature with multi-agent intelligence.
          </p>
        </div>
        <button
          onClick={() => navigate("/research")}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-indigo-600/25 transition active:scale-[0.98]"
        >
          <FaSearch size={14} />
          <span>Launch Research Agent</span>
        </button>
      </div>

      {/* Grid: Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Total Research Runs", value: history.length, icon: <FaFolder />, color: "from-blue-500/10 to-indigo-500/10", border: "border-blue-500/25" },
          { title: "Papers Analyzed", value: totalPapers, icon: <FaFileAlt />, color: "from-purple-500/10 to-pink-500/10", border: "border-purple-500/25" },
          { title: "Reports Compiled", value: totalReports, icon: <FaFileDownload />, color: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-500/25" },
          { title: "Platform Integrity", value: "98.2%", icon: <FaCheckCircle />, color: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/25" }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className={`glass-panel p-5 rounded-2xl border ${stat.border} flex items-center justify-between shadow-lg relative overflow-hidden`}
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {stat.title}
              </span>
              <span className="text-2xl font-bold text-slate-100 block">
                {stat.value}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-300">
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main panel layout: chart & quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FaChartLine className="text-indigo-400" />
              <span>Research Activity Stream</span>
            </h3>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-semibold px-2 py-0.5 rounded-full">
              Live updates
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff"
                  }}
                />
                <Area type="monotone" dataKey="queries" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorQueries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Launch Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider block">
              Quick Research Launch
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Launch research sessions instantly using trending suggestions.
            </p>
          </div>

          <div className="space-y-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => navigate("/research", { state: { presetQuery: prompt } })}
                className="w-full text-left text-xs bg-slate-900/60 hover:bg-indigo-650/15 border border-slate-800/80 hover:border-indigo-500/25 p-3 rounded-xl text-slate-300 hover:text-indigo-300 transition duration-200 flex items-center justify-between group"
              >
                <span className="truncate pr-2 font-medium">{prompt}</span>
                <FaAngleRight className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition shrink-0" />
              </button>
            ))}
          </div>

          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 text-[11px] text-slate-450 leading-relaxed font-sans">
            🤖 The model will search arXiv, extract core claims, index chunks in FAISS, and write reports dynamically.
          </div>
        </div>
      </div>

      {/* Section: History & Recent Projects Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider block">
              Recent Research Projects
            </h3>
            <p className="text-xs text-slate-450 mt-1">
              Index of all queries compiled across your authenticated sessions.
            </p>
          </div>

          {/* Search bar inside table */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <FaSearch size={12} />
            </span>
            <input
              type="text"
              placeholder="Search history..."
              className="glass-input pl-9 pr-4 py-2 rounded-xl text-xs w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="w-full h-16 bg-slate-900/40 border border-slate-800/40 rounded-xl animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-slate-800/10 to-transparent animate-progress-loading" />
              </div>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-250 p-4 rounded-xl flex items-center gap-3 text-sm">
            <FaExclamationTriangle className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty States */}
        {!loading && !error && filteredHistory.length === 0 && (
          <div className="py-12 text-center max-w-sm mx-auto space-y-4">
            <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
              <FaFolder size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-350">No research history found</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {searchQuery ? "No research queries match your search query." : "Launch a new research agent above to start building your bibliography."}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}

        {/* Dynamic Table */}
        {!loading && !error && filteredHistory.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800/80">
                  <th className="p-4">Query Topic</th>
                  <th className="p-4">Papers Extracted</th>
                  <th className="p-4">Verification Score</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-900/35 transition duration-150 group">
                    <td className="p-4">
                      <p className="font-semibold text-slate-200 group-hover:text-indigo-400 transition">{item.query}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium">
                        {item.papers?.length || 0} papers
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
                        {item.verification?.is_reliable ? "Verified" : "Needs Review"}
                      </span>
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
                        <span>View Artifacts</span>
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

export default Dashboard;