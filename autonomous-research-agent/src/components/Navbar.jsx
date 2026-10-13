import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBell, 
  FaUserCircle, 
  FaSearch, 
  FaCircle, 
  FaUser, 
  FaCog, 
  FaSignOutAlt, 
  FaUserShield 
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { formatUserMetadata } from "../utils/auth";

function Navbar() {
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Format user attributes using common metadata utility
  const { displayUsername: displayName, displayRole } = formatUserMetadata(username, role);

  // Mock notifications
  const notifications = [
    { id: 1, text: "Verification completed: RAG Agent accuracy checked.", time: "2m ago", read: false },
    { id: 2, text: "Report download ready: Mamba Architectures.pdf", time: "10m ago", read: true },
    { id: 3, text: "Ollama agent connection verified successfully.", time: "1h ago", read: true }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-[#080c14]/50 backdrop-blur-md border-b border-slate-800/60 px-8 py-4 flex justify-between items-center relative z-20">
      {/* Platform Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
          Literature Review Suite
        </h2>
        {/* <p className="text-xs text-slate-500 font-sans">
          Powered by Ollama (Gemma 3) & local FAISS vectors
        </p> */}
      </div>

      {/* Actions */}
      <div className="flex gap-5 items-center">
        {/* Notifications Icon with Indicator */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-850 hover:text-indigo-400 text-slate-400 transition relative"
          >
            <FaBell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#080c14] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl border border-slate-800/80 shadow-2xl p-4 z-50">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800/40">
                <span className="text-xs font-bold text-slate-200">Recent Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-indigo-600/20 text-indigo-400 font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs transition duration-200 ${
                      n.read ? "bg-transparent text-slate-450" : "bg-indigo-650/10 border border-indigo-500/10 text-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-sans leading-relaxed">{n.text}</p>
                      {!n.read && <FaCircle className="text-indigo-400 text-[6px] mt-1 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-slate-800" />

        {/* User Info Profile Panel */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 text-left p-1.5 rounded-xl border border-transparent hover:border-slate-800/60 hover:bg-slate-900/30 transition duration-200 cursor-pointer outline-none focus:outline-none"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-slate-200 leading-tight">{displayName}</p>
              <span className="text-[10px] text-slate-500 tracking-wider font-semibold">{displayRole}</span>
            </div>
            <div className="p-0.5 rounded-xl border border-slate-800 bg-slate-900/60 text-indigo-500 transition-colors duration-200 hover:border-indigo-500/50">
              <FaUserCircle className="text-3xl" />
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <>
              {/* Invisible Click Overlay to Close */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setProfileDropdownOpen(false)} 
              />
              
              <div className="absolute right-0 mt-2 w-52 glass-panel rounded-2xl border border-slate-800/80 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("/profile");
                    }}
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-350 hover:bg-slate-800/40 hover:text-white transition duration-150 text-left cursor-pointer"
                  >
                    <FaUser className="text-indigo-400 shrink-0" size={13} />
                    <span>Profile</span>
                  </button>

                  {role === "admin" ? (
                    <>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate("/admin/settings");
                        }}
                        className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-350 hover:bg-slate-800/40 hover:text-white transition duration-150 text-left cursor-pointer"
                      >
                        <FaCog className="text-indigo-400 shrink-0" size={13} />
                        <span>Admin Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate("/admin/users");
                        }}
                        className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-350 hover:bg-slate-800/40 hover:text-white transition duration-150 text-left cursor-pointer"
                      >
                        <FaUserShield className="text-indigo-400 shrink-0" size={13} />
                        <span>User Management</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate("/settings");
                      }}
                      className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-350 hover:bg-slate-800/40 hover:text-white transition duration-150 text-left cursor-pointer"
                    >
                      <FaCog className="text-indigo-400 shrink-0" size={13} />
                      <span>Settings</span>
                    </button>
                  )}

                  <div className="h-px bg-slate-800/60 my-1 mx-2" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate("/login");
                    }}
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition duration-150 text-left cursor-pointer"
                  >
                    <FaSignOutAlt className="shrink-0" size={13} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;