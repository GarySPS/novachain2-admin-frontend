import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Adjust this base URL if your admin API is hosted elsewhere
const API_BASE = "http://localhost:5001/api"; 

export default function AdminPhone() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPhoneUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/admin/phone-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      setError("Failed to fetch phone users.");
    }
  };

  useEffect(() => {
    fetchPhoneUsers();
  }, []);

  const handleApprove = async (id) => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/admin/phone-users/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccess(`User #${id} approved successfully!`);
        fetchPhoneUsers(); // Refresh list
      } else {
        setError("Failed to approve user.");
      }
    } catch (err) {
      setError("Server error while approving user.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-5">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          Phone Sign-ups (Pending Approval)
        </h2>
      </div>

      {error && <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg">{error}</div>}
      {success && <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 rounded-lg">{success}</div>}

      <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-[#151b2b]/50 shadow-xl backdrop-blur-md">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/80 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">ID</th>
              <th className="px-6 py-4 font-semibold">Username</th>
              <th className="px-6 py-4 font-semibold">Phone Number</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500">
                  No phone users found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                // Extract clean phone number by stripping out "@phone.demo"
                const cleanPhone = u.email ? u.email.replace("@phone.demo", "") : "N/A";
                
                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{u.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-200">{u.username}</td>
                    <td className="px-6 py-4 font-mono text-sky-400">{cleanPhone}</td>
                    <td className="px-6 py-4">
                      {u.verified ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!u.verified && (
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-900 transition shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}