import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function UserBalanceTable({ userId, refresh }) {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    axios
      .get(`${API_BASE}/api/admin/user/${userId}/balances`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBalances(res.data.balances || []))
      .catch(() => setBalances([]))
      .finally(() => setLoading(false));
  }, [userId, refresh]);

  return (
    <div className="bg-[#1e2434] rounded-xl shadow-lg p-5 mt-10 max-w-2xl mx-auto overflow-x-auto">
      <h3 className="text-lg font-bold text-yellow-300 mb-3">
        User Balances
      </h3>
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <table className="min-w-full text-white border border-yellow-400">
          <thead>
            <tr className="bg-[#282c3e]">
              <th className="px-4 py-2 border-b border-yellow-400">Coin</th>
              <th className="px-4 py-2 border-b border-yellow-400">Balance</th>
              <th className="px-4 py-2 border-b border-yellow-400">Frozen</th>
            </tr>
          </thead>
          <tbody>
            {balances.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4">No balance found</td>
              </tr>
            )}
            {balances.map((b, i) => (
              <tr key={i} className="even:bg-[#22273a] odd:bg-[#181b25]">
                <td className="px-4 py-2 border-b border-yellow-400">{b.coin}</td>
                <td className="px-4 py-2 border-b border-yellow-400">{b.balance}</td>
                <td className="px-4 py-2 border-b border-yellow-400">{b.frozen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
