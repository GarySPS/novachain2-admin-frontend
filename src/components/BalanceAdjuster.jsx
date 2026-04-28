// src/components/BalanceAdjuster.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Loader2, Plus, Minus, Snowflake, Coins, TrendingUp, AlertCircle, Zap } from "lucide-react";
import { API_BASE } from "../config";
import UserBalanceTable from "./UserBalanceTable";

export default function BalanceAdjuster({ userId, onDone }) {
  const { t } = useTranslation();
  const [coin, setCoin] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState("add");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [quickAmounts] = useState([10, 50, 100, 500, 1000]);

  const token = localStorage.getItem("adminToken");

  const getActionConfig = () => {
    switch(action) {
      case "add": 
        return { 
          icon: <Plus size={22} />, 
          title: t("balance.addBalance"),
          color: "from-emerald-500 to-green-600",
          hoverColor: "from-emerald-600 to-green-700",
          gradient: "bg-gradient-to-r from-emerald-500/20 to-green-600/20",
          borderColor: "border-emerald-500/30",
          textColor: "text-emerald-400"
        };
      case "reduce": 
        return { 
          icon: <Minus size={22} />, 
          title: t("balance.reduceBalance"),
          color: "from-orange-500 to-red-600",
          hoverColor: "from-orange-600 to-red-700",
          gradient: "bg-gradient-to-r from-orange-500/20 to-red-600/20",
          borderColor: "border-orange-500/30",
          textColor: "text-orange-400"
        };
      case "freeze": 
        return { 
          icon: <Snowflake size={22} />, 
          title: t("balance.freezeBalance"),
          color: "from-blue-500 to-cyan-600",
          hoverColor: "from-blue-600 to-cyan-700",
          gradient: "bg-gradient-to-r from-blue-500/20 to-cyan-600/20",
          borderColor: "border-blue-500/30",
          textColor: "text-blue-400"
        };
      default: return {};
    }
  };

  const config = getActionConfig();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setMsg(t("balance.invalidAmount"));
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      let url, payload;
      if (action === "add") {
        url = `${API_BASE}/api/admin/add-balance`;
        payload = { user_id: userId, coin, amount: parseFloat(amount) };
      } else if (action === "reduce") {
        url = `${API_BASE}/api/admin/user/${userId}/reduce-balance`;
        payload = { coin, amount: parseFloat(amount) };
      } else if (action === "freeze") {
        url = `${API_BASE}/api/admin/freeze-balance`;
        payload = { user_id: userId, coin, amount: parseFloat(amount) };
      }
      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg(res.data.message || t("balance.success"));
      setRefresh(v => v + 1);
      setAmount("");
      if (onDone) onDone();
      setTimeout(() => setMsg(""), 4000);
    } catch (err) {
      setMsg(err.response?.data?.message || t("balance.error"));
      setTimeout(() => setMsg(""), 4000);
    }
    setLoading(false);
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  return (
    <div className="space-y-6">
      {/* Main Action Card */}
      <div className={`bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-2xl shadow-2xl overflow-hidden border ${config.borderColor} transition-all duration-300`}>
        {/* Header with Gradient */}
        <div className={`${config.gradient} px-6 py-4 border-b ${config.borderColor}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${config.color.replace('from-', 'bg-').replace('to-', 'bg-')} bg-opacity-20`}>
              {config.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {config.title}
                <span className="text-xs font-normal text-gray-400">• {t("balance.adjustTitle")}</span>
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {action === "add" && t("balance.addDescription")}
                {action === "reduce" && t("balance.reduceDescription")}
                {action === "freeze" && t("balance.freezeDescription")}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* 3-Column Grid for Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Coin Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <Coins size={16} className="text-[#ffd700]" />
                {t("balance.coin")}
              </label>
              <select
                value={coin}
                onChange={e => setCoin(e.target.value)}
                className="w-full bg-[#1e2434] border-2 border-gray-700 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/20 transition-all cursor-pointer hover:bg-[#252b3d]"
              >
                <option value="USDT">💵 USDT (Tether)</option>
                <option value="USDC">💎 USDC (USD Coin)</option>
                <option value="BTC">₿ Bitcoin (BTC)</option>
                <option value="ETH">Ξ Ethereum (ETH)</option>
                <option value="BNB">🔶 Binance Coin (BNB)</option>
              </select>
            </div>

            {/* Amount Input with Quick Actions */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-[#ffd700]" />
                {t("balance.amount")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  placeholder={`0.00 ${coin}`}
                  className="w-full bg-[#1e2434] border-2 border-gray-700 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/20 transition-all"
                />
                {amount && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    ≈ {parseFloat(amount || 0).toFixed(2)} {coin}
                  </div>
                )}
              </div>
            </div>

            {/* Action Selection - ENLARGED BUTTONS */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-[#ffd700]" />
                {t("balance.action")}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAction("add")}
                  className={`py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                    action === "add" 
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105 ring-2 ring-emerald-400/50"
                      : "bg-[#1e2434] text-gray-400 hover:bg-[#252b3d] hover:text-emerald-400 border border-gray-700 hover:border-emerald-500/50"
                  }`}
                >
                  <Plus size={18} /> {t("balance.add")}
                </button>
                <button
                  type="button"
                  onClick={() => setAction("reduce")}
                  className={`py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                    action === "reduce" 
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105 ring-2 ring-orange-400/50"
                      : "bg-[#1e2434] text-gray-400 hover:bg-[#252b3d] hover:text-orange-400 border border-gray-700 hover:border-orange-500/50"
                  }`}
                >
                  <Minus size={18} /> {t("balance.reduce")}
                </button>
                <button
                  type="button"
                  onClick={() => setAction("freeze")}
                  className={`py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                    action === "freeze" 
                      ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg scale-105 ring-2 ring-blue-400/50"
                      : "bg-[#1e2434] text-gray-400 hover:bg-[#252b3d] hover:text-blue-400 border border-gray-700 hover:border-blue-500/50"
                  }`}
                >
                  <Snowflake size={18} /> {t("balance.freeze")}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Amount Buttons - VISUALLY ENHANCED */}
          {action !== "freeze" && (
            <div className="mb-8">
              <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                {t("balance.quickAmounts")}
              </label>
              <div className="flex flex-wrap gap-3">
                {quickAmounts.map((qAmount) => (
                  <button
                    key={qAmount}
                    type="button"
                    onClick={() => handleQuickAmount(qAmount)}
                    className="px-5 py-2.5 rounded-xl bg-[#1e2434] hover:bg-[#252b3d] border border-gray-700 text-gray-300 font-semibold text-sm transition-all hover:scale-105 hover:border-[#ffd700]/50 hover:text-[#ffd700] shadow-md"
                  >
                    +{qAmount} {coin}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MASSIVE SUBMIT BUTTON - Highly visible and easy to click */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-xl font-extrabold text-white shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 text-xl ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
            } bg-gradient-to-r ${config.color}`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={28} />
                <span>{t("common.processing")}</span>
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-white/20">
                  {config.icon}
                </div>
                <span className="tracking-wide font-bold">
                  {action === "add" && t("balance.submitAdd")}
                  {action === "reduce" && t("balance.submitReduce")}
                  {action === "freeze" && t("balance.submitFreeze")}
                </span>
                {amount && parseFloat(amount) > 0 && (
                  <span className="text-white/80 text-sm ml-2 font-mono">
                    {amount} {coin}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Enhanced Message Display */}
          {msg && (
            <div className={`mt-5 p-4 rounded-xl font-semibold text-center ${
              msg.includes(t("balance.success")) || msg.includes("success")
                ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                : "bg-red-500/20 border border-red-500/50 text-red-300"
            }`}>
              <div className="flex items-center justify-center gap-2">
                {msg.includes(t("balance.success")) ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <AlertCircle size={18} />
                )}
                {msg}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Balance Table Section */}
      <div className="bg-[#1a1f2e] rounded-2xl shadow-xl overflow-hidden border border-gray-800">
        <div className="px-6 py-4 bg-gradient-to-r from-[#1e2434] to-[#1a1f2e] border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Coins size={20} className="text-[#ffd700]" />
            <h4 className="text-white font-bold text-lg">{t("balance.userBalances")}</h4>
          </div>
        </div>
        <UserBalanceTable userId={userId} refresh={refresh} />
      </div>
    </div>
  );
}