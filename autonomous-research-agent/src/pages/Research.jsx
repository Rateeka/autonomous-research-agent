import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaTerminal,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCopy,
  FaArrowRight,
  FaBookOpen,
  FaNetworkWired,
  FaDna,
  FaTools,
  FaDatabase
} from "react-icons/fa";
import { Stepper, Step, StepLabel, StepConnector, stepConnectorClasses } from "@mui/material";
import { styled } from "@mui/material/styles";
import useResearchTask from "../hooks/useResearchTask";

// Styled connector for dark theme
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient(95deg, #6366f1 0%, #3b82f6 50%, #10b981 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient(95deg, #6366f1 0%, #3b82f6 50%, #10b981 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: "#1e293b",
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")(({ ownerState }) => ({
  backgroundColor: "#1e293b",
  zIndex: 1,
  color: "#94a3b8",
  width: 44,
  height: 44,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  border: "2px solid #334155",
  transition: "all 0.3s ease",
  ...(ownerState.active && {
    backgroundImage: "linear-gradient(136deg, #6366f1 0%, #3b82f6 100%)",
    color: "#fff",
    borderColor: "#4f46e5",
    boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
  }),
  ...(ownerState.completed && {
    backgroundImage: "linear-gradient(136deg, #3b82f6 0%, #10b981 100%)",
    color: "#fff",
    borderColor: "#10b981",
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <FaSearch size={14} />,
    2: <FaFilePdf size={14} />,
    3: <FaNetworkWired size={14} />,
    4: <FaDna size={14} />,
    5: <FaCheckCircle size={14} />,
    6: <FaBookOpen size={14} />,
    7: <FaFileWord size={14} />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ active, completed }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const pipelineSteps = [
  { key: "search", label: "Search arXiv" },
  { key: "download", label: "PDF Download" },
  { key: "embed", label: "Vector Indexing" },
  { key: "analyze", label: "AI Synthesis" },
  { key: "verify", label: "Verification" },
  { key: "cite", label: "Bibliography" },
  { key: "report", label: "Compile Brief" }
];

function Research() {
  const location = useLocation();
  const navigate = useNavigate();
  const terminalEndRef = useRef(null);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("synthesis");
  const [viewingResult, setViewingResult] = useState(null);
  
  // Custom hook for SSE async tasks
  const {
    loading,
    progress,
    currentStep,
    statusMessage,
    logs,
    error,
    result,
    startTask
  } = useResearchTask();

  // Scroll terminal logs to bottom automatically
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Handle preset query or loaded results passed from history list
  useEffect(() => {
    if (location.state?.presetQuery) {
      const q = location.state.presetQuery;
      setQuery(q);
      startTask(q);
      // Clear location state
      navigate(location.pathname, { replace: true });
    } else if (location.state?.loadedResult) {
      setViewingResult(location.state.loadedResult);
      // Clear location state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  // Update viewing result when task completes
  useEffect(() => {
    if (result) {
      setViewingResult(result);
    }
  }, [result]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setViewingResult(null);
    startTask(query);
  };

  const getStepIndex = (stepKey) => {
    if (stepKey === "started") return 0;
    if (stepKey === "extract") return 1; // map extraction to download phase
    if (stepKey === "chunk" || stepKey === "index") return 2; // map chunking to indexing phase
    if (stepKey === "save" || stepKey === "completed") return 6;
    const index = pipelineSteps.findIndex(s => s.key === stepKey);
    return index !== -1 ? index : 0;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const getReportFilename = (path) => {
    if (!path) return "";
    return path.split(/[\\/]/).pop();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 1. IDLE STATE: Query Input panel */}
      {!loading && !viewingResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-center max-w-3xl mx-auto py-12"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Evolve Your Academic <span className="gradient-text-blue">Literature Reviews</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Query the arXiv repository, index documents into a vector space, run analysis, and compile brief reports asynchronously.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative mt-8">
            <div className="relative glass-panel rounded-2xl p-2 flex items-center border border-slate-800 shadow-2xl">
              <span className="pl-4 text-slate-500 shrink-0">
                <FaSearch size={18} />
              </span>
              <input
                type="text"
                placeholder="Query a topic (e.g., 'Attention mechanism scalability in large language models')..."
                className="bg-transparent border-0 outline-none grow px-4 py-3 text-sm text-white placeholder-slate-500 focus:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-semibold flex items-center gap-1.5 transition active:scale-[0.97]"
              >
                <span>Synthesize</span>
                <FaArrowRight size={12} />
              </button>
            </div>
          </form>

          {/* Preset Prompts Chips */}
          <div className="space-y-3 pt-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Popular Fields of Inquiry
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "Quantum machine learning algorithms",
                "Graph Neural Networks for drug discovery",
                "Deep reinforcement learning in robotics",
                "Retrieval augmented generation security flaws"
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(p)}
                  className="text-xs bg-slate-900/60 hover:bg-indigo-650/15 border border-slate-800/80 hover:border-indigo-500/35 px-4 py-2.5 rounded-full text-slate-400 hover:text-indigo-300 transition duration-155"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. RUNNING STATE: Real-time progress trackers & console logs */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Stepper progress tracker */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Agent Pipeline Progression
                </h3>
                <p className="text-xs text-indigo-400 mt-0.5 font-medium animate-pulse">
                  {statusMessage}
                </p>
              </div>
              <span className="text-sm font-bold text-slate-350">{progress}%</span>
            </div>

            {/* Glowing progress bar */}
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-linear-to-r from-indigo-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-500 shadow-inner shadow-white/10"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* MUI Stepper */}
            <div className="pt-2 overflow-x-auto pb-4">
              <Stepper
                alternativeLabel
                activeStep={getStepIndex(currentStep)}
                connector={<ColorlibConnector />}
                className="min-w-175"
              >
                {pipelineSteps.map((step, idx) => (
                  <Step key={idx}>
                    <StepLabel StepIconComponent={ColorlibStepIcon}>
                      <span className="text-[11px] font-bold text-slate-450 block uppercase tracking-wider mt-1.5">
                        {step.label}
                      </span>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </div>
          </div>

          {/* Console Log Terminal */}
          <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-96">
            <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaTerminal className="text-slate-500 text-xs" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Platform Execution Logs
                </span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-500/20 border border-red-500/30 rounded-full" />
                <span className="w-2.5 h-2.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full" />
                <span className="w-2.5 h-2.5 bg-green-500/20 border border-green-500/30 rounded-full" />
              </div>
            </div>

            {/* Scrollable logs terminal */}
            <div className="bg-slate-950/45 p-5 flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 select-text selection:bg-indigo-500/35 scrollbar-thin">
              {logs.map((log, idx) => {
                let logClass = "text-slate-350";
                if (log.startsWith("[ERROR]")) logClass = "text-red-400";
                else if (log.startsWith("[SUCCESS]")) logClass = "text-emerald-400";
                else if (log.startsWith("[RESEARCH-AGENT]")) logClass = "text-indigo-400";
                else if (log.startsWith("[VECTOR-STORE]")) logClass = "text-sky-400";
                return (
                  <div key={idx} className={`${logClass} leading-relaxed wrap-break-words`}>
                    {log}
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. ERROR STATE */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel p-6 rounded-2xl border border-red-500/25 shadow-xl bg-red-500/5 max-w-2xl mx-auto space-y-4"
        >
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-red-400 text-2xl shrink-0" />
            <h3 className="text-base font-bold text-slate-200">Execution Error</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800 font-mono">
            {error}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-4 py-2"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => startTask(query)}
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg"
            >
              Retry Pipeline
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. COMPLETED STATE: Display Results */}
      {viewingResult && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Result Header & Download Reports center */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Synthesis Complete
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-1">{query || viewingResult.query || "Research Synthesis Details"}</h2>
            </div>
            
            {/* Download buttons grid */}
            <div className="flex flex-wrap gap-2.5">
              {viewingResult.reports?.pdf && (
                <a
                  href={`http://127.0.0.1:5000/api/reports/download/${getReportFilename(viewingResult.reports.pdf)}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/25 hover:text-red-400 text-xs font-semibold text-slate-350 transition duration-150"
                >
                  <FaFilePdf className="text-red-400" />
                  <span>PDF Brief</span>
                </a>
              )}
              {viewingResult.reports?.docx && (
                <a
                  href={`http://127.0.0.1:5000/api/reports/download/${getReportFilename(viewingResult.reports.docx)}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/25 hover:text-blue-400 text-xs font-semibold text-slate-350 transition duration-150"
                >
                  <FaFileWord className="text-blue-400" />
                  <span>DOCX Brief</span>
                </a>
              )}
              {viewingResult.reports?.ppt && (
                <a
                  href={`http://127.0.0.1:5000/api/reports/download/${getReportFilename(viewingResult.reports.ppt)}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/25 hover:text-amber-400 text-xs font-semibold text-slate-350 transition duration-150"
                >
                  <FaFilePowerpoint className="text-amber-400" />
                  <span>PPTX Brief</span>
                </a>
              )}
            </div>
          </div>

          {/* Grid: Verification check card & stats summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Verification card */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Verification Report
                </h3>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    viewingResult.verification?.is_reliable
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {viewingResult.verification?.is_reliable ? "Reliable" : "Review Needed"}
                </span>
              </div>
              
              {viewingResult.verification?.issues?.length > 0 ? (
                <div className="space-y-2">
                  {viewingResult.verification.issues.map((issue, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-slate-400 leading-normal">
                      <span className="mt-0.5 text-amber-500 shrink-0">
                        <FaExclamationTriangle size={12} />
                      </span>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <FaCheckCircle className="text-emerald-500 text-3xl mx-auto" />
                  <p className="text-xs text-slate-400">
                    No logical inconsistencies or missing metrics identified.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Metrics panel */}
            <div className="md:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Knowledge Base Statistics
                  </h3>
                  <p className="text-xs text-slate-450 mt-1">
                    Index of elements ingested and processed during this literature review session.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/40">
                <div className="text-center space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Papers Extracted</span>
                  <span className="text-xl font-bold text-slate-200">{viewingResult.papers?.length || 0}</span>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Vector Chunks</span>
                  <span className="text-xl font-bold text-slate-200">FAISS Index</span>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">LLM Processing</span>
                  <span className="text-xl font-bold text-slate-200">Gemma 3</span>
                </div>
              </div>
            </div>

          </div>

          {/* Tabs header */}
          <div className="flex border-b border-slate-800/60 gap-4">
            {[
              { id: "synthesis", label: "AI Synthesis Grid", icon: <FaNetworkWired size={12} /> },
              { id: "citations", label: "APA Bibliography", icon: <FaBookOpen size={11} /> },
              { id: "papers", label: "Indexed Papers Library", icon: <FaFileAlt size={12} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3.5 px-1.5 text-xs font-bold transition-all relative ${
                  activeTab === tab.id
                    ? "text-indigo-400"
                    : "text-slate-450 hover:text-slate-200"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tabs contents */}
          <div className="mt-4">
            
            {/* Tab: Synthesis Grid */}
            {activeTab === "synthesis" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {viewingResult.summaries?.length > 0 ? (
                  <div className="space-y-6">
                    {viewingResult.summaries.map((summary, idx) => (
                      <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800/40 pb-3">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-200 truncate uppercase tracking-wider block">
                              Analysis Card
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">
                              File: {getReportFilename(summary.paper)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                          {/* Objective */}
                          <div className="space-y-1.5 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                              <FaSearch size={10} />
                              <span>Research Objective</span>
                            </span>
                            <p className="text-slate-300 leading-relaxed font-sans">{summary.objective || "Not specified."}</p>
                          </div>

                          {/* Model */}
                          <div className="space-y-1.5 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                              <FaTools size={10} />
                              <span>Model/Architecture</span>
                            </span>
                            <p className="text-slate-300 leading-relaxed font-sans">{summary.model || "Not specified."}</p>
                          </div>

                          {/* Dataset */}
                          <div className="space-y-1.5 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                              <FaDatabase size={10} />
                              <span>Dataset/Benchmarks</span>
                            </span>
                            <p className="text-slate-300 leading-relaxed font-sans">{summary.dataset || "Not specified."}</p>
                          </div>

                          {/* Accuracy */}
                          <div className="space-y-1.5 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                              <FaCheckCircle size={10} />
                              <span>Reported Accuracy</span>
                            </span>
                            <p className="text-slate-300 leading-relaxed font-sans">{summary.accuracy || "Not specified."}</p>
                          </div>

                          {/* Limitations */}
                          <div className="space-y-1.5 bg-slate-900/40 p-4 rounded-xl border border-slate-850 md:col-span-2">
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                              <FaExclamationTriangle size={10} />
                              <span>Limitations & Constraints</span>
                            </span>
                            <p className="text-slate-300 leading-relaxed font-sans">{summary.limitations || "Not specified."}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 glass-panel rounded-2xl border border-slate-800 text-center space-y-2">
                    <FaExclamationTriangle className="text-amber-500 text-3xl mx-auto" />
                    <p className="text-xs text-slate-400">No structured summaries found in this session.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: Bibliography */}
            {activeTab === "citations" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/40">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    APA Bibliographical References
                  </h3>
                  <button
                    onClick={() => copyToClipboard(viewingResult.citations?.join("\n\n"))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-[10px] font-bold text-slate-400 hover:text-white transition border border-slate-800"
                  >
                    <FaCopy />
                    <span>Copy All</span>
                  </button>
                </div>

                {viewingResult.citations?.length > 0 ? (
                  <div className="space-y-4">
                    {viewingResult.citations.map((cite, idx) => (
                      <div key={idx} className="flex gap-4 items-start text-xs leading-relaxed group select-text">
                        <span className="text-slate-500 font-mono mt-0.5">{idx + 1}.</span>
                        <div className="flex-1 bg-slate-900/20 hover:bg-slate-900/40 p-3 rounded-xl border border-slate-850/60 transition group relative">
                          <p className="text-slate-300 italic pr-8">{cite}</p>
                          <button
                            onClick={() => copyToClipboard(cite)}
                            className="absolute top-3 right-3 text-slate-500 hover:text-slate-350 opacity-0 group-hover:opacity-100 transition duration-150"
                          >
                            <FaCopy size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-450">
                    No references registered for this workspace.
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: Indexed Papers */}
            {activeTab === "papers" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                {viewingResult.papers?.length > 0 ? (
                  viewingResult.papers.map((paper, idx) => (
                    <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                            <FaFilePdf size={14} />
                          </div>
                          {paper.pdf_url && (
                            <a
                              href={paper.pdf_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg transition font-semibold"
                            >
                              Open PDF URL
                            </a>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 leading-snug line-clamp-2">
                          {paper.title || "Untitled Paper"}
                        </h4>
                        <p className="text-[10px] text-slate-450 leading-relaxed font-sans line-clamp-3">
                          {paper.summary || "No abstract details available."}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/40 text-[9px] text-slate-500 flex justify-between items-center font-medium font-sans">
                        <span className="truncate pr-4">Authors: {paper.authors?.join(", ") || "Unknown"}</span>
                        <span className="shrink-0">arXiv</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 glass-panel rounded-2xl border border-slate-800 text-center text-xs text-slate-450">
                    No indexed documents found in this workspace.
                  </div>
                )}
              </motion.div>
            )}

          </div>

          {/* Back button to start over */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => { setViewingResult(null); setQuery(""); }}
              className="text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-400 px-5 py-2.5 rounded-xl transition"
            >
              Start New Literature Review
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}

export default Research;