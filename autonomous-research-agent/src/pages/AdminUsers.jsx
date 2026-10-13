import { useState, useEffect } from "react";
import { 
  FaUserShield, 
  FaUser, 
  FaUserTag, 
  FaExclamationCircle, 
  FaSearch, 
  FaTrash, 
  FaUserSlash, 
  FaUserCheck, 
  FaSyncAlt, 
  FaCheckCircle 
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import { formatUserMetadata } from "../utils/auth";

function AdminUsers() {
  const { username: currentUsername } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Feedback states
  const [actionMessage, setActionMessage] = useState("");
  const [actionSuccess, setActionSuccess] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/users");
      if (res.data?.success) {
        setUsers(res.data.users);
      } else {
        setError("Failed to retrieve user accounts.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "An error occurred while fetching users."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole, userName) => {
    if (userName === currentUsername) {
      showFeedback("You cannot change your own role to prevent self-lockout.", false);
      return;
    }

    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data?.success) {
        showFeedback(`Successfully updated ${userName}'s role to ${newRole}.`, true);
        // Update local state
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        showFeedback(res.data?.message || "Failed to update role.", false);
      }
    } catch (err) {
      console.error(err);
      showFeedback(err.response?.data?.message || "Error updating user role.", false);
    }
  };

  const handleToggleSuspend = async (userId, currentStatus, userName) => {
    if (userName === currentUsername) {
      showFeedback("You cannot suspend your own administrative session.", false);
      return;
    }

    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`, { status: nextStatus });
      if (res.data?.success) {
        showFeedback(`Successfully ${nextStatus === "suspended" ? "suspended" : "activated"} user ${userName}.`, true);
        setUsers(users.map(u => u._id === userId ? { ...u, status: nextStatus } : u));
      } else {
        showFeedback(res.data?.message || "Failed to update suspension status.", false);
      }
    } catch (err) {
      console.error(err);
      showFeedback(err.response?.data?.message || "Error updating suspension status.", false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userName === currentUsername) {
      showFeedback("You cannot delete your own administrative account.", false);
      return;
    }

    if (!window.confirm(`Are you absolutely sure you want to permanently delete the user account "${userName}"? This action is irreversible.`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data?.success) {
        showFeedback(`User account ${userName} has been permanently deleted.`, true);
        setUsers(users.filter(u => u._id !== userId));
      } else {
        showFeedback(res.data?.message || "Failed to delete user account.", false);
      }
    } catch (err) {
      console.error(err);
      showFeedback(err.response?.data?.message || "Error deleting user account.", false);
    }
  };

  const showFeedback = (msg, isSuccess) => {
    setActionMessage(msg);
    setActionSuccess(isSuccess);
    setTimeout(() => setActionMessage(""), 5000);
  };

  // Filter users based on query
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u._id && u._id.toLowerCase().includes(query)) ||
      (u.role && u.role.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaUserShield className="text-indigo-500 text-2.5xl animate-pulse" />
            <span>User Accounts Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administer system access permissions, inspect accounts metadata, modify user roles, or terminate active workspace memberships.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="text-xs py-2 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-200 transition font-semibold flex items-center gap-2"
        >
          <FaSyncAlt className={loading ? "animate-spin text-indigo-400" : "text-slate-400"} />
          <span>Refresh Accounts</span>
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-800/40 p-4 rounded-xl text-xs">
          <FaExclamationCircle className="shrink-0 text-sm" />
          <span>{error}</span>
        </div>
      )}

      {actionMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs transition duration-300 ${
          actionSuccess
            ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
            : "bg-red-950/20 border-red-800/40 text-red-300"
        }`}>
          {actionSuccess ? (
            <FaCheckCircle className="shrink-0 text-sm text-emerald-400" />
          ) : (
            <FaExclamationCircle className="shrink-0 text-sm text-red-400" />
          )}
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Users List Container */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        
        {/* Subheader & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/40">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FaUserTag className="text-indigo-400" />
            <span>Registered Accounts ({filteredUsers.length})</span>
          </h3>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <FaSearch size={12} />
            </span>
            <input
              type="text"
              placeholder="Search user accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-9.5 pr-4 py-2 text-xs rounded-xl w-full text-slate-200 bg-slate-900/30 border border-slate-800/80 focus:border-indigo-500/50 outline-none transition duration-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center items-center text-slate-450 text-xs gap-2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Retrieving accounts...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-12">
            {searchQuery ? "No user accounts match the search criteria." : "No registered user accounts found."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4 font-semibold text-[10px]">User Account Details</th>
                  <th className="py-3 px-4 font-semibold text-[10px]">Permissions Role</th>
                  <th className="py-3 px-4 font-semibold text-[10px]">Registration Date</th>
                  <th className="py-3 px-4 font-semibold text-[10px]">Access Status</th>
                  <th className="py-3 px-4 font-semibold text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredUsers.map((u) => {
                  const { isEmail, displayUsername } = formatUserMetadata(u.username, u.role);
                  const isSelf = u.username === currentUsername;
                  const isSuspended = u.status === "suspended";

                  return (
                    <tr key={u._id} className="hover:bg-slate-900/10 transition duration-150">
                      
                      {/* User Account Info */}
                      <td className="py-4 px-4 text-slate-200 font-medium">
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 shadow-inner">
                            <FaUser size={12} className={isSelf ? "text-indigo-400 animate-pulse" : "text-slate-400"} />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-200 capitalize">{displayUsername}</span>
                              {isSelf && (
                                <span className="bg-indigo-600/20 text-indigo-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-indigo-500/20 font-sans tracking-wide">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{u.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Permissions Role */}
                      <td className="py-4 px-4">
                        {isSelf ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-650/20 text-indigo-400 border border-indigo-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            Administrator
                          </span>
                        ) : (
                          <select
                            value={u.role || "user"}
                            onChange={(e) => handleRoleChange(u._id, e.target.value, u.username)}
                            className="bg-[#0c101a] border border-slate-800/80 rounded-xl px-2.5 py-1 text-slate-350 text-[11px] font-semibold outline-none focus:border-indigo-500/40"
                          >
                            <option value="user">Research User</option>
                            <option value="admin">Administrator</option>
                          </select>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="py-4 px-4 font-mono text-slate-400 text-[10px]">
                        {u.created_at || "Not Available"}
                      </td>

                      {/* Access Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isSuspended
                            ? "bg-red-950/20 text-red-400 border border-red-800/20 animate-pulse"
                            : "bg-emerald-950/20 text-emerald-400 border border-emerald-800/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? "bg-red-400" : "bg-emerald-400"}`} />
                          {isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          
                          {/* Suspend / Reactivate */}
                          <button
                            onClick={() => handleToggleSuspend(u._id, u.status, u.username)}
                            disabled={isSelf}
                            title={isSuspended ? "Reactivate User Session" : "Suspend User Access"}
                            className={`p-2 rounded-xl border transition-all duration-200 ${
                              isSelf
                                ? "opacity-30 cursor-not-allowed border-slate-800 text-slate-600"
                                : isSuspended
                                ? "bg-emerald-600/10 text-emerald-400 border-emerald-800 hover:bg-emerald-600/20"
                                : "bg-amber-600/10 text-amber-400 border-amber-800/80 hover:bg-amber-600/20"
                            }`}
                          >
                            {isSuspended ? <FaUserCheck size={12} /> : <FaUserSlash size={12} />}
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => handleDeleteUser(u._id, u.username)}
                            disabled={isSelf}
                            title="Permanently Delete Account"
                            className={`p-2 rounded-xl border transition-all duration-200 ${
                              isSelf
                                ? "opacity-30 cursor-not-allowed border-slate-800 text-slate-600"
                                : "bg-red-650/10 text-red-400 border-red-800/80 hover:bg-red-650/20 active:scale-95"
                            }`}
                          >
                            <FaTrash size={12} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
