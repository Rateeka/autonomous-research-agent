import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaUser,
  FaLock,
  FaCog,
  FaSignOutAlt,
  FaGraduationCap,
  FaCheckCircle,
  FaExclamationCircle,
  FaChevronRight,
  FaCalendarAlt,
  FaEnvelope
} from "react-icons/fa";
import api from "../api/api";
import { formatUserMetadata } from "../utils/auth";

function Settings() {
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();

  // Profile parsing using metadata utility
  const { isEmail, emailValue, displayUsername, displayRole } = formatUserMetadata(username, role);
  const createdDate = "Not Available";

  // Security (Change Password) State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);

  // Preferences State
  const [citationStyle, setCitationStyle] = useState(
    localStorage.getItem("pref_citation_style") || "APA"
  );
  const [aiModel, setAiModel] = useState(
    localStorage.getItem("pref_ai_model") || "gemma3:1b"
  );
  const [prefSuccess, setPrefSuccess] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSecurityError("");
    setSecuritySuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match.");
      return;
    }

    setSecurityLoading(true);

    try {
      const res = await api.post("/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (res.data?.success) {
        setSecuritySuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setSecurityError(res.data?.message || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      setSecurityError(
        err.response?.data?.message || "An error occurred while updating password."
      );
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem("pref_citation_style", citationStyle);
    localStorage.setItem("pref_ai_model", aiModel);
    setPrefSuccess("Research preferences saved successfully!");
    setTimeout(() => setPrefSuccess(""), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaCog className="text-indigo-500 text-2xl animate-spin-slow" />
            <span>Account Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal workspace profile, security credentials, and literature review preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: Configuration Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Section */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/40">
              <FaUser className="text-indigo-400" />
              <span>Workspace Profile</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Username</span>
                <input
                  type="text"
                  readOnly
                  value={displayUsername}
                  className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-400 bg-slate-900/30 border border-slate-800 outline-none select-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1">
                  <FaEnvelope size={10} className="text-slate-500" /> Email Address
                </span>
                <input
                  type="text"
                  readOnly
                  value={emailValue}
                  className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-400 bg-slate-900/30 border border-slate-800 outline-none select-all"
                />
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">User Role</span>
                <div className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-200 bg-slate-900/30 border border-slate-800 font-semibold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${role === "admin" ? "bg-indigo-400" : "bg-emerald-400"}`} />
                  {displayRole}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1">
                  <FaCalendarAlt size={10} className="text-slate-500" /> Account Created Date
                </span>
                <input
                  type="text"
                  readOnly
                  value={createdDate}
                  className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-400 bg-slate-900/30 border border-slate-800 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Security Section (Change Password) */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/40">
              <FaLock className="text-indigo-400" />
              <span>Security & Credentials</span>
            </h3>

            {securityError && (
              <div className="flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-800/40 p-3 rounded-xl text-xs">
                <FaExclamationCircle className="shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            {securitySuccess && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-xl text-xs">
                <FaCheckCircle className="shrink-0" />
                <span>{securitySuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-200 outline-none focus:border-indigo-500/50 bg-[#0c101a] border border-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">New Password</label>
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-200 outline-none focus:border-indigo-500/50 bg-[#0c101a] border border-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-200 outline-none focus:border-indigo-500/50 bg-[#0c101a] border border-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={securityLoading}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {securityLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Research Preferences Section */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/40">
              <FaGraduationCap className="text-indigo-400" />
              <span>Research Preferences</span>
            </h3>

            {prefSuccess && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-xl text-xs">
                <FaCheckCircle className="shrink-0" />
                <span>{prefSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">Default Citation Style</label>
                  <select
                    value={citationStyle}
                    onChange={(e) => setCitationStyle(e.target.value)}
                    className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-250 outline-none focus:border-indigo-500/50 bg-[#0c101a] border border-slate-800"
                  >
                    <option value="APA">APA (American Psychological Assoc.)</option>
                    <option value="MLA">MLA (Modern Language Assoc.)</option>
                    <option value="Chicago">Chicago Manual of Style</option>
                    <option value="Harvard">Harvard Referencing System</option>
                    <option value="IEEE">IEEE Reference Style</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">Default AI Model (Optional)</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="glass-input px-3.5 py-2.5 rounded-xl w-full text-slate-250 outline-none focus:border-indigo-500/50 bg-[#0c101a] border border-slate-800"
                  >
                    <option value="gemma3:1b">gemma3:1b (Active Local)</option>
                    <option value="gemma:2b">gemma:2b</option>
                    <option value="llama3:latest">llama3:latest</option>
                    <option value="mistral:latest">mistral:latest</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold transition active:scale-[0.98]"
              >
                Save Preferences
              </button>
            </form>
          </div>

        </div>

        {/* Right: Quick actions & Logout Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
            
            {/* User Icon Badge */}
            <div className="w-16 h-16 rounded-full bg-indigo-600/10 border-2 border-indigo-500/30 flex items-center justify-center text-3xl text-indigo-400 shadow-inner mt-2">
              <FaUser />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-100">{displayUsername}</h4>
              <p className="text-[10px] text-indigo-400 font-mono tracking-wider mt-0.5">{displayRole}</p>
            </div>

            <div className="w-full border-t border-slate-800/60 pt-4 space-y-3">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-gradient-to-r from-red-650 to-rose-650 hover:from-red-600 hover:to-rose-600 active:scale-[0.98] text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/20"
              >
                <FaSignOutAlt />
                <span>Exit Session</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;