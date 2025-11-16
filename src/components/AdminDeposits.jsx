import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Image } from "lucide-react";
import { API_BASE } from "../config";

// Supabase Storage config
const SUPABASE_PUBLIC_URL = "https://zgnefojwdijycgcqngke.supabase.co/storage/v1/object/public/deposit";

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDeposits();
    // eslint-disable-next-line
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/deposits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch deposits");
      setDeposits(data);
      // DEBUG: Log deposit data to console
      console.log("DEPOSIT DATA:", data);
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
          ? `${API_BASE}/api/admin/deposits/${id}/approve`
          : `${API_BASE}/api/admin/deposits/${id}/deny`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${action} deposit`);
      fetchDeposits();
    } catch (err) {
      setError(err.message || "Network error");
    }
    setActionLoading(null);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-2 sm:px-6 py-8 rounded-2xl shadow-2xl bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 border border-white/5">
      <h2 className="text-2xl font-bold text-[#ffd700] mb-6 tracking-tight">User Deposit Requests</h2>
      {error && <div className="bg-gradient-to-r from-[#f34e6d]/90 to-[#fbbf24]/80 text-white p-2 rounded-lg mb-4 font-semibold shadow">{error}</div>}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-[#FFD700] mr-2" size={30} />
          <span className="text-yellow-200 font-bold">Loading deposits...</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <table className="admin-table min-w-[700px]">
            <thead>
  <tr>
    <th>ID</th>
    <th>User</th>
    <th>Coin</th>
    <th>Amount</th>
    <th>Status</th>
    <th>Time</th>
    <th>Slip</th>
    <th>Action</th>
  </tr>
</thead>
            <tbody>
              {deposits.map((d, idx) => (
                <tr key={`deposit-${d.id || idx}-${d.user_id || "x"}`}>
                  <td>{d.id}</td>
                  <td>{d.user_id}</td>
                  <td className="font-bold text-base">{d.coin || "USDT"}</td>
                  <td>
                    <span className="font-bold text-[#FFD700]">
                      {parseFloat(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td>
                    {d.status === "approved" && (
                      <span className="flex items-center gap-1 text-green-400 font-bold">
                        <CheckCircle2 size={16} /> Approved
                      </span>
                    )}
                    {d.status === "pending" && (
                      <span className="flex items-center gap-1 text-yellow-300 font-bold">
                        <Loader2 size={16} className="animate-spin" /> Pending
                      </span>
                    )}
                    {d.status === "denied" || d.status === "rejected" ? (
                      <span className="flex items-center gap-1 text-red-400 font-bold">
                        <XCircle size={16} /> Denied
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <span className="text-xs">{d.created_at?.slice(0, 19).replace("T", " ")}</span>
                  </td>
                  {/* SLIP (Deposit Screenshot) */}
                  <td>
                    {d.screenshot ? (
                      (() => {
                        let encodedUrl;
                        if (!d.screenshot.includes('/')) {
                          // Flat style filename
                          encodedUrl = `${SUPABASE_PUBLIC_URL}/${encodeURIComponent(d.screenshot)}`;
                        } else if (d.screenshot.startsWith("/uploads/")) {
                          encodedUrl = `${API_BASE}${d.screenshot}`;
                        } else if (d.screenshot.startsWith("http")) {
                          encodedUrl = d.screenshot;
                        } else {
                          // Legacy (should not happen, but safe)
                          const pathParts = d.screenshot.split('/');
                          const fileName = encodeURIComponent(pathParts.pop());
                          encodedUrl = `${SUPABASE_PUBLIC_URL}/${pathParts.join('/')}/${fileName}`;
                        }
                        return (
                          <a
                            href={encodedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                            title="View deposit slip"
                          >
                            <img
                              src={encodedUrl}
                              alt="Deposit Screenshot"
                              className="rounded-md shadow border border-[#ffd70044] object-cover w-[48px] h-[48px] hover:scale-105 transition"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/48?text=No+Image";
                              }}
                            />
                          </a>
                        );
                      })()
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Image size={18} /> —
                      </span>
                    )}
                  </td>
                  
                  <td>
                    {d.status === "pending" ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleAction(d.id, "approve")}
                          className={`px-4 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#232836] shadow hover:opacity-90 transition flex items-center gap-1 ${actionLoading ? "opacity-60 cursor-wait" : ""}`}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === d.id + "approve" ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <>
                              <CheckCircle2 size={16} /> Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleAction(d.id, "deny")}
                          className={`px-4 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#f34e6d] to-[#ffd700] text-[#232836] shadow hover:opacity-90 transition flex items-center gap-1 ${actionLoading ? "opacity-60 cursor-wait" : ""}`}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === d.id + "deny" ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <>
                              <XCircle size={16} /> Deny
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 font-semibold">
  No deposits found.
</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
