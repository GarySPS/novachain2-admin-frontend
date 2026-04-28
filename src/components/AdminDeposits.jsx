//src>components>AdminDeposits.jsx


import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, Loader2, Image, Wallet } from "lucide-react";
import { API_BASE } from "../config";

// Supabase Storage config
const SUPABASE_PUBLIC_URL = "https://obrfnkggcfgfspyqgtws.supabase.co/storage/v1/object/public/deposit";

export default function AdminDeposits() {
  const { t } = useTranslation();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, approved, denied

  useEffect(() => {
    fetchDeposits();
    // eslint-disable-next-line
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
      console.log("DEPOSIT DATA:", data);
    } catch (err) {
      setError(err.message || t("deposits.networkError"));
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
          ? `${API_BASE}/api/admin/deposits/${id}/approve`
          : `${API_BASE}/api/admin/deposits/${id}/deny`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t(`deposits.${action}Error`));
      fetchDeposits();
    } catch (err) {
      setError(err.message || t("deposits.networkError"));
    }
    setActionLoading(null);
  };

  // Filter deposits based on selected filter
  const filteredDeposits = deposits.filter(deposit => {
    if (filter === "all") return true;
    if (filter === "pending") return deposit.status === "pending";
    if (filter === "approved") return deposit.status === "approved";
    if (filter === "denied") return deposit.status === "denied" || deposit.status === "rejected";
    return true;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case "approved":
        return { icon: <CheckCircle2 size={16} />, text: t("deposits.approved"), className: "text-green-400 bg-green-500/10" };
      case "pending":
        return { icon: <Loader2 size={16} className="animate-spin" />, text: t("deposits.pending"), className: "text-yellow-300 bg-yellow-500/10" };
      case "denied":
      case "rejected":
        return { icon: <XCircle size={16} />, text: t("deposits.denied"), className: "text-red-400 bg-red-500/10" };
      default:
        return { icon: null, text: status, className: "text-gray-400 bg-gray-500/10" };
    }
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

  const stats = {
    total: deposits.length,
    pending: deposits.filter(d => d.status === "pending").length,
    approved: deposits.filter(d => d.status === "approved").length,
    denied: deposits.filter(d => d.status === "denied" || d.status === "rejected").length,
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-2 sm:px-6 py-8 rounded-2xl shadow-2xl bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 border border-white/5">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#ffd700]">
          <Wallet size={24} className="text-[#16d79c]" />
          {t("deposits.title")}
        </h2>
        
        {/* Stats Cards */}
        <div className="flex gap-3">
          <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <span className="text-xs text-blue-400">{t("deposits.total")}</span>
            <p className="font-bold text-blue-300">{stats.total}</p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <span className="text-xs text-yellow-400">{t("deposits.pending")}</span>
            <p className="font-bold text-yellow-300">{stats.pending}</p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/30">
            <span className="text-xs text-green-400">{t("deposits.approved")}</span>
            <p className="font-bold text-green-300">{stats.approved}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
        {["all", "pending", "approved", "denied"].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === filterType
                ? "bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#181b25] shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t(`deposits.filters.${filterType}`)}
          </button>
        ))}
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
          <table className="admin-table min-w-[900px]">
            <thead>
              <tr>
                <th>{t("deposits.id")}</th>
                <th>{t("deposits.user")}</th>
                <th>{t("deposits.coin")}</th>
                <th>{t("deposits.amount")}</th>
                <th>{t("deposits.status")}</th>
                <th>{t("deposits.time")}</th>
                <th>{t("deposits.slip")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.map((d, idx) => {
                const statusBadge = getStatusBadge(d.status);
                const screenshotData = getScreenshotUrl(d.screenshot);
                
                return (
                  <tr key={`deposit-${d.id || idx}-${d.user_id || "x"}`}>
                    <td className="font-mono text-xs">{d.id}</td>
                    <td className="font-medium">{d.user_id}</td>
                    <td className="font-bold text-sm">{d.coin || "USDT"}</td>
                    <td>
                      <span className="font-bold text-[#FFD700]">
                        {parseFloat(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${statusBadge.className}`}>
                        {statusBadge.icon}
                        {statusBadge.text}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-400">
                        {d.created_at?.slice(0, 19).replace("T", " ")}
                      </span>
                    </td>
                    <td>
                      {screenshotData ? (
                        screenshotData.type === "web3" ? (
                          <div className="tooltip" title={`${t("deposits.txHash")}: ${screenshotData.hash}`}>
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wider uppercase rounded border border-blue-500/30">
                              <Image size={12} />
                              Web3 Tx
                            </span>
                          </div>
                        ) : (
                          <a
                            href={screenshotData.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block group"
                            title={t("deposits.viewSlip")}
                          >
                            <img
                              src={screenshotData.url}
                              alt={t("deposits.depositSlip")}
                              className="rounded-md shadow border border-[#ffd70044] object-cover w-12 h-12 group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/48?text=No+Image";
                              }}
                            />
                          </a>
                        )
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <Image size={18} />
                          <span className="text-xs">{t("common.na")}</span>
                        </span>
                      )}
                    </td>
                    <td>
                      {d.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(d.id, "approve")}
                            className={`px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#232836] shadow hover:shadow-lg transition-all flex items-center gap-1 text-sm ${
                              actionLoading ? "opacity-60 cursor-wait" : "hover:scale-105"
                            }`}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === d.id + "approve" ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <>
                                <CheckCircle2 size={14} /> {t("deposits.approve")}
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleAction(d.id, "deny")}
                            className={`px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#f34e6d] to-[#ffd700] text-[#232836] shadow hover:shadow-lg transition-all flex items-center gap-1 text-sm ${
                              actionLoading ? "opacity-60 cursor-wait" : "hover:scale-105"
                            }`}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === d.id + "deny" ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <>
                                <XCircle size={14} /> {t("deposits.deny")}
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredDeposits.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 font-semibold">
                    {t("deposits.noDeposits")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}