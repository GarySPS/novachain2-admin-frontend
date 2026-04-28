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

  const token = localStorage.getItem("adminToken");

  const getActionConfig = () => {
    switch(action) {
      case "add": 
        return { 
          icon: <Plus size={24} />, 
          title: t("balance.addBalance"),
          submitText: "Add Funds",
          color: "from-emerald-500 to-green-600",
          hoverColor: "from-emerald-600 to-green-700",
          gradient: "bg-gradient-to-r from-emerald-500/10 to-green-600/10",
          borderColor: "border-emerald-500/30",
          textColor: "text-emerald-400",
          bgLight: "bg-emerald-500/10"
        };
      case "reduce": 
        return { 
          icon: <Minus size={24} />, 
          title: t("balance.reduceBalance"),
          submitText: "Reduce Funds",
          color: "from-orange-500 to-red-600",
          hoverColor: "from-orange-600 to-red-700",
          gradient: "bg-gradient-to-r from-orange-500/10 to-red-600/10",
          borderColor: "border-orange-500/30",
          textColor: "text-orange-400",
          bgLight: "bg-orange-500/10"
        };
      case "freeze": 
        return { 
          icon: <Snowflake size={24} />, 
          title: t("balance.freezeBalance"),
          submitText: "Freeze Funds",
          color: "from-blue-500 to-cyan-600",
          hoverColor: "from-blue-600 to-cyan-700",
          gradient: "bg-gradient-to-r from-blue-500/10 to-cyan-600/10",
          borderColor: "border-blue-500/30",
          textColor: "text-blue-400",
          bgLight: "bg-blue-500/10"
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
    <div className="space-y-8">
      {/* Main Action Card - Clean and spacious */}
      <div className={`bg-slate-800/40 rounded-2xl shadow-xl overflow-hidden border ${config.borderColor} transition-all duration-300`}>
        {/* Header */}
        <div className={`${config.gradient} px-6 md:px-8 py-5 border-b ${config.borderColor}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${config.bgLight}`}>
              {config.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                {config.title}
                <span className="text-sm font-normal text-slate-400">• Adjust Balance</span>
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {action === "add" && "Add funds to user's available balance"}
                {action === "reduce" && "Deduct funds from user's balance"}
                {action === "freeze" && "Lock funds in user's account"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {/* 3-Column Grid for Controls with better spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Coin Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Coins size={18} className="text-amber-400" />
                {t("balance.coin")}
              </label>
              <select
                value={coin}
                onChange={e => setCoin(e.target.value)}
                className="w-full bg-slate-700 border-2 border-slate-600 rounded-xl px-5 py-4 text-white font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all cursor-pointer hover:bg-slate-600 text-base"
              >
                <option value="USDT">💵 USDT (Tether)</option>
                <option value="USDC">💎 USDC (USD Coin)</option>
                <option value="BTC">₿ Bitcoin (BTC)</option>
                <option value="ETH">Ξ Ethereum (ETH)</option>
                <option value="BNB">🔶 Binance Coin (BNB)</option>
                <option value="SOL">◎ Solana (SOL)</option>
                <option value="XRP">✖ Ripple (XRP)</option>
              </select>
            </div>

            {/* Amount Input - Now with proper input box! */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <TrendingUp size={18} className="text-amber-400" />
                {t("balance.amount")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign size={20} className="text-slate-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-lg"
                  placeholder="Enter amount..."
                />
              </div>
            </div>

            {/* Action Selection - LARGE, EASY TO CLICK BUTTONS */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Zap size={18} className="text-amber-400" />
                {t("balance.action")}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAction("add")}
                  className={`py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                    action === "add" 
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105 ring-2 ring-emerald-400/50"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-emerald-400 border border-slate-600 hover:border-emerald-500/50"
                  }`}
                >
                  <Plus size={18} /> Add
                </button>
                <button
                  type="button"
                  onClick={() => setAction("reduce")}
                  className={`py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                    action === "reduce" 
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105 ring-2 ring-orange-400/50"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-orange-400 border border-slate-600 hover:border-orange-500/50"
                  }`}
                >
                  <Minus size={18} /> Reduce
                </button>
                <button
                  type="button"
                  onClick={() => setAction("freeze")}
                  className={`py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                    action === "freeze" 
                      ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg scale-105 ring-2 ring-blue-400/50"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-blue-400 border border-slate-600 hover:border-blue-500/50"
                  }`}
                >
                  <Snowflake size={18} /> Freeze
                </button>
              </div>
            </div>
          </div>

          {/* Quick Amount Buttons - Large and touch-friendly */}
          {action !== "freeze" && (
            <div className="mb-8">
              <label className="block text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                {t("balance.quickAmounts") || "QUICK AMOUNTS"}
              </label>
              <div className="flex flex-wrap gap-3">
                {quickAmounts.map((qAmount) => (
                  <button
                    key={qAmount}
                    type="button"
                    onClick={() => handleQuickAmount(qAmount)}
                    className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 font-bold text-base transition-all hover:scale-105 hover:border-amber-400/50 hover:text-amber-400 shadow-md"
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
            className={`w-full py-6 rounded-xl font-extrabold text-white shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 text-xl ${
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
                  {action === "add" && <ArrowUpCircle size={24} />}
                  {action === "reduce" && <ArrowDownCircle size={24} />}
                  {action === "freeze" && <Snowflake size={24} />}
                </div>
                <span className="tracking-wide font-bold text-lg">
                  {action === "add" && `${config.submitText} to ${coin}`}
                  {action === "reduce" && `${config.submitText} from ${coin}`}
                  {action === "freeze" && `${config.submitText} in ${coin}`}
                </span>
                {amount && parseFloat(amount) > 0 && (
                  <span className="text-white/80 text-base ml-2 font-mono bg-white/10 px-3 py-1 rounded-full">
                    {parseFloat(amount).toLocaleString()} {coin}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Enhanced Message Display */}
          {msg && (
            <div className={`mt-6 p-5 rounded-xl font-semibold text-center ${
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

      {/* Balance Table Section - Clean and readable */}
      <div className="bg-slate-800/40 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50">
        <div className="px-6 md:px-8 py-5 bg-slate-800/60 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <Coins size={22} className="text-amber-400" />
            <h4 className="text-white font-bold text-xl">{t("balance.userBalances") || "User Balances"}</h4>
          </div>
        </div>
        <UserBalanceTable userId={userId} refresh={refresh} />
      </div>
    </div>
  );
}