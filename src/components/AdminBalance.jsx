// src/components/AdminBalance.jsx
import React, { useState } from "react";
import BalanceAdjuster from "./BalanceAdjuster";
import { API_BASE } from "../config";

export default function AdminBalance() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setMsg("");
    setUser(null);
    if (!search) return setMsg("Enter User ID or Email");
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let users = await res.json();
      if (!res.ok) throw new Error(users.message || "Failed to fetch users");
      let found = users.find(
        (u) =>
          String(u.id) === String(search) ||
          (u.email && u.email.toLowerCase() === search.toLowerCase())
      );
      if (!found) {
        setMsg("User not found.");
        setUser(null);
      } else {
        setUser(found);
      }
    } catch (err) {
      setMsg(err.message || "Error searching user");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-[#16192a]/80 rounded-2xl shadow-2xl mt-6">
      <h2 className="text-2xl font-extrabold mb-4 text-[#ffd700]">Manual Add/Reduce/Freeze User Balance</h2>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          className="flex-1 px-3 py-2 rounded-lg border border-[#ffd700]/40 bg-[#191e29] text-[#ffd700] font-semibold shadow"
          placeholder="Enter User ID or Email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-gradient-to-r from-[#ffd700] to-[#16d79c] rounded-lg font-bold text-[#181b25] shadow hover:opacity-90"
          disabled={loading}
        >
          {loading ? "Searching..." : "Find"}
        </button>
      </form>
      {msg && <div className="text-red-400 font-bold mb-3">{msg}</div>}
      {user && (
        <div className="p-4 bg-[#181b25] rounded-xl shadow-inner mt-2">
          <div className="mb-2">
            <b>User:</b> {user.email} <b>ID:</b> {user.id}
          </div>
          <BalanceAdjuster userId={user.id} onDone={() => setMsg("Balance updated!")} />
        </div>
      )}
    </div>
  );
}
