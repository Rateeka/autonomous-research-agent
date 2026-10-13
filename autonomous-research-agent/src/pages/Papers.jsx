import { useState, useEffect } from "react";
import { FaFilePdf, FaSearch, FaBookOpen, FaUser, FaLink } from "react-icons/fa";
import api from "../api/api";

function Papers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/research/history");
      
      // flatMap and deduplicate papers by title/url
      const allPapers = res.data.flatMap(item => item.papers || []);
      const seen = new Set();
      const uniquePapers = allPapers.filter(paper => {
        const title = paper.title?.toLowerCase().trim();
        if (!title || seen.has(title)) return false;
        seen.add(title);
        return true;
      });

      setPapers(uniquePapers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = papers.filter(paper =>
    paper.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.authors?.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaBookOpen className="text-indigo-500 text-2xl" />
            <span>Academic Library</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse through all unique academic papers crawled and indexed from arXiv across your queries.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <FaSearch size={12} />
          </span>
          <input
            type="text"
            placeholder="Search within library..."
            className="glass-input pl-9 pr-4 py-2.5 rounded-xl text-xs w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main panel grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl min-h-[400px]">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="w-full h-36 bg-slate-900/40 border border-slate-800/40 rounded-xl animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/10 to-transparent animate-progress-loading" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center max-w-sm mx-auto space-y-4">
            <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
              <FaFilePdf size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-350">Library is Empty</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                {searchQuery ? "No library items match your search keywords." : "No crawled papers exist in your literature logs yet."}
              </p>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((paper, idx) => (
              <div
                key={idx}
                className="glass-panel p-5 rounded-2xl border border-slate-800/80 shadow-md flex flex-col justify-between space-y-4 hover:border-indigo-500/25 transition duration-150 relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 flex-shrink-0">
                      <FaFilePdf size={14} />
                    </div>
                    {paper.pdf_url && (
                      <a
                        href={paper.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-semibold"
                      >
                        <FaLink size={9} />
                        <span>Source Link</span>
                      </a>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 leading-snug line-clamp-2">
                    {paper.title || "Untitled Paper"}
                  </h4>
                  <p className="text-[10px] text-slate-450 leading-relaxed font-sans line-clamp-3">
                    {paper.summary || "Abstract description not cached in database."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/40 text-[9px] text-slate-500 flex justify-between items-center font-sans font-medium">
                  <span className="truncate pr-4 flex items-center gap-1">
                    <FaUser size={8} />
                    <span>{paper.authors?.join(", ") || "Unknown Author"}</span>
                  </span>
                  <span className="flex-shrink-0 text-indigo-400">arXiv ID</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Papers;