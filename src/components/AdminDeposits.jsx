// src/components/AdminDeposits.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  CheckCircle2, XCircle, Loader2, Image, Wallet, 
  Search, Filter, Calendar, TrendingUp, Clock, Eye,
  ExternalLink, AlertCircle, ChevronDown, ChevronUp,
  Download, RefreshCw, FileText, User, CreditCard
} from "lucide-react";
import { API_BASE } from "../config";

const SUPABASE_PUBLIC_URL = "https://obrfnkggcfgfspyqgtws.supabase.co/storage/v1/object/public/deposit";

export default function AdminDeposits() {
  const { t } = useTranslation();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/deposits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("deposits.fetchError"));
      setDeposits(data);
    } catch (err) {
      setError(err.message || t("deposits.networkError"));
      setTimeout(() => setError(""), 5000);
    }
    setLoading(false);
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const url = action === "approve"
        ? `${API_BASE}/api/admin/deposits/${id}/approve`
        : `${API_BASE}/api/admin/deposits/${id}/deny`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t(`deposits.${action}Error`));
      
      setSuccess(t(`deposits.${action}Success`));
      setTimeout(() => setSuccess(""), 3000);
      fetchDeposits();
    } catch (err) {
      setError(err.message || t("deposits.networkError"));
      setTimeout(() => setError(""), 3000);
    }
    setActionLoading(null);
  };

  const getScreenshotUrl = (screenshot) => {
    if (!screenshot) return null;
    if (screenshot.startsWith("web3-tx-")) {
      return { type: "web3", hash: screenshot.replace("web3-tx-", "") };
    }
    if (!screenshot.includes('/')) {
      return { type: "image", url: `${SUPABASE_PUBLIC_URL}/${encodeURIComponent(screenshot)}` };
    }
    if (screenshot.startsWith("/uploads/")) {
      return { type: "image", url: `${API_BASE}${screenshot}` };
    }
    if (screenshot.startsWith("http")) {
      return { type: "image", url: screenshot };
    }
    const pathParts = screenshot.split('/');
    const fileName = encodeURIComponent(pathParts.pop());
    return { type: "image", url: `${SUPABASE_PUBLIC_URL}/${pathParts.join('/')}/${fileName}` };
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case "approved":
        return { 
          icon: <CheckCircle2 size={14} />, 
          text: t("deposits.approved"), 
          className: "bg-green-500/20 text-green-400 border-green-500/30",
          gradient: "from-green-600 to-emerald-600"
        };
      case "pending":
        return { 
          icon: <Clock size={14} className="animate-pulse" />, 
          text: t("deposits.pending"), 
          className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          gradient: "from-yellow-600 to-amber-600"
        };
      case "denied":
      case "rejected":
        return { 
          icon: <XCircle size={14} />, 
          text: t("deposits.denied"), 
          className: "bg-red-500/20 text-red-400 border-red-500/30",
          gradient: "from-red-600 to-rose-600"
        };
      default:
        return { 
          icon: null, 
          text: status, 
          className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          gradient: "from-gray-600 to-slate-600"
        };
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filtering and sorting logic
  const filteredAndSortedDeposits = useMemo(() => {
    let result = [...deposits];

    // Status filter
    if (filter !== "all") {
      result = result.filter(d => {
        if (filter === "pending") return d.status === "pending";
        if (filter === "approved") return d.status === "approved";
        if (filter === "denied") return d.status === "denied" || d.status === "rejected";
        return true;
      });
    }

    // Search filter
    if (searchTerm) {
      result = result.filter(d => 
        String(d.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(d.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.coin && d.coin.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Date range filter
    if (dateRange.start) {
      result = result.filter(d => new Date(d.created_at) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      result = result.filter(d => new Date(d.created_at) <= new Date(dateRange.end));
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "created_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (sortField === "amount") {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }
      if (sortDirection === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [deposits, filter, searchTerm, sortField, sortDirection, dateRange]);

  const stats = {
    total: deposits.length,
    pending: deposits.filter(d => d.status === "pending").length,
    approved: deposits.filter(d => d.status === "approved").length,
    denied: deposits.filter(d => d.status === "denied" || d.status === "rejected").length,
    totalAmount: deposits.reduce((sum, d) => sum + (d.status === "approved" ? parseFloat(d.amount) : 0), 0)
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={12} className="opacity-30" />;
    return sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const openSlipModal = (deposit) => {
    setSelectedDeposit(deposit);
    setShowSlipModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0d16] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#ffd700]/20 to-[#16d79c]/20">
              <Wallet className="w-8 h-8 text-[#ffd700]" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#ffd700] via-[#f0b90b] to-[#16d79c] bg-clip-text text-transparent">
                {t("deposits.title")}
              </h1>
              <p className="text-gray-400 mt-1">{t("deposits.subtitle")}</p>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-[#ffd700]/10">
              <div className="flex items-center justify-between">
                <Wallet size={20} className="text-[#ffd700]" />
                <span className="text-xs text-gray-500">{t("deposits.total")}</span>
              </div>
              <div className="text-2xl font-bold text-white mt-2">{stats.total}</div>
              <div className="text-xs text-gray-500 mt-1">Total Requests</div>
            </div>
            
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-yellow-500/10">
              <div className="flex items-center justify-between">
                <Clock size={20} className="text-yellow-500" />
                <span className="text-xs text-gray-500">{t("deposits.pending")}</span>
              </div>
              <div className="text-2xl font-bold text-yellow-500 mt-2">{stats.pending}</div>
              <div className="text-xs text-gray-500 mt-1">Awaiting Review</div>
            </div>
            
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-green-500/10">
              <div className="flex items-center justify-between">
                <CheckCircle2 size={20} className="text-green-500" />
                <span className="text-xs text-gray-500">{t("deposits.approved")}</span>
              </div>
              <div className="text-2xl font-bold text-green-500 mt-2">{stats.approved}</div>
              <div className="text-xs text-gray-500 mt-1">Completed</div>
            </div>
            
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-red-500/10">
              <div className="flex items-center justify-between">
                <XCircle size={20} className="text-red-500" />
                <span className="text-xs text-gray-500">{t("deposits.denied")}</span>
              </div>
              <div className="text-2xl font-bold text-red-500 mt-2">{stats.denied}</div>
              <div className="text-xs text-gray-500 mt-1">Rejected</div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-[#ffd700]/10">
              <div className="flex items-center justify-between">
                <TrendingUp size={20} className="text-[#ffd700]" />
                <span className="text-xs text-gray-500">Total Volume</span>
              </div>
              <div className="text-xl font-bold text-white mt-2">${stats.totalAmount.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Approved Only</div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Filters Bar */}
          <div className="p-6 border-b border-white/10">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { value: "all", label: t("deposits.filters.all"), icon: <Wallet size={14} /> },
                { value: "pending", label: t("deposits.filters.pending"), icon: <Clock size={14} /> },
                { value: "approved", label: t("deposits.filters.approved"), icon: <CheckCircle2 size={14} /> },
                { value: "denied", label: t("deposits.filters.denied"), icon: <XCircle size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    filter === tab.value
                      ? "bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#181b25] shadow-lg scale-105"
                      : "bg-[#1e2434] text-gray-400 hover:text-white hover:bg-[#252b3d] border border-gray-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.value !== "all" && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      filter === tab.value ? "bg-white/20" : "bg-gray-700"
                    }`}>
                      {tab.value === "pending" ? stats.pending : tab.value === "approved" ? stats.approved : stats.denied}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search and Date Range */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("deposits.searchPlaceholder")}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1e2434] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] transition-all"
                />
              </div>
              
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2.5 bg-[#1e2434] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#ffd700]"
                />
                <span className="text-gray-500 self-center">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2.5 bg-[#1e2434] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#ffd700]"
                />
                <button
                  onClick={() => { setSearchTerm(""); setDateRange({ start: "", end: "" }); }}
                  className="px-4 py-2.5 bg-[#1e2434] border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-all"
                  title={t("common.reset")}
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/50">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle size={18} />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-green-500/20 border border-green-500/50">
              <div className="flex items-center gap-2 text-green-300">
                <CheckCircle2 size={18} />
                <span className="font-medium">{success}</span>
              </div>
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
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm cursor-pointer hover:text-[#ffd700] transition" onClick={() => toggleSort("id")}>
                        <div className="flex items-center gap-1">ID <SortIcon field="id" /></div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm cursor-pointer hover:text-[#ffd700] transition" onClick={() => toggleSort("user_id")}>
                        <div className="flex items-center gap-1">{t("deposits.user")} <SortIcon field="user_id" /></div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm cursor-pointer hover:text-[#ffd700] transition" onClick={() => toggleSort("coin")}>
                        <div className="flex items-center gap-1">{t("deposits.coin")} <SortIcon field="coin" /></div>
                      </th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm cursor-pointer hover:text-[#ffd700] transition" onClick={() => toggleSort("amount")}>
                        <div className="flex items-center justify-end gap-1">{t("deposits.amount")} <SortIcon field="amount" /></div>
                      </th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-sm">{t("deposits.status")}</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm cursor-pointer hover:text-[#ffd700] transition" onClick={() => toggleSort("created_at")}>
                        <div className="flex items-center gap-1">{t("deposits.time")} <SortIcon field="created_at" /></div>
                      </th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-sm">{t("deposits.slip")}</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-sm">{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedDeposits.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12">
                          <Wallet size={48} className="mx-auto text-gray-500 mb-3" />
                          <p className="text-gray-400">{t("deposits.noDeposits")}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedDeposits.map((deposit) => {
                        const statusConfig = getStatusConfig(deposit.status);
                        const screenshotData = getScreenshotUrl(deposit.screenshot);
                        
                        return (
                          <tr key={deposit.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-all group">
                            <td className="py-3 px-4">
                              <span className="font-mono text-[#ffd700] font-bold">#{deposit.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-gray-500" />
                                <span className="font-medium text-white">#{deposit.user_id}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <CreditCard size={14} className="text-[#ffd700]" />
                                <span className="font-bold text-white">{deposit.coin || "USDT"}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-bold text-[#ffd700] text-lg">
                                {parseFloat(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.className}`}>
                                {statusConfig.icon}
                                {statusConfig.text}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="text-white text-sm">{formatDate(deposit.created_at)}</span>
                                <span className="text-xs text-gray-500">{new Date(deposit.created_at).toLocaleTimeString()}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {screenshotData ? (
                                screenshotData.type === "web3" ? (
                                  <button
                                    onClick={() => openSlipModal(deposit)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                                  >
                                    <FileText size={12} />
                                    TX Hash
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openSlipModal(deposit)}
                                    className="relative group"
                                  >
                                    <img
                                      src={screenshotData.url}
                                      alt="Deposit Slip"
                                      className="w-12 h-12 rounded-lg object-cover border-2 border-[#ffd700]/30 group-hover:border-[#ffd700] group-hover:scale-110 transition-all cursor-pointer"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/48?text=No+Image";
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Eye size={16} className="text-white" />
                                    </div>
                                  </button>
                                )
                              ) : (
                                <span className="text-gray-500 text-sm">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {deposit.status === "pending" ? (
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleAction(deposit.id, "approve")}
                                    disabled={!!actionLoading}
                                    className="px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow hover:shadow-lg transition-all flex items-center gap-1 text-xs disabled:opacity-50"
                                  >
                                    {actionLoading === deposit.id + "approve" ? (
                                      <Loader2 className="animate-spin" size={12} />
                                    ) : (
                                      <CheckCircle2 size={12} />
                                    )}
                                    {t("deposits.approve")}
                                  </button>
                                  <button
                                    onClick={() => handleAction(deposit.id, "deny")}
                                    disabled={!!actionLoading}
                                    className="px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow hover:shadow-lg transition-all flex items-center gap-1 text-xs disabled:opacity-50"
                                  >
                                    {actionLoading === deposit.id + "deny" ? (
                                      <Loader2 className="animate-spin" size={12} />
                                    ) : (
                                      <XCircle size={12} />
                                    )}
                                    {t("deposits.deny")}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-600 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer with pagination info */}
              {filteredAndSortedDeposits.length > 0 && (
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Showing {filteredAndSortedDeposits.length} of {deposits.length} deposits</span>
                    <button
                      onClick={fetchDeposits}
                      className="flex items-center gap-1 text-[#ffd700] hover:text-[#16d79c] transition"
                    >
                      <RefreshCw size={14} />
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Slip Modal */}
      {showSlipModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setShowSlipModal(false)}>
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-[#ffd700]/20" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-[#1a1f2e] to-[#131724] p-4 border-b border-[#ffd700]/20 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#ffd700] flex items-center gap-2">
                <FileText size={20} />
                {t("deposits.depositDetails")} #{selectedDeposit.id}
              </h3>
              <button onClick={() => setShowSlipModal(false)} className="p-1 rounded-lg hover:bg-white/10 transition">
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">User ID</label>
                  <p className="text-white font-mono">#{selectedDeposit.user_id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Amount</label>
                  <p className="text-[#ffd700] font-bold text-xl">{selectedDeposit.amount} {selectedDeposit.coin || "USDT"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <p className="inline-flex items-center gap-1 mt-1">{getStatusConfig(selectedDeposit.status).icon} {getStatusConfig(selectedDeposit.status).text}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Date</label>
                  <p className="text-white">{new Date(selectedDeposit.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 block mb-2">Deposit Slip / Proof</label>
                {(() => {
                  const data = getScreenshotUrl(selectedDeposit.screenshot);
                  if (!data) return <p className="text-gray-400">No proof uploaded</p>;
                  if (data.type === "web3") {
                    return (
                      <div className="bg-[#1e2434] p-4 rounded-xl">
                        <p className="text-sm text-gray-300 break-all">
                          <span className="text-[#ffd700]">Transaction Hash:</span><br />
                          {data.hash}
                        </p>
                        <button
                          onClick={() => navigator.clipboard.writeText(data.hash)}
                          className="mt-2 text-xs text-[#ffd700] hover:text-[#16d79c]"
                        >
                          Copy Hash
                        </button>
                      </div>
                    );
                  }
                  return (
                    <img
                      src={data.url}
                      alt="Deposit Slip"
                      className="rounded-xl max-w-full max-h-[500px] mx-auto border-2 border-[#ffd700]/30"
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}