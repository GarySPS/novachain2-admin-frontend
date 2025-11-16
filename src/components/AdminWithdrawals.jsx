import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, BadgeCheck, ArrowUpRight } from "lucide-react";
import { API_BASE } from "../config";


export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
    // eslint-disable-next-line
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch withdrawals");
      setWithdrawals(data);
    } catch (err) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const url =
        action === "approve"
          ? `${API_BASE}/api/admin/withdrawals/${id}/approve`
          : `${API_BASE}/api/admin/withdrawals/${id}/deny`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${action} withdrawal`);
      fetchWithdrawals(); // refresh after action
    } catch (err) {
      setError(err.message || "Network error");
    }
    setActionLoading(null);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-2 sm:px-6 py-8 rounded-2xl shadow-2xl bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 border border-white/5">
      <h2 className="flex items-center gap-2 text-2xl font-extrabold mb-6 tracking-tight text-[#ffd700]">
        <ArrowUpRight size={22} className="text-[#16d79c]" />
        All Withdrawals
      </h2>
      {error && (
        <div className="bg-gradient-to-r from-[#f34e6d]/80 to-[#fbbf24]/80 text-white p-2 rounded-lg mb-4 font-semibold shadow">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-[#FFD700] mr-2" size={30} />
          <span className="text-yellow-200 font-bold">Loading withdrawals...</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <table className="admin-table min-w-[800px]">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Coin</th>
                <th>Amount</th>
                <th>To Address</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 font-semibold">
                    No withdrawals found.
                  </td>
                </tr>
              )}
              {withdrawals.map((w, idx) => (
                <tr key={`withdrawal-${w.id || idx}`}>
                  <td>{w.id}</td>
                  <td>{w.user_id}</td>
                  <td className="font-bold text-base">{w.coin}</td>
                  <td>
                    <span className="font-bold text-[#FFD700]">
                      {parseFloat(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs break-all">{w.address}</span>
                  </td>
                  <td>
                    <span className="text-xs">{w.created_at?.slice(0, 19).replace('T', ' ')}</span>
                  </td>
                  <td>
                    {w.status === "approved" && (
                      <span className="flex items-center gap-1 text-green-400 font-bold">
                        <CheckCircle2 size={16} /> Approved
                      </span>
                    )}
                    {w.status === "pending" && (
                      <span className="flex items-center gap-1 text-yellow-300 font-bold">
                        <Loader2 className="animate-spin" size={16} /> Pending
                      </span>
                    )}
                    {w.status === "rejected" && (
                      <span className="flex items-center gap-1 text-red-400 font-bold">
                        <XCircle size={16} /> Rejected
                      </span>
                    )}
                    {w.status === "completed" && (
                      <span className="flex items-center gap-1 text-green-400 font-bold">
                        <BadgeCheck size={16} /> Completed
                      </span>
                    )}
                    {!w.status && (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td>
                    {w.status === "pending" ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleAction(w.id, "approve")}
                          className={`px-4 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#232836] shadow hover:opacity-90 transition flex items-center gap-1 ${actionLoading ? "opacity-60 cursor-wait" : ""}`}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === w.id + "approve" ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <>
                              <CheckCircle2 size={16} /> Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleAction(w.id, "deny")}
                          className={`px-4 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#f34e6d] to-[#ffd700] text-[#232836] shadow hover:opacity-90 transition flex items-center gap-1 ${actionLoading ? "opacity-60 cursor-wait" : ""}`}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === w.id + "deny" ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <>
                              <XCircle size={16} /> Deny
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-green-400 font-bold">✓</span>
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
