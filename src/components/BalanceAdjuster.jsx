// src/components/BalanceAdjuster.jsx
import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import UserBalanceTable from "./UserBalanceTable"; // Import here

export default function BalanceAdjuster({ userId }) {
  const [coin, setCoin] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState("add"); // 'add', 'reduce', or 'freeze'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [refresh, setRefresh] = useState(0); // Add refresh state

  const token = localStorage.getItem("adminToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      let url, payload;
      if (action === "add") {
        url = `${API_BASE}/api/admin/add-balance`;
        payload = { user_id: userId, coin, amount };
      } else if (action === "reduce") {
        url = `${API_BASE}/api/admin/user/${userId}/reduce-balance`;
        payload = { coin, amount };
      } else if (action === "freeze") {
        url = `${API_BASE}/api/admin/freeze-balance`;
        payload = { user_id: userId, coin, amount };
      }
      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg(res.data.message || "Success!");
      setRefresh(v => v + 1); // Refresh the table after submit
    } catch (err) {
      setMsg(err.response?.data?.message || "Error");
    }
    setLoading(false);
  };

  return (
    <div>
      <form 
        onSubmit={handleSubmit} 
        className="bg-[#1e2434] rounded-xl shadow-lg p-6 max-w-md w-full mx-auto"
      >
        <h2 className="text-yellow-400 font-extrabold text-lg mb-6">
          Manual Add/Reduce/Freeze User Balance
        </h2>

        <div className="mb-5 flex flex-col sm:flex-row items-center gap-4">
          <label htmlFor="coin" className="text-white font-semibold w-24">
            Coin:
          </label>
          <select
            id="coin"
            value={coin}
            onChange={e => setCoin(e.target.value)}
            className="flex-1 bg-[#2a3048] border border-yellow-400 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="TON">TON</option>
            <option value="SOL">SOL</option>
            <option value="XRP">XRP</option>
          </select>
        </div>

        <div className="mb-5 flex flex-col sm:flex-row items-center gap-4">
          <label htmlFor="amount" className="text-white font-semibold w-24">
            Amount:
          </label>
          <input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            placeholder="Enter amount"
            className="flex-1 bg-[#2a3048] border border-yellow-400 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
          <label htmlFor="action" className="text-white font-semibold w-24">
            Action:
          </label>
          <select
            id="action"
            value={action}
            onChange={e => setAction(e.target.value)}
            className="flex-1 bg-[#2a3048] border border-yellow-400 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="add">Add Balance</option>
            <option value="reduce">Reduce Balance</option>
            <option value="freeze">Freeze Balance</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-400 to-green-400 text-[#181b25] font-bold py-3 rounded-xl shadow-md hover:from-yellow-500 hover:to-green-500 active:scale-95 transition-transform"
        >
          {loading ? "Processing..." : "Submit"}
        </button>

        {msg && (
          <div className="mt-4 text-center text-yellow-400 font-semibold">
            {msg}
          </div>
        )}
      </form>

      {/* --- User Balance Table Below the Form --- */}
      <div className="mt-10">
        <UserBalanceTable userId={userId} refresh={refresh} />
      </div>
    </div>
  );
}
