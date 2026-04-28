// src/components/BalanceAdjuster.jsx

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Loader2, Plus, Minus, Snowflake } from "lucide-react";
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

  const token = localStorage.getItem("adminToken");

  const getActionIcon = () => {
    switch(action) {
      case "add": return <Plus size={18} />;
      case "reduce": return <Minus size={18} />;
      case "freeze": return <Snowflake size={18} />;
      default: return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setMsg(t("balance.invalidAmount"));
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
      if (onDone) onDone();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || t("balance.error"));
    }
    setLoading(false);
  };

  return (
    <div>
      <form 
        onSubmit={handleSubmit} 
        className="bg-[#1e2434] rounded-xl shadow-lg p-6 w-full"
      >
        <h3 className="text-xl font-bold text-[#ffd700] mb-6 flex items-center gap-2">
          {getActionIcon()}
          {t("balance.adjustTitle")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Coin Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              {t("balance.coin")}
            </label>
            <select
              value={coin}
              onChange={e => setCoin(e.target.value)}
              className="w-full bg-[#2a3048] border border-[#ffd700]/40 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
            >
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="BNB">BNB</option>
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              {t("balance.amount")}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              placeholder={t("balance.amountPlaceholder")}
              className="w-full bg-[#2a3048] border border-[#ffd700]/40 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
            />
          </div>

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              {t("balance.action")}
            </label>
            <select
              value={action}
              onChange={e => setAction(e.target.value)}
              className="w-full bg-[#2a3048] border border-[#ffd700]/40 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
            >
              <option value="add">{t("balance.addBalance")}</option>
              <option value="reduce">{t("balance.reduceBalance")}</option>
              <option value="freeze">{t("balance.freezeBalance")}</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-[#181b25] shadow-lg transition-all flex items-center justify-center gap-2 ${
            action === "add" 
              ? "bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600"
              : action === "reduce"
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              : "bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600"
          } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              {t("common.processing")}
            </>
          ) : (
            <>
              {getActionIcon()}
              {action === "add" && t("balance.submitAdd")}
              {action === "reduce" && t("balance.submitReduce")}
              {action === "freeze" && t("balance.submitFreeze")}
            </>
          )}
        </button>

        {msg && (
          <div className={`mt-4 text-center font-semibold p-2 rounded-lg ${
            msg.includes(t("balance.success")) 
              ? "text-green-400 bg-green-500/10" 
              : "text-red-400 bg-red-500/10"
          }`}>
            {msg}
          </div>
        )}
      </form>

      {/* User Balance Table */}
      <div className="mt-6">
        <UserBalanceTable userId={userId} refresh={refresh} />
      </div>
    </div>
  );
}