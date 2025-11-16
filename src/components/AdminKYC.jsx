//src>components>AdminKYC.jsx

import React, { useEffect, useState } from "react";
import { UserCircle2, BadgeCheck, XCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { API_BASE as ADMIN_API_BASE } from "../config";

export default function AdminKYC() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // --- Token getter
  const getToken = () => localStorage.getItem("adminToken");

  // --- Fetch individual KYC images (with token)
  const fetchUserKYC = async (userId) => {
    try {
      const token = getToken();
      const res = await fetch(`${ADMIN_API_BASE}/api/admin/user/${userId}/kyc`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  };

  // --- Main load (user list + KYC for each)
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(`${ADMIN_API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");
      // For each user, fetch KYC images
      const usersWithKYC = await Promise.all(data.map(async (u) => {
        const kyc = await fetchUserKYC(u.id);
        return { ...u, ...kyc };
      }));
      setUsers(usersWithKYC);
    } catch (err) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  // --- Approve/Reject KYC
  const handleKYC = async (user_id, status) => {
    setActionLoading(user_id + status);
    try {
      const token = getToken();
      const res = await fetch(`${ADMIN_API_BASE}/kyc/admin/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update KYC");
      await load();
    } catch (err) {
      setError(err.message || "Network error");
    }
    setActionLoading(null);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-2 sm:px-6 py-8 rounded-2xl shadow-2xl bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 border border-white/5">
      <h2 className="text-2xl font-extrabold mb-6 tracking-tight text-[#ffd700] flex items-center gap-2">
        <BadgeCheck size={24} className="text-[#16d79c]" />
        KYC Requests
      </h2>
      {error && (
        <div className="bg-gradient-to-r from-[#f34e6d]/80 to-[#fbbf24]/80 text-white p-2 rounded-lg mb-4 font-semibold shadow">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-[#FFD700] mr-2" size={30} />
          <span className="text-yellow-200 font-bold">Loading...</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <table className="admin-table min-w-[700px]">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Selfie</th>
                <th>ID Card</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.kyc_status && u.kyc_status !== "approved").length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 font-semibold">
                    No pending KYC requests.
                  </td>
                </tr>
              )}
              {users
                .filter(u => u.kyc_status && u.kyc_status !== "approved")
                .map(u => (
                  <tr key={u.id}>
                    <td className="flex items-center gap-2">
                      <UserCircle2 size={20} className="text-[#ffd700]" />
                      <span className="font-bold">{u.username || `User #${u.id}`}</span>
                    </td>
                    <td className="font-medium">{u.email}</td>
                    <td>
                      {u.kyc_selfie ? (
                        <a
                          href={u.kyc_selfie}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1a2334] text-[#16d79c] font-semibold hover:bg-[#1f2937] transition"
                        >
                          <ImageIcon size={17} className="mr-1" />
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td>
                      {u.kyc_id_card ? (
                        <a
                          href={u.kyc_id_card}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1a2334] text-[#3af0ff] font-semibold hover:bg-[#1f2937] transition"
                        >
                          <ImageIcon size={17} className="mr-1" />
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td>
                      {u.kyc_status === "pending" && (
                        <span className="px-3 py-1 rounded-full bg-[#fffbe880] text-yellow-700 font-bold text-xs flex items-center gap-1">
                          <Loader2 size={14} className="animate-spin text-[#FFD700]" /> Pending
                        </span>
                      )}
                      {u.kyc_status === "rejected" && (
                        <span className="px-3 py-1 rounded-full bg-[#ffd3d3]/80 text-red-700 font-bold text-xs flex items-center gap-1">
                          <XCircle size={14} className="text-red-400" /> Rejected
                        </span>
                      )}
                    </td>
                    <td>
                      {u.kyc_status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            className={`px-4 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#232836] shadow hover:opacity-90 transition flex items-center gap-1 ${actionLoading ? "opacity-60 cursor-wait" : ""}`}
                            onClick={() => handleKYC(u.id, "approved")}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === u.id + "approved" ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <>
                                <BadgeCheck size={16} /> Approve
                              </>
                            )}
                          </button>
                          <button
                            className={`px-4 py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#f34e6d] to-[#ffd700] text-[#232836] shadow hover:opacity-90 transition flex items-center gap-1 ${actionLoading ? "opacity-60 cursor-wait" : ""}`}
                            onClick={() => handleKYC(u.id, "rejected")}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === u.id + "rejected" ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <>
                                <XCircle size={16} /> Reject
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
