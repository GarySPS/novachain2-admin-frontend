import React, { useEffect, useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { API_BASE } from "../config";


export default function AdminTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrades();
    // eslint-disable-next-line
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/trades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch trades");
      setTrades(data);
    } catch (err) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

  const handleSetTradeResult = async (tradeId, result) => {
  try {
    const token = localStorage.getItem("adminToken");
const res = await fetch(`${API_BASE}/api/admin/update-trade`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ tradeId, result }),
});

    if (!res.ok) throw new Error("Failed to update trade result");
    fetchTrades();
  } catch (err) {
    alert(err.message || "Failed to update trade result");
  }
};


  return (
    <div className="max-w-6xl mx-auto mt-10 px-2 sm:px-6 py-8 rounded-2xl shadow-2xl bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 border border-white/5">
      <h2 className="flex items-center gap-2 text-2xl font-extrabold mb-6 tracking-tight text-[#ffd700]">
        <TrendingUp size={24} className="text-[#16d79c]" />
        All Trades
      </h2>
      {error && (
        <div className="bg-gradient-to-r from-[#f34e6d]/90 to-[#fbbf24]/80 text-white p-2 rounded-lg mb-4 font-semibold shadow">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-[#FFD700] mr-2" size={30} />
          <span className="text-yellow-200 font-bold">Loading trades...</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <table className="admin-table min-w-[700px]">
            <thead>
  <tr>
    <th>Trade ID</th>
    <th>User ID</th>
    <th>Direction</th>
    <th>Amount</th>
    <th>Result</th>
    <th>Duration</th>
    <th>Date</th>
    <th>Actions</th>
  </tr>
</thead>

            <tbody>
              {trades.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-semibold">
                    No trades found.
                  </td>
                </tr>
              )}
{trades.map((trade) => (
  <tr
    key={trade.id}
    className="border-b border-[#23283644] hover:bg-[#232836cc] transition font-semibold"
  >
    <td>{trade.id}</td>
    <td>{trade.user_id}</td>
    <td className="capitalize">{trade.direction}</td>
    <td>
      <span className="font-bold text-[#FFD700]">
        {parseFloat(trade.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </td>
    <td>
      {trade.result === "Pending" && (
        <span className="flex items-center gap-1 text-yellow-400 font-bold">
          <Loader2 className="animate-spin" size={15} /> Pending
        </span>
      )}
      {trade.result === "Win" && (
        <span className="text-green-400 font-bold">Win</span>
      )}
      {trade.result === "Loss" && (
        <span className="text-red-400 font-bold">Lose</span>
      )}
    </td>
    <td>{trade.duration}</td>
    <td>
      <span className="text-xs">
        {trade.created_at?.slice(0, 19).replace("T", " ")}
      </span>
    </td>
    <td>
      {trade.result === "Pending" && (
        <>
          <button
            onClick={() => handleSetTradeResult(trade.id, "Win")}
            className="px-2 py-1 bg-green-600 rounded text-white hover:bg-green-700 mr-2 text-xs"
          >
            Set Win
          </button>
          <button
            onClick={() => handleSetTradeResult(trade.id, "Loss")}
            className="px-2 py-1 bg-red-600 rounded text-white hover:bg-red-700 text-xs"
          >
            Set Lose
          </button>
        </>
      )}
    </td>
  </tr>
))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
