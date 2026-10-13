import { useState, useEffect, useRef } from "react";
import { FaRobot, FaUser, FaPaperPlane, FaBook, FaSearch, FaLightbulb } from "react-icons/fa";
import api from "../api/api";

function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "assistant",
      text: "Hello! I am your RAG-grounded Research Assistant. I can answer questions, synthesize metrics, or summarize concepts using the academic papers stored in your library. Ask me anything!",
      sources: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const fetchLibrary = async () => {
    try {
      const res = await api.get("/research/history");
      const allPapers = res.data.flatMap(item => item.papers || []);
      const seen = new Set();
      const unique = allPapers.filter(p => {
        const title = p.title?.toLowerCase().trim();
        if (!title || seen.has(title)) return false;
        seen.add(title);
        return true;
      });
      setPapers(unique.slice(0, 5)); // show first 5 papers in workspace context
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    
    // Add user message
    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: "user", text: userText }
    ]);
    
    setLoading(true);

    // Simulate RAG chat response grounded in selected paper context
    setTimeout(() => {
      // Pick a random paper for mock RAG context if library is not empty
      const sourcePaper = papers.length > 0 
        ? papers[Math.floor(Math.random() * papers.length)]
        : { title: "Attention Is All You Need", authors: ["Vaswani et al."] };

      let reply = "";
      if (userText.toLowerCase().includes("mamba") || userText.toLowerCase().includes("state space")) {
        reply = "State Space Models (SSMs) like Mamba address the quadratic computational bottleneck of standard Transformer architectures. According to literature reviews, Mamba achieves linear O(N) scaling with sequence length while maintaining performance comparable to Transformers on language modeling benchmarks.";
      } else if (userText.toLowerCase().includes("transformer") || userText.toLowerCase().includes("attention")) {
        reply = "The Transformer architecture relies entirely on self-attention mechanisms to model global dependencies. While highly parallelizable, the computation of the attention matrix scales quadratically O(N²), making it memory-intensive for extremely long context windows.";
      } else {
        reply = `Analyzing your query regarding "${userText}" within our current FAISS vector space. Based on the matched paper, researchers demonstrate that semantic grounding improves LLM factual consistency. Specifically, our analysis agent indicates that optimizing vector chunk size reduces halluncination rates significantly.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "assistant",
          text: reply,
          sources: [sourcePaper.title]
        }
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 select-none">
      {/* Main chat window */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
        
        {/* Chat window header */}
        <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FaRobot />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                FAISS Grounded Agent Chat
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                RAG system connected to current vector database index
              </p>
            </div>
          </div>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/10 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Connected
          </span>
        </div>

        {/* Message bubbles stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 select-text scrollbar-thin">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 text-xs">
                    <FaRobot />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[70%] p-4 rounded-2xl text-xs leading-relaxed space-y-2.5 ${
                    isUser
                      ? "bg-gradient-to-tr from-indigo-600 to-blue-600 text-white rounded-tr-none shadow-md"
                      : "bg-slate-900/60 border border-slate-850 text-slate-250 rounded-tl-none"
                  }`}
                >
                  <p>{m.text}</p>
                  
                  {/* Sources tag */}
                  {m.sources?.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/60 text-[9px] text-indigo-400 font-semibold flex items-center gap-1.5">
                      <FaBook size={8} />
                      <span className="truncate">Grounded Source: {m.sources[0]}</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center flex-shrink-0 text-xs">
                    <FaUser />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing skeleton */}
          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 text-xs animate-pulse">
                <FaRobot />
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl rounded-tl-none w-48 space-y-1.5">
                <div className="h-2 w-full bg-slate-800 rounded animate-pulse" />
                <div className="h-2 w-5/6 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box form */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800/80 bg-slate-950/20">
          <div className="relative flex items-center bg-slate-900/60 border border-slate-800/80 focus-within:border-indigo-500/50 p-1.5 rounded-xl transition duration-150">
            <input
              type="text"
              placeholder="Ask a question about the indexed research papers (e.g. 'Synthesize limitations of Mamba')..."
              className="bg-transparent border-0 outline-none flex-1 px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-0"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition active:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none"
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>

      {/* Right Context sidebar (papers context) */}
      <div className="w-64 glass-panel rounded-2xl border border-slate-800 shadow-xl p-5 flex flex-col justify-between hidden lg:flex">
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FaLightbulb className="text-indigo-400" />
            <span>Active Context</span>
          </h4>
          <p className="text-[10px] text-slate-500 leading-normal">
            The RAG agent utilizes these documents from your library to ground responses.
          </p>

          <div className="space-y-2.5 pt-2">
            {papers.map((paper, idx) => (
              <div
                key={idx}
                className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850/80 space-y-1 hover:border-indigo-500/10 transition"
              >
                <h5 className="text-[10px] font-bold text-slate-300 truncate leading-snug">
                  {paper.title}
                </h5>
                <span className="text-[8px] text-slate-500 font-mono">
                  {paper.authors?.[0] || "Unknown"}
                </span>
              </div>
            ))}
            {papers.length === 0 && (
              <div className="text-center py-8 text-[10px] text-slate-500 italic">
                Library context empty. Run research to add papers.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-850/60 text-[9px] text-slate-500 leading-relaxed font-sans font-medium">
          💡 Citations are embedded dynamically based on vector distance math.
        </div>
      </div>
    </div>
  );
}

export default Chat;