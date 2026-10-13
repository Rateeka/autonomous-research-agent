import { useAuth } from "../context/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaCalendarAlt,
  FaFileAlt,
  FaSearch,
  FaChartBar,
  FaAward
} from "react-icons/fa";
import { formatUserMetadata } from "../utils/auth";

function Profile() {
  const { username, role } = useAuth();

  // Parsing display values using metadata utility
  const { isEmail, emailValue, displayUsername, displayRole } = formatUserMetadata(username, role);
  
  // Dummy statistics to enrich the profile dashboard
  const stats = [
    {
      label: "Research Queries",
      value: "24",
      icon: <FaSearch className="text-indigo-400 text-lg" />,
      desc: "Queries analyzed by agents"
    },
    {
      label: "Papers Analyzed",
      value: "142",
      icon: <FaFileAlt className="text-sky-400 text-lg" />,
      desc: "Processed in vector database"
    },
    {
      label: "Reports Exported",
      value: "8",
      icon: <FaChartBar className="text-emerald-400 text-lg" />,
      desc: "PDF & Markdown reports"
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FaUser className="text-indigo-500 text-2xl animate-pulse" />
          <span>User Profile</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your identity details, view account telemetry, and check platform statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: User Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-sky-500" />
            
            {/* User Icon Badge */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600/20 to-sky-500/20 border-2 border-indigo-500/40 flex items-center justify-center text-4xl text-indigo-400 shadow-inner mt-4">
              <FaUser />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-100 capitalize">{displayUsername}</h4>
              <p className="text-[10px] text-indigo-400 font-mono tracking-wider mt-1 uppercase font-semibold">{displayRole}</p>
            </div>

            <div className="w-full border-t border-slate-800/60 pt-4 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FaAward className="text-indigo-400 shrink-0" />
                <span>Status: <span className="text-emerald-400 font-semibold">Active Session</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FaCalendarAlt className="text-indigo-400 shrink-0" />
                <span>Joined: <span className="text-slate-200">July 2026</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Statistics */}
        <div className="md:col-span-2 space-y-6">
          {/* Workspace Details Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/40">
              <FaUserShield className="text-indigo-400" />
              <span>Workspace Profile Details</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Username / Account Name</span>
                <div className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-300 bg-slate-900/30 border border-slate-800 font-mono">
                  {username || "Not set"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Email Address</span>
                <div className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-300 bg-slate-900/30 border border-slate-800 font-mono">
                  {emailValue}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Permissions Level</span>
                <div className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-300 bg-slate-900/30 border border-slate-800 font-semibold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${role === "admin" ? "bg-indigo-400 animate-ping" : "bg-emerald-400"}`} />
                  {displayRole}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">System Access Token</span>
                <div className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-400 bg-slate-900/30 border border-slate-800 font-mono truncate select-all">
                  Bearer jwt_auth_token_active...
                </div>
              </div>
            </div>
          </div>

          {/* User Telemetry Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</span>
                  {stat.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white leading-tight font-sans tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    {stat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
