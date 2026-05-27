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
        return { icon: <CheckCircle2 size={14} />, text: t("deposits.approved"), className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
      case "pending":
        return { icon: <Loader2 size={14} className="animate-spin" />, text: t("deposits.pending"), className: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case "denied":
      case "rejected":
        return { icon: <XCircle size={14} />, text: t("deposits.denied"), className: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
      default:
        return { icon: null, text: status, className: "text-gray-400 bg-gray-500/10 border-gray-500/20" };
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
    <div className="w-full animate-fade-in">
      {/* Sleek Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <Wallet size={20} className="text-gray-400" />
          {t("deposits.title")}
        </h2>
        
        {/* Flat Stats Cards */}
        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] uppercase font-bold text-sky-400">{t("deposits.total")}</span>
            <p className="font-bold text-sky-300 text-sm">{stats.total}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] uppercase font-bold text-amber-400">{t("deposits.pending")}</span>
            <p className="font-bold text-amber-300 text-sm">{stats.pending}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] uppercase font-bold text-emerald-400">{t("deposits.approved")}</span>
            <p className="font-bold text-emerald-300 text-sm">{stats.approved}</p>
          </div>
        </div>
      </div>

      {/* Clean Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {["all", "pending", "approved", "denied"].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              filter === filterType
                ? "bg-white/10 text-[#ffd700] border border-white/10"
                : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            {t(`deposits.filters.${filterType}`)}
          </button>
        ))}
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
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-8">
                    {t("deposits.noDeposits")}
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((d, idx) => {
                  const statusBadge = getStatusBadge(d.status);
                  const screenshotData = getScreenshotUrl(d.screenshot);
                  
                  return (
                    <tr key={`deposit-${d.id || idx}-${d.user_id || "x"}`}>
                      <td className="font-mono text-gray-400">#{d.id}</td>
                      <td className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-white">#{d.user_id}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                            {d.user_email || d.email || "NO EMAIL"}
                          </span>
                        </div>
                      </td>
                      <td className="font-bold text-sm text-gray-300">{d.coin || "USDT"}</td>
                      <td>
                        <span className="font-bold text-[#FFD700]">
                          {parseFloat(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold border ${statusBadge.className}`}>
                          {statusBadge.icon}
                          {statusBadge.text}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-500">
                          {d.created_at?.slice(0, 19).replace("T", " ")}
                        </span>
                      </td>
                      <td>
                        {screenshotData ? (
                          screenshotData.type === "web3" ? (
                            <div className="tooltip" title={`${t("deposits.txHash")}: ${screenshotData.hash}`}>
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-sky-500/10 text-sky-400 text-[10px] font-bold tracking-wider uppercase rounded-md border border-sky-500/20">
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
                                className="rounded-lg border border-white/10 object-cover w-10 h-10 transition-transform group-hover:scale-110"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/40?text=NA";
                                }}
                              />
                            </a>
                          )
                        ) : (
                          <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <Image size={14} />
                            {t("common.na")}
                          </span>
                        )}
                      </td>
                      <td>
                        {d.status === "pending" ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAction(d.id, "approve")}
                              className="px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors flex items-center gap-1"
                              disabled={!!actionLoading}
                            >
                              {actionLoading === d.id + "approve" ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                              {t("deposits.approve")}
                            </button>
                            <button
                              onClick={() => handleAction(d.id, "deny")}
                              className="px-3 py-1.5 rounded-md text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors flex items-center gap-1"
                              disabled={!!actionLoading}
                            >
                              {actionLoading === d.id + "deny" ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />}
                              {t("deposits.deny")}
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