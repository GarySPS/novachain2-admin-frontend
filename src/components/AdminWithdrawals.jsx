//src>components>AdminWithdrawals.jsx

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle2, XCircle, BadgeCheck, ArrowUpRight, Filter, TrendingUp } from "lucide-react";
import { API_BASE } from "../config";

export default function AdminWithdrawals() {
  const { t } = useTranslation();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected, completed
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchWithdrawals();
    // eslint-disable-next-line
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
    }
    setLoading(false);
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const url =
        action === "approve"
          ? `${API_BASE}/api/admin/withdrawals/${id}/approve`
          : `${API_BASE}/api/admin/withdrawals/${id}/deny`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t(`withdrawals.${action}Error`));
      fetchWithdrawals();
    } catch (err) {
      setError(err.message || t("withdrawals.networkError"));
    }
    setActionLoading(null);
  };

  // Filter withdrawals based on status and search term
  const filteredWithdrawals = withdrawals.filter(w => {
    if (filter !== "all" && w.status !== filter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        String(w.id).toLowerCase().includes(searchLower) ||
        String(w.user_id).toLowerCase().includes(searchLower) ||
        w.address?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case "approved":
        return { icon: <CheckCircle2 size={14} />, text: t("withdrawals.approved"), className: "text-green-400 bg-green-500/10 border-green-500/30" };
      case "pending":
        return { icon: <Loader2 size={14} className="animate-spin" />, text: t("withdrawals.pending"), className: "text-yellow-300 bg-yellow-500/10 border-yellow-500/30" };
      case "rejected":
        return { icon: <XCircle size={14} />, text: t("withdrawals.rejected"), className: "text-red-400 bg-red-500/10 border-red-500/30" };
      case "completed":
        return { icon: <BadgeCheck size={14} />, text: t("withdrawals.completed"), className: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
      default:
        return { icon: null, text: status || t("common.na"), className: "text-gray-400 bg-gray-500/10 border-gray-500/30" };
    }
  };

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === "pending").length,
    approved: withdrawals.filter(w => w.status === "approved").length,
    completed: withdrawals.filter(w => w.status === "completed").length,
    rejected: withdrawals.filter(w => w.status === "rejected").length,
    totalAmount: withdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0),
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 px-2 sm:px-6 py-8 rounded-2xl shadow-2xl bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 border border-white/5">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#ffd700]">
          <ArrowUpRight size={24} className="text-[#16d79c]" />
          {t("withdrawals.title")}
        </h2>
        
        {/* Stats Summary */}
        <div className="flex gap-3 flex-wrap">
          <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <span className="text-xs text-purple-400">{t("withdrawals.totalAmount")}</span>
            <p className="font-bold text-purple-300 text-sm">
              {stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <span className="text-xs text-blue-400">{t("withdrawals.total")}</span>
            <p className="font-bold text-blue-300">{stats.total}</p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <span className="text-xs text-yellow-400">{t("withdrawals.pending")}</span>
            <p className="font-bold text-yellow-300">{stats.pending}</p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/30">
            <span className="text-xs text-green-400">{t("withdrawals.approved")}</span>
            <p className="font-bold text-green-300">{stats.approved + stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder={t("withdrawals.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-[#232836] bg-[#191e29] text-white placeholder-gray-400 focus:outline-none focus:border-[#16d79c] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "pending", "approved", "completed", "rejected"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                filter === filterType
                  ? "bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#181b25] shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-1">
                <Filter size={14} />
                {t(`withdrawals.filters.${filterType}`)}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="bg-gradient-to-r from-[#f34e6d]/90 to-[#fbbf24]/80 text-white p-3 rounded-lg mb-4 font-semibold shadow">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-[#FFD700] mr-2" size={30} />
          <span className="text-yellow-200 font-bold">{t("common.loading")}</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <table className="admin-table min-w-[1000px]">
            <thead>
              <tr>
                <th>{t("withdrawals.id")}</th>
                <th>{t("withdrawals.userId")}</th>
                <th>{t("withdrawals.coin")}</th>
                <th>{t("withdrawals.amount")}</th>
                <th>{t("withdrawals.toAddress")}</th>
                <th>{t("withdrawals.date")}</th>
                <th>{t("withdrawals.status")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 font-semibold">
                    {t("withdrawals.noWithdrawals")}
                  </td>
                </tr>
              )}
              {filteredWithdrawals.map((w, idx) => {
                const statusBadge = getStatusBadge(w.status);
                return (
                  <tr key={`withdrawal-${w.id || idx}`}>
                    <td className="font-mono text-sm">{w.id}</td>
                    <td className="font-medium">{w.user_id}</td>
                    <td className="font-bold text-sm">{w.coin || "USDT"}</td>
                    <td>
                      <span className="font-bold text-[#FFD700]">
                        {parseFloat(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono break-all block max-w-[180px] truncate" title={w.address}>
                        {w.address}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-400">
                        {w.created_at?.slice(0, 19).replace('T', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${statusBadge.className}`}>
                        {statusBadge.icon}
                        {statusBadge.text}
                      </span>
                    </td>
                    <td>
                      {w.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(w.id, "approve")}
                            className={`px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#232836] shadow hover:shadow-lg transition-all flex items-center gap-1 text-sm ${
                              actionLoading ? "opacity-60 cursor-wait" : "hover:scale-105"
                            }`}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === w.id + "approve" ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <>
                                <CheckCircle2 size={14} /> {t("withdrawals.approve")}
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleAction(w.id, "deny")}
                            className={`px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#f34e6d] to-[#ffd700] text-[#232836] shadow hover:shadow-lg transition-all flex items-center gap-1 text-sm ${
                              actionLoading ? "opacity-60 cursor-wait" : "hover:scale-105"
                            }`}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === w.id + "deny" ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <>
                                <XCircle size={14} /> {t("withdrawals.deny")}
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-green-400 font-bold text-lg">✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}