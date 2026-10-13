import { useState, useEffect } from "react";
import { FaFilePdf, FaFileWord, FaFilePowerpoint, FaSearch, FaBriefcase, FaCalendarAlt, FaFileDownload } from "react-icons/fa";
import api from "../api/api";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/research/history");
      
      // Map history runs to list of report records
      const reportsList = res.data
        .filter(item => item.reports && (item.reports.pdf || item.reports.docx || item.reports.ppt))
        .map(item => {
          const dateStr = new Date(parseInt(item._id.substring(0, 8), 16) * 1000).toLocaleDateString();
          return {
            id: item._id,
            query: item.query,
            date: dateStr,
            formats: item.reports
          };
        });

      setReports(reportsList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getReportFilename = (path) => {
    if (!path) return "";
    return path.split(/[\\/]/).pop();
  };

  const filtered = reports.filter(r =>
    r.query.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaBriefcase className="text-indigo-500 text-2xl" />
            <span>Briefings & Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access compiled PDF summary dossiers, editable DOCX files, and PowerPoint presentation slides.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <FaSearch size={12} />
          </span>
          <input
            type="text"
            placeholder="Search reports..."
            className="glass-input pl-9 pr-4 py-2.5 rounded-xl text-xs w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main panel container */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl min-h-[400px]">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(s => (
              <div key={s} className="w-full h-20 bg-slate-900/40 border border-slate-800/40 rounded-xl animate-pulse relative overflow-hidden" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center max-w-sm mx-auto space-y-4">
            <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
              <FaFileDownload size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-350">No Reports Compiled</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                {search ? "No reports match your search criteria." : "Run a new literature review to generate docx/pdf reports."}
              </p>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((report) => (
              <div
                key={report.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-500/15 transition duration-150"
              >
                {/* Info block */}
                <div className="space-y-1.5 min-w-0">
                  <h4 className="text-xs font-bold text-slate-200 truncate leading-snug">
                    {report.query}
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt size={9} />
                      <span>{report.date}</span>
                    </span>
                    <span>•</span>
                    <span className="text-indigo-400">Compiler Agent v1.2</span>
                  </div>
                </div>

                {/* Downloads grid */}
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {report.formats.pdf && (
                    <a
                      href={`http://127.0.0.1:5000/api/reports/download/${getReportFilename(report.formats.pdf)}`}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/25 hover:text-red-400 rounded-xl text-[10px] font-bold text-slate-400 transition"
                    >
                      <FaFilePdf className="text-red-400" />
                      <span>PDF Document</span>
                    </a>
                  )}
                  {report.formats.docx && (
                    <a
                      href={`http://127.0.0.1:5000/api/reports/download/${getReportFilename(report.formats.docx)}`}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/25 hover:text-blue-400 rounded-xl text-[10px] font-bold text-slate-400 transition"
                    >
                      <FaFileWord className="text-blue-400" />
                      <span>Word Brief</span>
                    </a>
                  )}
                  {report.formats.ppt && (
                    <a
                      href={`http://127.0.0.1:5000/api/reports/download/${getReportFilename(report.formats.ppt)}`}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/25 hover:text-amber-400 rounded-xl text-[10px] font-bold text-slate-400 transition"
                    >
                      <FaFilePowerpoint className="text-amber-400" />
                      <span>PowerPoint Slides</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;