//src>components>AdminUsers.jsx

import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { UserCircle2, BadgeCheck, XCircle, Loader2, Eye, ExternalLink, LogIn } from "lucide-react";
import { API_BASE } from "../config";

const MAIN_API_BASE = "https://novachain2-backend.onrender.com";
const USER_FRONTEND_URL = "https://novachain2-frontend.vercel.app";  // <-- ADD THIS LINE

// KYC image resolver (always uses main backend for /uploads)
function resolveKYCUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/uploads/")) return `${MAIN_API_BASE}${raw}`;
  return `${MAIN_API_BASE}/uploads/${raw}`;
}

function formatDate(dt) {
  if (!dt) return "N/A";
  try {
    const d = new Date(dt);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "N/A";
  }
}

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [userWinModes, setUserWinModes] = useState({});
  const [userIdSearch, setUserIdSearch] = useState("");

  // Scroll refs for sync
  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);

  // Sync the top and main table scrollbars
  useEffect(() => {
    const topDiv = topScrollRef.current;
    const tableDiv = tableScrollRef.current;
    if (!topDiv || !tableDiv) return;

    const onTopScroll = () => {
      if (tableDiv.scrollLeft !== topDiv.scrollLeft) tableDiv.scrollLeft = topDiv.scrollLeft;
    };
    const onTableScroll = () => {
      if (topDiv.scrollLeft !== tableDiv.scrollLeft) topDiv.scrollLeft = tableDiv.scrollLeft;
    };

    topDiv.addEventListener("scroll", onTopScroll);
    tableDiv.addEventListener("scroll", onTableScroll);

    return () => {
      topDiv.removeEventListener("scroll", onTopScroll);
      tableDiv.removeEventListener("scroll", onTableScroll);
    };
  }, []);

  // Fetch users from admin API (sorted DESC)
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");
      data = Array.isArray(data) ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];
      setUsers(data);
    } catch (err) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

  const fetchWinModes = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/user-win-modes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const modeMap = {};
      (Array.isArray(data) ? data : []).forEach((u) => {
        modeMap[u.id] = u.mode;
      });
      setUserWinModes(modeMap);
    } catch {
      setUserWinModes({});
    }
  };

  // Set WIN/LOSE mode for user
  const setUserWinMode = async (user_id, mode) => {
    setActionLoading(user_id + "-winmode");
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_BASE}/api/admin/users/${user_id}/trade-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: mode === null ? null : mode.toUpperCase() }),
      });
      await fetchWinModes();
    } catch (err) {
      setError(err.message || t("users.updateError"));
    }
    setActionLoading(null);
  };

  // Approve/Reject KYC
  const handleKYCStatus = async (user_id, kyc_status) => {
    setActionLoading(user_id + "-kyc");
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_BASE}/api/admin/user-kyc-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id, kyc_status }),
      });
      await fetchUsers();
    } catch (err) {
      setError(err.message || t("users.kycUpdateError"));
    }
    setActionLoading(null);
  };

  // Delete user
  const deleteUser = async (user_id) => {
    if (!window.confirm(t("users.deleteConfirm"))) return;
    setActionLoading(user_id + "-delete");
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_BASE}/api/admin/user/${user_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers();
    } catch (err) {
      setError(err.message || t("users.deleteError"));
    }
    setActionLoading(null);
  };

  // Login as user (Impersonation)
  const loginAsUser = async (user) => {
    setActionLoading(user.id + "-login");
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE}/api/admin/impersonate/${user.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to login as user");

      // Store the user token for frontend access
      localStorage.setItem("impersonateToken", data.userToken);  // <-- FIXED: use consistent key name
      localStorage.setItem("impersonatedUserId", user.id);
      localStorage.setItem("impersonatedUserEmail", user.email);
      
      // Open user frontend login page in new tab
      window.open(`${USER_FRONTEND_URL}/login?impersonate=true&token=${data.userToken}`, "_blank");
      
      // Show temporary success message
      const successMsg = document.createElement("div");
      successMsg.className = "fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg z-50 animate-pulse";
      successMsg.innerText = t("users.loginSuccess", { email: user.email });
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
      
    } catch (err) {
      setError(err.message || t("users.loginError"));
    }
    setActionLoading(null);
  };

  useEffect(() => {
    fetchUsers();
    fetchWinModes();
    // eslint-disable-next-line
  }, []);

  // Filtered users by userIdSearch
  const filteredUsers = users.filter((user) => {
    if (!userIdSearch) return true;
    return String(user.id).toLowerCase().includes(userIdSearch.toLowerCase());
  });

return (
    <div className="w-full animate-fade-in">
      {/* Sleek Header (No more yellow/green gradients) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <UserCircle2 size={20} className="text-gray-400" />
          {t("users.title")}
        </h2>

        {/* Clean Search Box */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder={t("users.searchById")}
            className="w-full sm:w-64 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-[#ffd700] transition-colors"
            value={userIdSearch}
            onChange={e => setUserIdSearch(e.target.value)}
          />
          {userIdSearch && (
            <button
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors"
              onClick={() => setUserIdSearch("")}
            >
              {t("common.clear")}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-[#FFD700] mr-2" size={24} />
          <span className="text-gray-400 font-medium">{t("common.loading")}</span>
        </div>
      ) : (
        /* Single, clean scrollable table container */
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#131722]/50 backdrop-blur-sm">
          <table className="admin-table min-w-[1200px]">
            <thead>
              <tr>
                <th>{t("users.userId")}</th>
                <th>{t("users.email")}</th>
                <th>{t("users.loginAs")}</th>
                <th>{t("users.selfie")}</th>
                <th>{t("users.idCard")}</th>
                <th>{t("users.kycStatus")}</th>
                <th>{t("users.signUpDate")}</th>
                <th>{t("users.currentMode")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-gray-500 py-8">{t("users.noUsers")}</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="font-mono text-gray-400">#{user.id}</td>
                    <td className="font-medium text-white">{user.email}</td>
                    
                    {/* Flat, professional Login button */}
                    <td>
                      <button
                        onClick={() => loginAsUser(user)}
                        disabled={actionLoading === user.id + "-login"}
                        className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        {actionLoading === user.id + "-login" ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <LogIn size={14} />
                        )}
                        {actionLoading === user.id + "-login" ? t("common.loggingIn") : t("users.loginAs")}
                      </button>
                    </td>

                    {/* Cleaned up KYC Images (No giant yellow borders) */}
                    <td>
                      {user.kyc_selfie ? (
                        <img
                          src={resolveKYCUrl(user.kyc_selfie)}
                          alt="Selfie"
                          className="w-10 h-10 object-cover rounded-lg border border-white/10"
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <span className="text-gray-500 text-xs">{t("common.na")}</span>
                      )}
                    </td>
                    <td>
                      {user.kyc_id_card ? (
                        <img
                          src={resolveKYCUrl(user.kyc_id_card)}
                          alt="ID Card"
                          className="w-10 h-10 object-cover rounded-lg border border-white/10"
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <span className="text-gray-500 text-xs">{t("common.na")}</span>
                      )}
                    </td>

                    {/* KYC Status & Flat Buttons */}
                    <td>
                      {user.kyc_status === "approved" && (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md w-fit border border-emerald-500/20">
                          <BadgeCheck size={14} /> {t("kyc.approved")}
                        </span>
                      )}
                      {user.kyc_status === "rejected" && (
                        <span className="flex items-center gap-1 text-rose-400 text-xs font-bold bg-rose-500/10 px-2 py-1 rounded-md w-fit border border-rose-500/20">
                          <XCircle size={14} /> {t("kyc.rejected")}
                        </span>
                      )}
                      {user.kyc_status === "pending" && (
                        <div className="flex flex-col gap-2">
                          <span className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded-md w-fit border border-amber-500/20">
                            {t("kyc.pending")}
                          </span>
                          {user.kyc_selfie && user.kyc_id_card && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleKYCStatus(user.id, "approved")}
                                disabled={actionLoading === user.id + "-kyc"}
                                className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md transition-colors flex items-center gap-1 text-xs font-bold"
                              >
                                {actionLoading === user.id + "-kyc" ? <Loader2 className="animate-spin" size={14} /> : <BadgeCheck size={14} />}
                              </button>
                              <button
                                onClick={() => handleKYCStatus(user.id, "rejected")}
                                disabled={actionLoading === user.id + "-kyc"}
                                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-md transition-colors flex items-center gap-1 text-xs font-bold"
                              >
                                <XCircle size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="text-xs text-gray-400">{formatDate(user.created_at)}</td>
                    
                    {/* Flat Mode Toggles */}
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setUserWinMode(user.id, userWinModes[user.id] === "WIN" ? null : "WIN")}
                          disabled={actionLoading === user.id + "-winmode"}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${
                            userWinModes[user.id] === "WIN"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
                          }`}
                        >
                          {t("users.win")}
                        </button>
                        <button
                          onClick={() => setUserWinMode(user.id, userWinModes[user.id] === "LOSE" ? null : "LOSE")}
                          disabled={actionLoading === user.id + "-winmode"}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${
                            userWinModes[user.id] === "LOSE"
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
                          }`}
                        >
                          {t("users.lose")}
                        </button>
                      </div>
                    </td>

                    {/* Flat Delete Button */}
                    <td>
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={actionLoading === user.id + "-delete"}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        {actionLoading === user.id + "-delete" ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {t("common.delete")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}