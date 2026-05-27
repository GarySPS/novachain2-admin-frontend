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
        return { icon: <CheckCircle2 size={14} />, text: t("withdrawals.approved"), className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
      case "pending":
        return { icon: <Loader2 size={14} className="animate-spin" />, text: t("withdrawals.pending"), className: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case "rejected":
        return { icon: <XCircle size={14} />, text: t("withdrawals.rejected"), className: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
      case "completed":
        return { icon: <BadgeCheck size={14} />, text: t("withdrawals.completed"), className: "text-sky-400 bg-sky-500/10 border-sky-500/20" };
      default:
        return { icon: null, text: status || t("common.na"), className: "text-gray-400 bg-gray-500/10 border-gray-500/20" };
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
    <div className="w-full animate-fade-in">
      {/* Sleek Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <ArrowUpRight size={20} className="text-gray-400" />
          {t("withdrawals.title")}
        </h2>
        
        {/* Flat Stats Cards */}
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] uppercase font-bold text-purple-400">{t("withdrawals.totalAmount")}</span>
            <p className="font-bold text-purple-300 text-sm">
              {stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] uppercase font-bold text-sky-400">{t("withdrawals.total")}</span>
            <p className="font-bold text-sky-300 text-sm">{stats.total}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] uppercase font-bold text-amber-400">{t("withdrawals.pending")}</span>
            <p className="font-bold text-amber-300 text-sm">{stats.pending}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] uppercase font-bold text-emerald-400">{t("withdrawals.approved")}</span>
            <p className="font-bold text-emerald-300 text-sm">{stats.approved + stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder={t("withdrawals.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-[#ffd700] transition-colors"
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
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {["all", "pending", "approved", "completed", "rejected"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                filter === filterType
                  ? "bg-white/10 text-[#ffd700] border border-white/10"
                  : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className="flex items-center gap-1">
                <Filter size={12} />
                {t(`withdrawals.filters.${filterType}`)}
              </span>
            </button>
          ))}
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
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#131722]/50 backdrop-blur-sm">
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
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-8">
                    {t("withdrawals.noWithdrawals")}
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((w, idx) => {
                  const statusBadge = getStatusBadge(w.status);
                  return (
                    <tr key={`withdrawal-${w.id || idx}`}>
                      <td className="font-mono text-gray-400 text-xs">#{w.id}</td>
                      <td className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-white">#{w.user_id}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                            {w.user_email || w.email || "NO EMAIL"}
                          </span>
                        </div>
                      </td>
                      <td className="font-bold text-sm text-gray-300">{w.coin || "USDT"}</td>
                      <td>
                        <span className="font-bold text-[#FFD700]">
                          {parseFloat(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-mono text-gray-400 break-all block max-w-[180px] truncate" title={w.address}>
                          {w.address}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-500">
                          {w.created_at?.slice(0, 19).replace('T', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold border ${statusBadge.className}`}>
                          {statusBadge.icon}
                          {statusBadge.text}
                        </span>
                      </td>
                      <td>
                        {w.status === "pending" ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAction(w.id, "approve")}
                              disabled={!!actionLoading}
                              className="px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors flex items-center gap-1"
                            >
                              {actionLoading === w.id + "approve" ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                              {t("withdrawals.approve")}
                            </button>
                            <button
                              onClick={() => handleAction(w.id, "deny")}
                              disabled={!!actionLoading}
                              className="px-3 py-1.5 rounded-md text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors flex items-center gap-1"
                            >
                              {actionLoading === w.id + "deny" ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />}
                              {t("withdrawals.deny")}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}