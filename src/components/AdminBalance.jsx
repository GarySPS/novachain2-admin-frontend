// src/components/AdminBalance.jsx

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, User, Loader2, Wallet } from "lucide-react";
import BalanceAdjuster from "./BalanceAdjuster";
import { API_BASE } from "../config";

export default function AdminBalance() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setMsg("");
    setUser(null);
    if (!search) return setMsg(t("balance.enterIdOrEmail"));
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let users = await res.json();
      if (!res.ok) throw new Error(users.message || t("balance.fetchError"));
      let found = users.find(
        (u) =>
          String(u.id) === String(search) ||
          (u.email && u.email.toLowerCase() === search.toLowerCase())
      );
      if (!found) {
        setMsg(t("balance.userNotFound"));
        setUser(null);
      } else {
        setUser(found);
      }
    } catch (err) {
      setMsg(err.message || t("balance.searchError"));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 rounded-2xl shadow-2xl mt-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#16d79c]/20 to-[#ffd700]/20">
          <Wallet className="w-6 h-6 text-[#ffd700]" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#ffd700]">
          {t("balance.title")}
        </h2>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#ffd700]/40 bg-[#191e29] text-white placeholder-gray-400 focus:outline-none focus:border-[#16d79c] transition-colors"
            placeholder={t("balance.searchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-[#ffd700] to-[#16d79c] rounded-xl font-bold text-[#181b25] shadow hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              {t("common.searching")}
            </>
          ) : (
            <>
              <Search size={18} />
              {t("common.search")}
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {msg && (
        <div className={`p-3 rounded-lg mb-4 font-semibold ${
          msg.includes(t("balance.userNotFound")) || msg.includes("Error") || msg.includes("Failed")
            ? "bg-red-500/20 border border-red-500/50 text-red-300"
            : "bg-green-500/20 border border-green-500/50 text-green-300"
        }`}>
          {msg}
        </div>
      )}

      {/* User Info & Balance Adjuster */}
      {user && (
        <div className="mt-4">
          {/* User Card */}
          <div className="bg-gradient-to-r from-[#232836] to-[#1a1f2a] rounded-xl p-4 mb-6 border border-[#ffd700]/20">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-br from-[#16d79c]/20 to-[#ffd700]/20">
                  <User size={20} className="text-[#ffd700]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{t("balance.userId")}</p>
                  <p className="font-bold text-white text-lg">{user.id}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">{t("balance.email")}</p>
                <p className="font-medium text-[#ffd700]">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">{t("balance.username")}</p>
                <p className="font-medium text-white">{user.username || user.email?.split('@')[0] || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Balance Adjuster Component */}
          <BalanceAdjuster userId={user.id} onDone={() => setMsg(t("balance.updateSuccess"))} />
        </div>
      )}
    </div>
  );
}