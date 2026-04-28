// src/components/AdminBalance.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, User, Loader2, Wallet, Clock } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0d16] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Simplified Header without Stats */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#ffd700]/20 to-[#16d79c]/20">
              <Wallet className="w-8 h-8 text-[#ffd700]" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#ffd700] via-[#f0b90b] to-[#16d79c] bg-clip-text text-transparent">
                {t("balance.title")}
              </h1>
              <p className="text-gray-400 mt-1">{t("balance.subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Search Section */}
          <div className="p-6 border-b border-white/10">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#ffd700]/20 bg-[#191e29] text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/20 transition-all text-base"
                  placeholder={t("balance.searchPlaceholder")}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-[#ffd700] to-[#16d79c] rounded-xl font-bold text-[#181b25] shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
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
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <Clock size={12} />
                  <span>{t("balance.recentUsers")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentUsers.map((recent) => (
                    <button
                      key={recent.id}
                      onClick={() => setSearch(String(recent.id))}
                      className="px-3 py-1.5 rounded-lg bg-[#1e2434] hover:bg-[#252b3d] text-sm text-gray-300 transition-all hover:text-[#ffd700]"
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
            <div className={`mx-6 mt-6 p-4 rounded-xl font-semibold ${
              msg.includes(t("balance.userNotFound")) || msg.includes("Error") || msg.includes("Failed")
                ? "bg-red-500/20 border border-red-500/50 text-red-300"
                : "bg-green-500/20 border border-green-500/50 text-green-300"
            }`}>
              <div className="flex items-center gap-2">
                {msg.includes(t("balance.userNotFound")) ? <User size={18} /> : null}
                {msg}
              </div>
            </div>
          )}

          {/* User Info & Balance Adjuster */}
          {user && (
            <div className="p-6">
              {/* Enhanced User Card */}
              <div className="bg-gradient-to-r from-[#232836] to-[#1a1f2a] rounded-xl p-6 mb-6 border border-[#ffd700]/20">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-[#16d79c]/20 to-[#ffd700]/20">
                      <User size={24} className="text-[#ffd700]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">{t("balance.userId")}</p>
                      <p className="font-bold text-white text-2xl font-mono">#{user.id}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t("balance.email")}</p>
                    <p className="font-medium text-[#ffd700] text-lg break-all">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t("balance.username")}</p>
                    <p className="font-medium text-white text-lg">{user.username || user.email?.split('@')[0] || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Balance Adjuster Component */}
              <BalanceAdjuster userId={user.id} onDone={() => setMsg(t("balance.updateSuccess"))} />
            </div>
          )}

          {/* Empty State */}
          {!user && !msg && (
            <div className="p-12 text-center">
              <div className="inline-flex p-4 rounded-full bg-[#1e2434] mb-4">
                <User size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-400 text-lg">{t("balance.searchPrompt")}</p>
              <p className="text-gray-500 text-sm mt-2">{t("balance.searchHint")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}