// src/components/AdminWithdrawals.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Loader2, CheckCircle2, XCircle, BadgeCheck, ArrowUpRight, Filter, 
  TrendingUp, Search, Clock, User, CreditCard, MapPin, Calendar,
  DollarSign, AlertCircle, RefreshCw, ChevronDown, ChevronUp,
  ExternalLink, Copy, Check, Wallet, Send
} from "lucide-react";
import { API_BASE } from "../config";

export default function AdminWithdrawals() {
  const { t } = useTranslation();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("withdrawals.fetchError"));
      setWithdrawals(data);
    } catch (err) {
      setError(err.message || t("withdrawals.networkError"));
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
        ? `${API_BASE}/api/admin/withdrawals/${id}/approve`
        : `${API_BASE}/api/admin/withdrawals/${id}/deny`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t(`withdrawals.${action}Error`));
      
      setSuccess(t(`withdrawals.${action}Success`));
      setTimeout(() => setSuccess(""), 3000);
      fetchWithdrawals();
    } catch (err) {
      setError(err.message || t("withdrawals.networkError"));
      setTimeout(() => setError(""), 3000);
    }
    setActionLoading(null);
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(id);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      setError(t("withdrawals.copyError"));
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case "approved":
        return { 
          icon: <CheckCircle2 size={14} />, 
          text: t("withdrawals.approved"), 
          className: "bg-green-500/20 text-green-400 border-green-500/30",
          gradient: "from-green-600 to-emerald-600",
          bgClass: "bg-green-500/10"
        };
      case "pending":
        return { 
          icon: <Clock size={14} className="animate-pulse" />, 
          text: t("withdrawals.pending"), 
          className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          gradient: "from-yellow-600 to-amber-600",
          bgClass: "bg-yellow-500/10"
        };
      case "rejected":
        return { 
          icon: <XCircle size={14} />, 
          text: t("withdrawals.rejected"), 
          className: "bg-red-500/20 text-red-400 border-red-500/30",
          gradient: "from-red-600 to-rose-600",
          bgClass: "bg-red-500/10"
        };
      case "completed":
        return { 
          icon: <BadgeCheck size={14} />, 
          text: t("withdrawals.completed"), 
          className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          gradient: "from-blue-600 to-cyan-600",
          bgClass: "bg-blue-500/10"
        };
      default:
        return { 
          icon: null, 
          text: status || t("common.na"), 
          className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          gradient: "from-gray-600 to-slate-600",
          bgClass: "bg-gray-500/10"
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

  const truncateAddress = (address) => {
    if (!address) return "N/A";
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  // Filtering and sorting logic
  const filteredAndSortedWithdrawals = useMemo(() => {
    let result = [...withdrawals];

    // Status filter
    if (filter !== "all") {
      result = result.filter(w => w.status === filter);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(w => 
        String(w.id).toLowerCase().includes(searchLower) ||
        String(w.user_id).toLowerCase().includes(searchLower) ||
        (w.address && w.address.toLowerCase().includes(searchLower)) ||
        (w.coin && w.coin.toLowerCase().includes(searchLower))
      );
    }

    // Date range filter
    if (dateRange.start) {
      result = result.filter(w => new Date(w.created_at) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      result = result.filter(w => new Date(w.created_at) <= new Date(dateRange.end));
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
  }, [withdrawals, filter, searchTerm, sortField, sortDirection, dateRange]);

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === "pending").length,
    approved: withdrawals.filter(w => w.status === "approved").length,
    completed: withdrawals.filter(w => w.status === "completed").length,
    rejected: withdrawals.filter(w => w.status === "rejected").length,
    totalAmount: withdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0),
    pendingAmount: withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0),
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

  const openDetailsModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0d16] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#ffd700]/20 to-[#16d79c]/20">
              <Send className="w-8 h-8 text-[#ffd700]" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#ffd700] via-[#f0b90b] to-[#16d79c] bg-clip-text text-transparent">
                {t("withdrawals.title")}
              </h1>
              <p className="text-gray-400 mt-1">{t("withdrawals.subtitle")}</p>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-[#ffd700]/10">
              <div className="flex items-center justify-between">
                <ArrowUpRight size={20} className="text-[#ffd700]" />
                <span className="text-xs text-gray-500">{t("withdrawals.total")}</span>
              </div>
              <div className="text-2xl font-bold text-white mt-2">{stats.total}</div>
              <div className="text-xs text-gray-500 mt-1">Total Requests</div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-yellow-500/10">
              <div className="flex items-center justify-between">
                <Clock size={20} className="text-yellow-500" />
                <span className="text-xs text-gray-500">{t("withdrawals.pending")}</span>
              </div>
              <div className="text-2xl font-bold text-yellow-500 mt-2">{stats.pending}</div>
              <div className="text-xs text-gray-500 mt-1">Awaiting Review</div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-green-500/10">
              <div className="flex items-center justify-between">
                <CheckCircle2 size={20} className="text-green-500" />
                <span className="text-xs text-gray-500">{t("withdrawals.approved")}</span>
              </div>
              <div className="text-2xl font-bold text-green-500 mt-2">{stats.approved}</div>
              <div className="text-xs text-gray-500 mt-1">Ready to Process</div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-blue-500/10">
              <div className="flex items-center justify-between">
                <BadgeCheck size={20} className="text-blue-500" />
                <span className="text-xs text-gray-500">{t("withdrawals.completed")}</span>
              </div>
              <div className="text-2xl font-bold text-blue-500 mt-2">{stats.completed}</div>
              <div className="text-xs text-gray-500 mt-1">Completed</div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-red-500/10">
              <div className="flex items-center justify-between">
                <XCircle size={20} className="text-red-500" />
                <span className="text-xs text-gray-500">{t("withdrawals.rejected")}</span>
              </div>
              <div className="text-2xl font-bold text-red-500 mt-2">{stats.rejected}</div>
              <div className="text-xs text-gray-500 mt-1">Rejected</div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-[#ffd700]/10">
              <div className="flex items-center justify-between">
                <DollarSign size={20} className="text-[#ffd700]" />
                <span className="text-xs text-gray-500">Total Volume</span>
              </div>
              <div className="text-lg font-bold text-white mt-2">${stats.totalAmount.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">All Requests</div>
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
                { value: "all", label: t("withdrawals.filters.all"), icon: <Send size={14} /> },
                { value: "pending", label: t("withdrawals.filters.pending"), icon: <Clock size={14} /> },
                { value: "approved", label: t("withdrawals.filters.approved"), icon: <CheckCircle2 size={14} /> },
                { value: "completed", label: t("withdrawals.filters.completed"), icon: <BadgeCheck size={14} /> },
                { value: "rejected", label: t("withdrawals.filters.rejected"), icon: <XCircle size={14} /> }
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
                      {tab.value === "pending" ? stats.pending : 
                       tab.value === "approved" ? stats.approved :
                       tab.value === "completed" ? stats.completed : stats.rejected}
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
                  placeholder={t("withdrawals.searchPlaceholder")}
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
                        <div className="flex items-center gap-1">{t("withdrawals.userId")} <SortIcon field="user_id" /></div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm cursor-pointer hover:text-[#ffd700] transition" onClick={() => toggleSort("coin")}>
                        <div className="flex items-center gap-1">{t("withdrawals.coin")} <SortIcon field="coin" /></div>
                      </th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm cursor-pointer hover:text-[#ffd700] transition" onClick={() => toggleSort("amount")}>
                        <div className="flex items-center justify-end gap-1">{t("withdrawals.amount")} <SortIcon field="amount" /></div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">{t("withdrawals.toAddress")}</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm cursor-pointer hover:text-[#ffd700] transition" onClick={() => toggleSort("created_at")}>
                        <div className="flex items-center gap-1">{t("withdrawals.date")} <SortIcon field="created_at" /></div>
                      </th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-sm">{t("withdrawals.status")}</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-sm">{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12">
                          <Send size={48} className="mx-auto text-gray-500 mb-3" />
                          <p className="text-gray-400">{t("withdrawals.noWithdrawals")}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedWithdrawals.map((withdrawal) => {
                        const statusConfig = getStatusConfig(withdrawal.status);
                        
                        return (
                          <tr key={withdrawal.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-all group">
                            <td className="py-3 px-4">
                              <span className="font-mono text-[#ffd700] font-bold">#{withdrawal.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-gray-500" />
                                <span className="font-medium text-white">#{withdrawal.user_id}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <CreditCard size={14} className="text-[#ffd700]" />
                                <span className="font-bold text-white">{withdrawal.coin || "USDT"}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-bold text-[#ffd700] text-lg">
                                {parseFloat(withdrawal.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 group/address">
                                <MapPin size={12} className="text-gray-500 flex-shrink-0" />
                                <span 
                                  className="text-xs font-mono text-gray-300 cursor-pointer hover:text-[#ffd700] transition truncate max-w-[150px]"
                                  onClick={() => openDetailsModal(withdrawal)}
                                  title={withdrawal.address}
                                >
                                  {truncateAddress(withdrawal.address)}
                                </span>
                                {withdrawal.address && (
                                  <button
                                    onClick={() => copyToClipboard(withdrawal.address, withdrawal.id)}
                                    className="opacity-0 group-hover/address:opacity-100 transition p-1 rounded hover:bg-white/10"
                                  >
                                    {copiedAddress === withdrawal.id ? (
                                      <Check size={12} className="text-green-400" />
                                    ) : (
                                      <Copy size={12} className="text-gray-400 hover:text-white" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="text-white text-sm">{formatDate(withdrawal.created_at)}</span>
                                <span className="text-xs text-gray-500">{new Date(withdrawal.created_at).toLocaleTimeString()}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.className}`}>
                                {statusConfig.icon}
                                {statusConfig.text}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {withdrawal.status === "pending" ? (
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleAction(withdrawal.id, "approve")}
                                    disabled={!!actionLoading}
                                    className="px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow hover:shadow-lg transition-all flex items-center gap-1 text-xs disabled:opacity-50 hover:scale-105"
                                  >
                                    {actionLoading === withdrawal.id + "approve" ? (
                                      <Loader2 className="animate-spin" size={12} />
                                    ) : (
                                      <CheckCircle2 size={12} />
                                    )}
                                    {t("withdrawals.approve")}
                                  </button>
                                  <button
                                    onClick={() => handleAction(withdrawal.id, "deny")}
                                    disabled={!!actionLoading}
                                    className="px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow hover:shadow-lg transition-all flex items-center gap-1 text-xs disabled:opacity-50 hover:scale-105"
                                  >
                                    {actionLoading === withdrawal.id + "deny" ? (
                                      <Loader2 className="animate-spin" size={12} />
                                    ) : (
                                      <XCircle size={12} />
                                    )}
                                    {t("withdrawals.deny")}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => openDetailsModal(withdrawal)}
                                  className="text-gray-500 hover:text-[#ffd700] transition"
                                >
                                  <ExternalLink size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              {filteredAndSortedWithdrawals.length > 0 && (
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <div className="flex gap-4">
                      <span>Showing {filteredAndSortedWithdrawals.length} of {withdrawals.length} withdrawals</span>
                      {filter !== "all" && (
                        <span className="text-[#ffd700]">
                          Pending amount: ${stats.pendingAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={fetchWithdrawals}
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

      {/* Details Modal */}
      {showDetailsModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-2xl max-w-lg w-full border border-[#ffd700]/20" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-[#1a1f2e] to-[#131724] p-4 border-b border-[#ffd700]/20 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#ffd700] flex items-center gap-2">
                <Send size={20} />
                {t("withdrawals.withdrawalDetails")} #{selectedWithdrawal.id}
              </h3>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 rounded-lg hover:bg-white/10 transition">
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">User ID</label>
                  <p className="text-white font-mono text-lg">#{selectedWithdrawal.user_id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <p className="inline-flex items-center gap-1 mt-1">
                    {getStatusConfig(selectedWithdrawal.status).icon}
                    <span className={getStatusConfig(selectedWithdrawal.status).className}>
                      {getStatusConfig(selectedWithdrawal.status).text}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Amount</label>
                  <p className="text-[#ffd700] font-bold text-2xl">
                    {selectedWithdrawal.amount} {selectedWithdrawal.coin || "USDT"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Date</label>
                  <p className="text-white">{new Date(selectedWithdrawal.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 block mb-2">Withdrawal Address</label>
                <div className="bg-[#1e2434] p-3 rounded-xl">
                  <p className="text-sm text-gray-300 break-all font-mono">{selectedWithdrawal.address}</p>
                  <button
                    onClick={() => copyToClipboard(selectedWithdrawal.address, "modal")}
                    className="mt-2 text-xs text-[#ffd700] hover:text-[#16d79c] transition flex items-center gap-1"
                  >
                    <Copy size={12} />
                    Copy Address
                  </button>
                </div>
              </div>

              {selectedWithdrawal.tx_hash && (
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Transaction Hash</label>
                  <div className="bg-[#1e2434] p-3 rounded-xl">
                    <p className="text-sm text-gray-300 break-all font-mono">{selectedWithdrawal.tx_hash}</p>
                  </div>
                </div>
              )}

              {selectedWithdrawal.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleAction(selectedWithdrawal.id, "approve");
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    {t("withdrawals.approve")}
                  </button>
                  <button
                    onClick={() => {
                      handleAction(selectedWithdrawal.id, "deny");
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    {t("withdrawals.deny")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}