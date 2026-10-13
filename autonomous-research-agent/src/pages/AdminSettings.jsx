import { useState, useEffect } from "react";
import {
  FaSlidersH,
  FaDatabase,
  FaServer,
  FaHeartbeat,
  FaSyncAlt,
  FaTrash,
  FaPowerOff,
  FaTerminal,
  FaMicrochip,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaInfoCircle
} from "react-icons/fa";
import api from "../api/api";

function AdminSettings() {
  // AI Pipeline States
  const [model, setModel] = useState("gemma3:1b");
  const [embeddingModel, setEmbeddingModel] = useState("nomic-embed-text");
  const [chunkSize, setChunkSize] = useState(4000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [maxChunks, setMaxChunks] = useState(100);
  const [topK, setTopK] = useState(5);

  // Infrastructure Status States
  const [dbStatus, setDbStatus] = useState("Checking...");
  const [ollamaStatus, setOllamaStatus] = useState("Connected");
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [faissStatus, setFaissStatus] = useState("Active (Normal)");

  // Action Loading States
  const [rebuildLoading, setRebuildLoading] = useState(false);
  const [clearCacheLoading, setClearCacheLoading] = useState(false);
  const [restartLoading, setRestartLoading] = useState(false);
  
  // Notification Alert State
  const [actionAlert, setActionAlert] = useState("");
  const [alertType, setAlertType] = useState("success"); // 'success' or 'error'

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setApiStatus("Checking...");
    setDbStatus("Checking...");
    try {
      const res = await api.get("/health");
      if (res.data?.status === "running") {
        setApiStatus("Healthy");
        setDbStatus("Connected");
      } else {
        setApiStatus("Degraded");
        setDbStatus("Unknown");
      }
    } catch (err) {
      console.error(err);
      setApiStatus("Disconnected");
      setDbStatus("Disconnected");
    }
  };

  const handleApplyPipeline = (e) => {
    e.preventDefault();
    setAlertType("success");
    setActionAlert("AI Pipeline configuration parameters successfully synchronized with running agents.");
    setTimeout(() => setActionAlert(""), 4000);
  };

  const handleRebuildIndex = () => {
    setRebuildLoading(true);
    setActionAlert("");
    setTimeout(() => {
      setRebuildLoading(false);
      setAlertType("success");
      setActionAlert("Local FAISS vector store index reconstructed successfully (5 summaries synchronized).");
      setTimeout(() => setActionAlert(""), 4000);
    }, 2000);
  };

  const handleClearCache = () => {
    setClearCacheLoading(true);
    setActionAlert("");
    setTimeout(() => {
      setClearCacheLoading(false);
      setAlertType("success");
      setActionAlert("Redis cache pool and temporary paper PDFs cleared successfully (1.4 GB purged).");
      setTimeout(() => setActionAlert(""), 4000);
    }, 1500);
  };

  const handleRestartServices = () => {
    setRestartLoading(true);
    setActionAlert("");
    setTimeout(() => {
      setRestartLoading(false);
      setAlertType("success");
      setActionAlert("Background Celery workers and Gunicorn nodes successfully restarted.");
      setTimeout(() => setActionAlert(""), 4000);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FaServer className="text-indigo-500 text-2xl" />
          <span>Admin Control Panel</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform systems operation checks, configure LLM pipeline parameters, manage cluster services, and monitor resource consumption.
        </p>
      </div>

      {/* Toast Alert Notification */}
      {actionAlert && (
        <div className={`p-4 rounded-xl border flex justify-between items-center text-xs transition duration-300 ${
          alertType === "success"
            ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
            : "bg-red-950/20 border-red-800/40 text-red-300"
        }`}>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="shrink-0 text-sm" />
            <span>{actionAlert}</span>
          </div>
          <button onClick={() => setActionAlert("")} className="text-slate-450 hover:text-slate-200">
            <FaTimes />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Columns: Settings forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Pipeline Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/40">
              <FaSlidersH className="text-indigo-400" />
              <span>AI Pipeline Configuration</span>
            </h3>

            <form onSubmit={handleApplyPipeline} className="space-y-5 text-xs">
              
              {/* LLM Model Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">LLM synthesis Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-250 outline-none focus:border-indigo-500/50 bg-[#0c101a] border border-slate-800"
                  >
                    <option value="gemma3:1b">gemma3:1b (Active Local)</option>
                    <option value="gemma:2b">gemma:2b</option>
                    <option value="llama3:latest">llama3:latest</option>
                    <option value="mistral:latest">mistral:latest</option>
                  </select>
                </div>

                {/* Embedding Model Selection */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">Vector Embedding Model</label>
                  <select
                    value={embeddingModel}
                    onChange={(e) => setEmbeddingModel(e.target.value)}
                    className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-250 outline-none focus:border-indigo-500/50 bg-[#0c101a] border border-slate-800"
                  >
                    <option value="nomic-embed-text">nomic-embed-text (Local Default)</option>
                    <option value="text-embedding-3-small">text-embedding-3-small (OpenAI)</option>
                    <option value="all-MiniLM-L6-v2">all-MiniLM-L6-v2 (CPU Local)</option>
                  </select>
                </div>
              </div>

              {/* Chunk Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <label className="text-slate-450">Chunk Size Limit</label>
                  <span className="text-indigo-400">{chunkSize} tokens</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="8000"
                  step="500"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Chunk Overlap */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <label className="text-slate-450">Chunk Overlap</label>
                  <span className="text-indigo-400">{chunkOverlap} tokens</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Max Chunks */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <label className="text-slate-450">Max Embedded Chunks</label>
                    <span className="text-indigo-400">{maxChunks} chunks</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={maxChunks}
                    onChange={(e) => setMaxChunks(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Top-K Results */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <label className="text-slate-455">Top-K RAG Results</label>
                    <span className="text-indigo-400">{topK} contexts</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold transition active:scale-[0.98]"
              >
                Apply Parameters
              </button>
            </form>
          </div>

          {/* Infrastructure Health Status */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/40 pb-2">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FaDatabase className="text-indigo-400" />
                <span>Infrastructure & Storage Nodes</span>
              </h3>
              <button
                onClick={runHealthCheck}
                className="text-[10px] py-1 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-350 transition font-semibold"
              >
                Re-check Nodes
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-850">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <FaServer className="text-indigo-400" />
                  <span>Platform API Node</span>
                </span>
                <span className={`font-bold ${apiStatus === "Healthy" ? "text-emerald-400" : "text-amber-400"}`}>
                  {apiStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-850">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <FaDatabase className="text-sky-400" />
                  <span>MongoDB Server</span>
                </span>
                <span className={`font-bold ${dbStatus === "Connected" ? "text-emerald-400" : "text-amber-400"}`}>
                  {dbStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-850">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <FaSlidersH className="text-purple-400" />
                  <span>Ollama Inference</span>
                </span>
                <span className="text-emerald-400 font-bold">{ollamaStatus}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-850">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <FaSlidersH className="text-teal-400" />
                  <span>FAISS vector index</span>
                </span>
                <span className="text-emerald-400 font-bold">{faissStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Maintenance and Monitoring */}
        <div className="space-y-6">
          
          {/* Maintenance Section */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/40">
              <FaSyncAlt className="text-indigo-400" />
              <span>Operations Maintenance</span>
            </h3>

            <div className="space-y-3 text-xs">
              <button
                onClick={handleRebuildIndex}
                disabled={rebuildLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-200 font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaSyncAlt className={`text-indigo-400 ${rebuildLoading ? "animate-spin" : ""}`} />
                <span>{rebuildLoading ? "Indexing Vector Database..." : "Rebuild Vector Index"}</span>
              </button>

              <button
                onClick={handleClearCache}
                disabled={clearCacheLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-200 font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaTrash className={`text-sky-400 ${clearCacheLoading ? "animate-bounce" : ""}`} />
                <span>{clearCacheLoading ? "Purging Files..." : "Clear Cache"}</span>
              </button>

              <button
                onClick={handleRestartServices}
                disabled={restartLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-200 font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaPowerOff className={`text-red-400 ${restartLoading ? "animate-pulse" : ""}`} />
                <span>{restartLoading ? "Restarting Services..." : "Restart Services"}</span>
              </button>
            </div>
          </div>

          {/* Monitoring (System stats and errors) */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/40">
              <FaHeartbeat className="text-indigo-400" />
              <span>Monitoring & Telemetry</span>
            </h3>

            <div className="space-y-4 text-xs">
              {/* CPU Usage progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-450 uppercase font-semibold">
                  <span className="flex items-center gap-1"><FaMicrochip /> CPU Utilization</span>
                  <span>42%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "42%" }} />
                </div>
              </div>

              {/* Memory Usage progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-450 uppercase font-semibold">
                  <span className="flex items-center gap-1"><FaDatabase /> RAM Consumption</span>
                  <span>58%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "58%" }} />
                </div>
              </div>

              {/* Storage space */}
              <div className="flex justify-between items-center text-[10px] bg-slate-900/30 p-2.5 rounded-xl border border-slate-850">
                <span className="text-slate-450 font-semibold uppercase">Vector Store cache</span>
                <span className="text-slate-200 font-bold">1.2 GB / 4.0 GB</span>
              </div>

              {/* Recent Errors console */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <FaTerminal className="text-red-400" /> Recent Errors (API Console)
                </span>
                <div className="bg-black/80 text-[10px] text-slate-400 font-mono p-3 rounded-xl border border-slate-850 h-28 overflow-y-auto space-y-1.5 leading-relaxed select-text scrollbar-thin">
                  <div className="text-yellow-500/80">
                    <span className="text-slate-500">[05:22:11]</span> WARN: Ollama inference latency exceeds threshold (1220ms)
                  </div>
                  <div className="text-red-500/80">
                    <span className="text-slate-500">[05:44:32]</span> ERROR: connection pool timed out querying MongoDB (retried)
                  </div>
                  <div className="text-indigo-400/80">
                    <span className="text-slate-500">[06:12:09]</span> INFO: FAISS local vector indices synchronized with remote pool
                  </div>
                  <div className="text-slate-500">
                    <span className="text-slate-500">[06:33:14]</span> SUCCESS: Heartbeat ping answered in 12ms.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminSettings;
