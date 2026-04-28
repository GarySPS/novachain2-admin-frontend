// src/components/AdminBalance.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, User, Loader2, Wallet, Clock, Users, Sparkles } from "lucide-react";
import BalanceAdjuster from "./BalanceAdjuster";
import { API_BASE } from "../config";

export default function AdminBalance() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [recentUsers, setRecentUsers] = useState([]);

  // Load recent users from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentBalanceUsers");
    if (saved) {
      setRecentUsers(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  const saveRecentUser = (userData) => {
    const saved = localStorage.getItem("recentBalanceUsers");
    let users = saved ? JSON.parse(saved) : [];
    users = [userData, ...users.filter(u => u.id !== userData.id)].slice(0, 5);
    localStorage.setItem("recentBalanceUsers", JSON.stringify(users));
    setRecentUsers(users);
  };

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
        saveRecentUser({ id: found.id, email: found.email, username: found.username });
        setMsg("");
      }
    } catch (err) {
      setMsg(err.message || t("balance.searchError"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section with better spacing */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400/20 to-emerald-400/20 backdrop-blur-sm">
                <Wallet className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 bg-clip-text text-transparent">
                  {t("balance.title")}
                </h1>
                <p className="text-slate-400 mt-1 text-lg">{t("balance.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-full">
              <Sparkles size={16} className="text-amber-400" />
              <span>Precision Balance Management</span>
            </div>
          </div>
        </div>

        {/* Main Card with improved spacing */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {/* Search Section */}
          <div className="p-6 md:p-8 border-b border-slate-700/50">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-slate-400" />
                </div>
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-base"
                  placeholder={t("balance.searchPlaceholder") || "Search by User ID or Email..."}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px] text-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {t("common.searching")}
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    {t("common.search")}
                  </>
                )}
              </button>
            </form>

            {/* Recent Users Quick Select */}
            {recentUsers.length > 0 && !user && (
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                  <Clock size={14} />
                  <span className="font-medium">{t("balance.recentUsers") || "Recent Users"}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {recentUsers.map((recent) => (
                    <button
                      key={recent.id}
                      onClick={() => setSearch(String(recent.id))}
                      className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 transition-all hover:text-amber-400 font-medium"
                    >
                      #{recent.id} - {recent.email}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {msg && (
            <div className={`mx-6 md:mx-8 mt-6 p-4 rounded-xl font-semibold ${
              msg.includes(t("balance.userNotFound")) || msg.includes("Error") || msg.includes("Failed")
                ? "bg-red-500/20 border border-red-500/50 text-red-300"
                : "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
            }`}>
              <div className="flex items-center gap-2">
                {msg.includes(t("balance.userNotFound")) ? <User size={18} /> : null}
                {msg}
              </div>
            </div>
          )}

          {/* User Info & Balance Adjuster */}
          {user && (
            <div className="p-6 md:p-8">
              {/* Enhanced User Card with better spacing */}
              <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl p-6 md:p-8 mb-8 border border-amber-400/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="p-3 rounded-full bg-gradient-to-br from-emerald-400/20 to-amber-400/20">
                      <User size={28} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t("balance.userId")}</p>
                      <p className="font-bold text-white text-3xl font-mono">#{user.id}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t("balance.email")}</p>
                    <p className="font-medium text-amber-400 text-xl break-all">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t("balance.username")}</p>
                    <p className="font-medium text-white text-xl">{user.username || user.email?.split('@')[0] || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Balance Adjuster Component */}
              <BalanceAdjuster userId={user.id} onDone={() => setMsg(t("balance.updateSuccess"))} />
            </div>
          )}

          {/* Empty State - More inviting */}
          {!user && !msg && (
            <div className="p-12 md:p-20 text-center">
              <div className="inline-flex p-6 rounded-full bg-slate-700/50 mb-6">
                <Users size={48} className="text-slate-500" />
              </div>
              <p className="text-slate-300 text-xl font-medium mb-2">{t("balance.searchPrompt") || "Search for a user to manage balances"}</p>
              <p className="text-slate-500 text-base">{t("balance.searchHint") || "Enter user ID or email address above"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}