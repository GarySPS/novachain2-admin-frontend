//src>components>AdminUsers.jsx

// src/components/AdminUsers.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  UserCircle2, BadgeCheck, XCircle, Loader2, Eye, ExternalLink, LogIn,
  Search, Filter, Calendar, Mail, Shield, ChevronDown, ChevronUp,
  Star, Users, Activity, Clock, Trash2, CheckCircle, AlertCircle,
  Image, FileText, MoreVertical, Download, RefreshCw, UserCheck
} from "lucide-react";
import { API_BASE, MAIN_API_BASE } from "../config";

const USER_FRONTEND_URL = "https://novachain2-frontend.vercel.app";

// Helper functions
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
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return `Today ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return `Yesterday ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "N/A";
  }
}

function getRelativeTime(date) {
  if (!date) return "";
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userWinModes, setUserWinModes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKYC, setFilterKYC] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, pendingKYC: 0, approvedKYC: 0, winUsers: 0, loseUsers: 0 });

  // Scroll refs for sync
  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);

  // Sync scrollbars
  useEffect(() => {
    const topDiv = topScrollRef.current;
    const tableDiv = tableScrollRef.current;
    if (!topDiv || !tableDiv) return;

    const onTopScroll = () => { if (tableDiv.scrollLeft !== topDiv.scrollLeft) tableDiv.scrollLeft = topDiv.scrollLeft; };
    const onTableScroll = () => { if (topDiv.scrollLeft !== tableDiv.scrollLeft) topDiv.scrollLeft = tableDiv.scrollLeft; };

    topDiv.addEventListener("scroll", onTopScroll);
    tableDiv.addEventListener("scroll", onTableScroll);

    return () => {
      topDiv.removeEventListener("scroll", onTopScroll);
      tableDiv.removeEventListener("scroll", onTableScroll);
    };
  }, []);

  // Fetch users
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
      
      // Calculate stats
      const pendingKYC = data.filter(u => u.kyc_status === "pending" && u.kyc_selfie && u.kyc_id_card).length;
      const approvedKYC = data.filter(u => u.kyc_status === "approved").length;
      setStats({
        total: data.length,
        pendingKYC,
        approvedKYC,
        winUsers: 0,
        loseUsers: 0
      });
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
      let winCount = 0, loseCount = 0;
      (Array.isArray(data) ? data : []).forEach((u) => {
        modeMap[u.id] = u.mode;
        if (u.mode === "WIN") winCount++;
        if (u.mode === "LOSE") loseCount++;
      });
      setUserWinModes(modeMap);
      setStats(prev => ({ ...prev, winUsers: winCount, loseUsers: loseCount }));
    } catch {
      setUserWinModes({});
    }
  };

  const setUserWinMode = async (user_id, mode) => {
    setActionLoading(user_id + "-winmode");
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_BASE}/api/admin/users/${user_id}/trade-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: mode === null ? null : mode.toUpperCase() }),
      });
      await fetchWinModes();
      showSuccessMessage(t("users.modeUpdated"));
    } catch (err) {
      setError(err.message || t("users.updateError"));
      setTimeout(() => setError(""), 3000);
    }
    setActionLoading(null);
  };

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
      showSuccessMessage(t("users.kycUpdated"));
      setShowKYCModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || t("users.kycUpdateError"));
      setTimeout(() => setError(""), 3000);
    }
    setActionLoading(null);
  };

  const deleteUser = async (user_id) => {
    if (!window.confirm(t("users.deleteConfirm"))) return;
    setActionLoading(user_id + "-delete");
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_BASE}/api/admin/user/${user_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers();
      showSuccessMessage(t("users.userDeleted"));
    } catch (err) {
      setError(err.message || t("users.deleteError"));
      setTimeout(() => setError(""), 3000);
    }
    setActionLoading(null);
  };

  const loginAsUser = async (user) => {
    setActionLoading(user.id + "-login");
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE}/api/admin/impersonate/${user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to login as user");
      localStorage.setItem("impersonateToken", data.userToken);
      localStorage.setItem("impersonatedUserId", user.id);
      localStorage.setItem("impersonatedUserEmail", user.email);
      window.open(`${USER_FRONTEND_URL}/login?impersonate=true&token=${data.userToken}`, "_blank");
      showSuccessMessage(t("users.loginSuccess", { email: user.email }));
    } catch (err) {
      setError(err.message || t("users.loginError"));
      setTimeout(() => setError(""), 3000);
    }
    setActionLoading(null);
  };

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  // Sorting and filtering
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(user => 
        String(user.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Status filter (WIN/LOSE)
    if (filterStatus !== "all") {
      result = result.filter(user => {
        if (filterStatus === "win") return userWinModes[user.id] === "WIN";
        if (filterStatus === "lose") return userWinModes[user.id] === "LOSE";
        if (filterStatus === "default") return !userWinModes[user.id];
        return true;
      });
    }
    
    // KYC filter
    if (filterKYC !== "all") {
      result = result.filter(user => user.kyc_status === filterKYC);
    }
    
    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "created_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (sortDirection === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    
    return result;
  }, [users, searchTerm, filterStatus, filterKYC, sortField, sortDirection, userWinModes]);

  useEffect(() => {
    fetchUsers();
    fetchWinModes();
  }, []);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={14} className="opacity-30" />;
    return sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0d16] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#ffd700]/20 to-[#16d79c]/20">
              <Users className="w-8 h-8 text-[#ffd700]" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#ffd700] via-[#f0b90b] to-[#16d79c] bg-clip-text text-transparent">
                {t("users.title")}
              </h1>
              <p className="text-gray-400 mt-1">{t("users.subtitle")}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-[#ffd700]/10">
              <div className="flex items-center justify-between">
                <Users size={20} className="text-[#ffd700]" />
                <span className="text-xs text-gray-500">{t("users.total")}</span>
              </div>
              <div className="text-2xl font-bold text-white mt-2">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-yellow-500/10">
              <div className="flex items-center justify-between">
                <Clock size={20} className="text-yellow-500" />
                <span className="text-xs text-gray-500">{t("users.pendingKYC")}</span>
              </div>
              <div className="text-2xl font-bold text-yellow-500 mt-2">{stats.pendingKYC}</div>
            </div>
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-green-500/10">
              <div className="flex items-center justify-between">
                <BadgeCheck size={20} className="text-green-500" />
                <span className="text-xs text-gray-500">{t("users.approvedKYC")}</span>
              </div>
              <div className="text-2xl font-bold text-green-500 mt-2">{stats.approvedKYC}</div>
            </div>
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-emerald-500/10">
              <div className="flex items-center justify-between">
                <Activity size={20} className="text-emerald-500" />
                <span className="text-xs text-gray-500">{t("users.winMode")}</span>
              </div>
              <div className="text-2xl font-bold text-emerald-500 mt-2">{stats.winUsers}</div>
            </div>
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-red-500/10">
              <div className="flex items-center justify-between">
                <AlertCircle size={20} className="text-red-500" />
                <span className="text-xs text-gray-500">{t("users.loseMode")}</span>
              </div>
              <div className="text-2xl font-bold text-red-500 mt-2">{stats.loseUsers}</div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Filters Bar */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("users.searchPlaceholder")}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1e2434] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] transition-all"
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 bg-[#1e2434] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#ffd700]"
                >
                  <option value="all">{t("users.allModes")}</option>
                  <option value="win">🏆 {t("users.winMode")}</option>
                  <option value="lose">💀 {t("users.loseMode")}</option>
                  <option value="default">⚖️ {t("users.defaultMode")}</option>
                </select>
                
                <select
                  value={filterKYC}
                  onChange={e => setFilterKYC(e.target.value)}
                  className="px-4 py-2.5 bg-[#1e2434] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#ffd700]"
                >
                  <option value="all">{t("users.allKYC")}</option>
                  <option value="pending">⏳ {t("kyc.pending")}</option>
                  <option value="approved">✅ {t("kyc.approved")}</option>
                  <option value="rejected">❌ {t("kyc.rejected")}</option>
                </select>

                <button
                  onClick={() => { setSearchTerm(""); setFilterStatus("all"); setFilterKYC("all"); }}
                  className="px-4 py-2.5 bg-[#1e2434] border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-all"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300">
              <div className="flex items-center gap-2"><AlertCircle size={18} />{error}</div>
            </div>
          )}
          {success && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-green-500/20 border border-green-500/50 text-green-300">
              <div className="flex items-center gap-2"><CheckCircle size={18} />{success}</div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#ffd700] mb-3" size={40} />
              <span className="text-gray-400">{t("common.loading")}</span>
            </div>
          ) : (
            <>
              {/* Top Scrollbar */}
              <div ref={topScrollRef} className="overflow-x-auto px-6" style={{ height: 10 }}>
                <div style={{ minWidth: "1400px", height: 1 }} />
              </div>

              {/* Table */}
              <div ref={tableScrollRef} className="overflow-x-auto px-6 pb-6">
                <table className="min-w-[1400px]">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-3 text-gray-400 font-semibold text-sm cursor-pointer hover:text-[#ffd700] transition" onClick={() => toggleSort("id")}>
                        <div className="flex items-center gap-1">{t("users.userId")}<SortIcon field="id" /></div>
                      </th>
                      <th className="text-left py-3 px-3 text-gray-400 font-semibold text-sm cursor-pointer hover:text-[#ffd700] transition" onClick={() => toggleSort("email")}>
                        <div className="flex items-center gap-1">{t("users.email")}<SortIcon field="email" /></div>
                      </th>
                      <th className="text-center py-3 px-3 text-gray-400 font-semibold text-sm">{t("users.loginAs")}</th>
                      <th className="text-center py-3 px-3 text-gray-400 font-semibold text-sm">{t("users.selfie")}</th>
                      <th className="text-center py-3 px-3 text-gray-400 font-semibold text-sm">{t("users.idCard")}</th>
                      <th className="text-center py-3 px-3 text-gray-400 font-semibold text-sm">{t("users.kycStatus")}</th>
                      <th className="text-left py-3 px-3 text-gray-400 font-semibold text-sm cursor-pointer hover:text-[#ffd700] transition" onClick={() => toggleSort("created_at")}>
                        <div className="flex items-center gap-1">{t("users.signUpDate")}<SortIcon field="created_at" /></div>
                      </th>
                      <th className="text-center py-3 px-3 text-gray-400 font-semibold text-sm">{t("users.currentMode")}</th>
                      <th className="text-center py-3 px-3 text-gray-400 font-semibold text-sm">{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-gray-400">{t("users.noUsers")}</td>
                      </tr>
                    ) : (
                      filteredAndSortedUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-all group">
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-[#ffd700]">#{user.id}</span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="text-white font-medium">{user.email}</span>
                              {user.username && <span className="text-xs text-gray-500">@{user.username}</span>}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => loginAsUser(user)}
                              disabled={actionLoading === user.id + "-login"}
                              className="px-4 py-1.5 bg-gradient-to-r from-[#16d79c] to-[#ffd700] rounded-lg text-xs font-bold text-[#181b25] shadow hover:shadow-lg transition-all flex items-center gap-1 hover:scale-105 mx-auto"
                            >
                              {actionLoading === user.id + "-login" ? <Loader2 className="animate-spin" size={12} /> : <LogIn size={12} />}
                              {actionLoading === user.id + "-login" ? "" : t("users.loginAs")}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {user.kyc_selfie ? (
                              <img
                                src={resolveKYCUrl(user.kyc_selfie)}
                                alt="Selfie"
                                className="w-12 h-12 rounded-lg object-cover border-2 border-[#16d79c] mx-auto cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => window.open(resolveKYCUrl(user.kyc_selfie), "_blank")}
                                onError={e => e.target.style.display = "none"}
                              />
                            ) : (
                              <span className="text-gray-500 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {user.kyc_id_card ? (
                              <img
                                src={resolveKYCUrl(user.kyc_id_card)}
                                alt="ID Card"
                                className="w-12 h-12 rounded-lg object-cover border-2 border-[#ffd700] mx-auto cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => window.open(resolveKYCUrl(user.kyc_id_card), "_blank")}
                                onError={e => e.target.style.display = "none"}
                              />
                            ) : (
                              <span className="text-gray-500 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {user.kyc_status === "approved" && (
                                <span className="badge badge-success flex items-center gap-1"><BadgeCheck size={12} />{t("kyc.approved")}</span>
                              )}
                              {user.kyc_status === "rejected" && (
                                <span className="badge badge-danger flex items-center gap-1"><XCircle size={12} />{t("kyc.rejected")}</span>
                              )}
                              {user.kyc_status === "pending" && (
                                <>
                                  <span className="badge badge-warning flex items-center gap-1"><Clock size={12} />{t("kyc.pending")}</span>
                                  {user.kyc_selfie && user.kyc_id_card && (
                                    <div className="flex gap-1 mt-1">
                                      <button
                                        onClick={() => handleKYCStatus(user.id, "approved")}
                                        disabled={actionLoading === user.id + "-kyc"}
                                        className="px-2 py-0.5 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30 transition"
                                      >
                                        {t("kyc.approve")}
                                      </button>
                                      <button
                                        onClick={() => handleKYCStatus(user.id, "rejected")}
                                        disabled={actionLoading === user.id + "-kyc"}
                                        className="px-2 py-0.5 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/30 transition"
                                      >
                                        {t("kyc.reject")}
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="text-white text-sm">{formatDate(user.created_at)}</span>
                              <span className="text-xs text-gray-500">{getRelativeTime(user.created_at)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => setUserWinMode(user.id, userWinModes[user.id] === "WIN" ? null : "WIN")}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                  userWinModes[user.id] === "WIN"
                                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
                                    : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                                }`}
                                disabled={actionLoading === user.id + "-winmode"}
                              >
                                {actionLoading === user.id + "-winmode" && userWinModes[user.id] !== "WIN" ? <Loader2 className="animate-spin" size={10} /> : <Activity size={10} />}
                                {t("users.win")}
                              </button>
                              <button
                                onClick={() => setUserWinMode(user.id, userWinModes[user.id] === "LOSE" ? null : "LOSE")}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                  userWinModes[user.id] === "LOSE"
                                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                                    : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                }`}
                                disabled={actionLoading === user.id + "-winmode"}
                              >
                                {actionLoading === user.id + "-winmode" && userWinModes[user.id] !== "LOSE" ? <Loader2 className="animate-spin" size={10} /> : <AlertCircle size={10} />}
                                {t("users.lose")}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => deleteUser(user.id)}
                              disabled={actionLoading === user.id + "-delete"}
                              className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                            >
                              {actionLoading === user.id + "-delete" ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}