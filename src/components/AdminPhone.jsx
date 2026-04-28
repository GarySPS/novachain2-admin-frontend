//src>components>AdminPhone.jsx

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Phone, CheckCircle, XCircle, Loader2, Users, Smartphone } from "lucide-react";

// Adjust this base URL if your admin API is hosted elsewhere
const API_BASE = "http://localhost:5001/api"; 

export default function AdminPhone() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, approved

  const fetchPhoneUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/admin/phone-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setError(t("phone.fetchError"));
      }
    } catch (err) {
      setError(t("phone.networkError"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPhoneUsers();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/admin/phone-users/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccess(t("phone.approveSuccess", { id }));
        fetchPhoneUsers();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(t("phone.approveError"));
      }
    } catch (err) {
      setError(t("phone.serverError"));
    }
    setActionLoading(null);
  };

  const filteredUsers = users.filter(user => {
    if (filter === "all") return true;
    if (filter === "pending") return !user.verified;
    if (filter === "approved") return user.verified;
    return true;
  });

  const stats = {
    total: users.length,
    pending: users.filter(u => !u.verified).length,
    approved: users.filter(u => u.verified).length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Stats */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-700/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#16d79c]/20 to-[#ffd700]/20">
            <Phone className="w-6 h-6 text-[#ffd700]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            {t("phone.title")}
          </h2>
        </div>
        
        {/* Stats Cards */}
        <div className="flex gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-blue-400" />
              <span className="text-xs text-blue-400">{t("phone.total")}</span>
            </div>
            <p className="font-bold text-blue-300 text-lg">{stats.total}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="text-yellow-400" />
              <span className="text-xs text-yellow-400">{t("phone.pending")}</span>
            </div>
            <p className="font-bold text-yellow-300 text-lg">{stats.pending}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-xs text-green-400">{t("phone.approved")}</span>
            </div>
            <p className="font-bold text-green-300 text-lg">{stats.approved}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2">
        {["all", "pending", "approved"].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === filterType
                ? "bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#181b25] shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t(`phone.filters.${filterType}`)}
            {filterType !== "all" && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                {filterType === "pending" ? stats.pending : stats.approved}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg">
          <XCircle size={18} />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 rounded-lg">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-[#FFD700] mr-2" size={30} />
          <span className="text-yellow-200 font-bold">{t("common.loading")}</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-[#151b2b]/50 shadow-xl backdrop-blur-md">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">{t("phone.id")}</th>
                <th className="px-6 py-4 font-semibold">{t("phone.username")}</th>
                <th className="px-6 py-4 font-semibold">{t("phone.phoneNumber")}</th>
                <th className="px-6 py-4 font-semibold">{t("phone.code")}</th>
                <th className="px-6 py-4 font-semibold">{t("phone.status")}</th>
                <th className="px-6 py-4 font-semibold text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    {filter === "pending" 
                      ? t("phone.noPendingUsers")
                      : filter === "approved"
                      ? t("phone.noApprovedUsers")
                      : t("phone.noUsers")}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const cleanPhone = u.email ? u.email.replace("@phone.demo", "") : "N/A";
                  
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">#{u.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          <Smartphone size={14} className="text-slate-500" />
                          {u.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sky-400">
                        <div className="flex items-center gap-1">
                          <Phone size={12} />
                          {cleanPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="px-2 py-1 rounded bg-slate-700/50 text-yellow-400 font-mono text-xs">
                          {u.memberCode || "N/A"}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        {u.verified ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                            <CheckCircle size={12} />
                            {t("phone.approved")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">
                            <Loader2 size={12} className="animate-spin" />
                            {t("phone.pending")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!u.verified && (
                          <button
                            onClick={() => handleApprove(u.id)}
                            disabled={!!actionLoading}
                            className={`rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-lg ${
                              actionLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                            }`}
                          >
                            {actionLoading === u.id ? (
                              <Loader2 className="animate-spin inline mr-1" size={14} />
                            ) : (
                              <CheckCircle size={14} className="inline mr-1" />
                            )}
                            {t("phone.approve")}
                          </button>
                        )}
                        {u.verified && (
                          <span className="text-xs text-green-400 opacity-60">
                            {t("phone.alreadyApproved")}
                          </span>
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
    </motion.div>
  );
}