// src/components/BalanceAdjuster.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Loader2, Plus, Minus, Snowflake, Coins, TrendingUp, AlertCircle, Zap, DollarSign, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
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

  const token =
  typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const getActionConfig = () => {
    switch(action) {
      case "add": 
        return { 
          icon: <Plus size={18} />, 
          title: t("balance.addBalance"),
          submitText: "Add Funds",
          color: "bg-emerald-500 hover:bg-emerald-400 text-[#0a0e17]",
          borderColor: "border-emerald-500/20",
          textColor: "text-emerald-400",
          bgLight: "bg-emerald-500/10"
        };
      case "reduce": 
        return { 
          icon: <Minus size={18} />, 
          title: t("balance.reduceBalance"),
          submitText: "Reduce Funds",
          color: "bg-rose-500 hover:bg-rose-400 text-[#0a0e17]",
          borderColor: "border-rose-500/20",
          textColor: "text-rose-400",
          bgLight: "bg-rose-500/10"
        };
      case "freeze": 
        return { 
          icon: <Snowflake size={18} />, 
          title: t("balance.freezeBalance"),
          submitText: "Freeze Funds",
          color: "bg-sky-500 hover:bg-sky-400 text-[#0a0e17]",
          borderColor: "border-sky-500/20",
          textColor: "text-sky-400",
          bgLight: "bg-sky-500/10"
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
    <div className="space-y-6 animate-fade-in w-full">
      {/* Main Action Card - Flat & Minimal */}
      <div className="bg-[#131722]/50 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
        
        {/* Header */}
        <div className={`px-6 py-4 border-b border-white/5 ${config.bgLight}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgLight} ${config.textColor}`}>
              {config.icon}
            </div>
            <div>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${config.textColor}`}>
                {config.title}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {action === "add" && "Add funds to user's available balance"}
                {action === "reduce" && "Deduct funds from user's balance"}
                {action === "freeze" && "Lock funds in user's account"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Coin Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {t("balance.coin")}
              </label>
              <select
                value={coin}
                onChange={e => setCoin(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffd700] transition-colors appearance-none cursor-pointer"
              >
                <option value="USDT">USDT (Tether)</option>
                <option value="USDC">USDC (USD Coin)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="BNB">BNB (Binance Coin)</option>
                <option value="SOL">SOL (Solana)</option>
                <option value="XRP">XRP (Ripple)</option>
              </select>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {t("balance.amount")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} className="text-gray-500" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#ffd700] transition-colors"
                  placeholder="Enter amount..."
                />
              </div>
            </div>

            {/* Action Selection (Add/Reduce/Freeze) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {t("balance.action")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAction("add")}
                  className={`py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                    action === "add" 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10"
                  }`}
                >
                  <Plus size={14} /> Add
                </button>
                <button
                  type="button"
                  onClick={() => setAction("reduce")}
                  className={`py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                    action === "reduce" 
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10"
                  }`}
                >
                  <Minus size={14} /> Reduce
                </button>
                <button
                  type="button"
                  onClick={() => setAction("freeze")}
                  className={`py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                    action === "freeze" 
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10"
                  }`}
                >
                  <Snowflake size={14} /> Freeze
                </button>
              </div>
            </div>
          </div>

          {/* Quick Amounts */}
          {action !== "freeze" && (
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">
                {t("balance.quickAmounts") || "QUICK AMOUNTS"}
              </label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((qAmount) => (
                  <button
                    key={qAmount}
                    type="button"
                    onClick={() => handleQuickAmount(qAmount)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 font-bold text-xs transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {action === "reduce" ? "-" : "+"}{qAmount} {coin}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flat Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${config.color} ${
              loading ? "opacity-70 cursor-not-allowed" : "shadow-lg"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>{t("common.processing")}</span>
              </>
            ) : (
              <>
                <span>
                  {action === "add" && `${config.submitText} to ${coin}`}
                  {action === "reduce" && `${config.submitText} from ${coin}`}
                  {action === "freeze" && `${config.submitText} in ${coin}`}
                </span>
                {amount && parseFloat(amount) > 0 && (
                  <span className="opacity-70 ml-1 font-mono font-medium">
                    ({parseFloat(amount).toLocaleString()} {coin})
                  </span>
                )}
              </>
            )}
          </button>

          {/* Message Display */}
          {msg && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border ${
              msg.includes(t("balance.success")) || msg.toLowerCase().includes("success")
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}>
              {msg.includes(t("balance.success")) || msg.toLowerCase().includes("success") ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <AlertCircle size={16} />
              )}
              {msg}
            </div>
          )}
        </form>
      </div>

      {/* Balance Table Section */}
      <div className="bg-[#131722]/50 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Coins size={18} className="text-[#ffd700]" />
          <h4 className="text-white font-bold text-lg">{t("balance.userBalances") || "User Balances"}</h4>
        </div>
        
        {/* We load UserBalanceTable here. Note: If the inner table looks misaligned, 
            it means the old styling is inside UserBalanceTable.jsx! */}
        <div className="p-0">
          <UserBalanceTable userId={userId} refresh={refresh} />
        </div>
      </div>
    </div>
  );
}