// src/components/BalanceAdjuster.jsx

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  DollarSign,
  Loader2,
  Minus,
  Plus,
  Snowflake,
  UserRound,
  WalletCards,
  Zap,
} from "lucide-react";
import { API_BASE } from "../config";
import UserBalanceTable from "./UserBalanceTable";

const coinOptions = [
  { value: "USDT", label: "USDT · Tether" },
  { value: "USDC", label: "USDC · USD Coin" },
  { value: "BTC", label: "BTC · Bitcoin" },
  { value: "ETH", label: "ETH · Ethereum" },
  { value: "BNB", label: "BNB · Binance Coin" },
  { value: "SOL", label: "SOL · Solana" },
  { value: "XRP", label: "XRP · Ripple" },
];

const actionOptions = [
  {
    value: "add",
    label: "Add Balance",
    description: "Increase user's available balance.",
    icon: Plus,
  },
  {
    value: "reduce",
    label: "Reduce Balance",
    description: "Deduct from user's available balance.",
    icon: Minus,
  },
  {
    value: "freeze",
    label: "Freeze Balance",
    description: "Move available balance into frozen balance.",
    icon: Snowflake,
  },
  {
    value: "unfreeze",
    label: "Unfreeze Balance",
    description: "Release frozen balance back to available balance.",
    icon: Zap,
  },
];

export default function BalanceAdjuster({ userId, onDone }) {
  const { t } = useTranslation();

  const [coin, setCoin] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState("add");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [refresh, setRefresh] = useState(0);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const selectedAction =
    actionOptions.find((item) => item.value === action) || actionOptions[0];

  const SelectedIcon = selectedAction.icon;

  const getSubmitText = () => {
    if (action === "add") return `Add ${amount || "0"} ${coin}`;
    if (action === "reduce") return `Reduce ${amount || "0"} ${coin}`;
    if (action === "freeze") return `Freeze ${amount || "0"} ${coin}`;
    if (action === "unfreeze") return `Unfreeze ${amount || "0"} ${coin}`;
    return "Submit";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedAmount = Number.parseFloat(amount);

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setMsg(t("balance.invalidAmount") || "Please enter a valid amount.");
      setMsgType("error");
      setTimeout(() => {
        setMsg("");
        setMsgType("");
      }, 3500);
      return;
    }

    setLoading(true);
    setMsg("");
    setMsgType("");

    try {
      let url;
      let payload;

      if (action === "add") {
        url = `${API_BASE}/api/admin/add-balance`;
        payload = { user_id: userId, coin, amount: parsedAmount };
      }

      if (action === "reduce") {
        url = `${API_BASE}/api/admin/user/${userId}/reduce-balance`;
        payload = { coin, amount: parsedAmount };
      }

      if (action === "freeze") {
        url = `${API_BASE}/api/admin/freeze-balance`;
        payload = { user_id: userId, coin, amount: parsedAmount };
      }

      if (action === "unfreeze") {
        url = `${API_BASE}/api/admin/unfreeze-balance`;
        payload = { user_id: userId, coin, amount: parsedAmount };
      }

      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg(res.data.message || t("balance.success") || "Balance updated.");
      setMsgType("success");
      setRefresh((value) => value + 1);
      setAmount("");

      if (onDone) onDone();

      setTimeout(() => {
        setMsg("");
        setMsgType("");
      }, 4000);
    } catch (err) {
      setMsg(
        err.response?.data?.message ||
          t("balance.error") ||
          "Error processing request."
      );
      setMsgType("error");

      setTimeout(() => {
        setMsg("");
        setMsgType("");
      }, 4000);
    }

    setLoading(false);
  };

  return (
    <div className="admin-balance-adjuster">
      <section className="admin-balance-panel">
        <div className="admin-balance-panel-head">
          <div>
            <div className="admin-balance-kicker">
              <WalletCards size={17} />
              Balance Adjustment
            </div>

            <h2>Adjust User Balance</h2>
            <p>
              Choose one action, enter the exact amount, and submit. No quick
              buttons, no clutter.
            </p>
          </div>

          <div className="admin-balance-selected-user">
            <UserRound size={18} />
            <div>
              <span>Selected User</span>
              <strong>#{userId}</strong>
            </div>
          </div>
        </div>

        <form className="admin-balance-form" onSubmit={handleSubmit}>
          <div className="admin-balance-grid">
            <label className="admin-balance-field">
              <span>Coin</span>
              <select value={coin} onChange={(e) => setCoin(e.target.value)}>
                {coinOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-balance-field">
              <span>Amount</span>
              <div className="admin-balance-input-wrap">
                <DollarSign size={17} />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
            </label>
          </div>

          <div className="admin-balance-action-group">
            {actionOptions.map((item) => {
              const Icon = item.icon;
              const active = action === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  className={
                    active
                      ? `admin-balance-action active ${item.value}`
                      : "admin-balance-action"
                  }
                  onClick={() => setAction(item.value)}
                >
                  <Icon size={18} />
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className={`admin-balance-submit-card ${action}`}>
            <div>
              <div className="admin-balance-submit-icon">
                <SelectedIcon size={20} />
              </div>

              <div>
                <strong>{selectedAction.label}</strong>
                <span>
                  {amount
                    ? `${Number(amount).toLocaleString()} ${coin}`
                    : `Enter amount in ${coin}`}
                </span>
              </div>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="admin-balance-spin" />
                  Processing...
                </>
              ) : (
                getSubmitText()
              )}
            </button>
          </div>

          {msg && (
            <div className={`admin-balance-message ${msgType}`}>
              {msgType === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{msg}</span>
            </div>
          )}
        </form>
      </section>

      <section className="admin-balance-panel">
        <div className="admin-balance-table-head">
          <div className="admin-balance-table-icon">
            <Coins size={18} />
          </div>

          <div>
            <h3>{t("balance.userBalances") || "User Balances"}</h3>
            <p>Current available and frozen balances for this user.</p>
          </div>
        </div>

        <div className="admin-balance-table-wrap">
          <UserBalanceTable userId={userId} refresh={refresh} />
        </div>
      </section>
    </div>
  );
}