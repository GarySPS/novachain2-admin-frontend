import React, { useEffect, useState, useRef } from "react";
import { UserCircle2, BadgeCheck, XCircle, Loader2 } from "lucide-react";
import { API_BASE } from "../config";

const MAIN_API_BASE = "https://novachain-backend.onrender.com";

// KYC image resolver (always uses main backend for /uploads)
function resolveKYCUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/uploads/")) return `${MAIN_API_BASE}${raw}`;
  return `${MAIN_API_BASE}/uploads/${raw}`;
}

function formatDate(dt) {
  if (!dt) return "N/A";
  try {
    const d = new Date(dt);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "N/A";
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [userWinModes, setUserWinModes] = useState({});
  const [userIdSearch, setUserIdSearch] = useState("");

  // Scroll refs for sync
  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);

  // Sync the top and main table scrollbars
  useEffect(() => {
    const topDiv = topScrollRef.current;
    const tableDiv = tableScrollRef.current;
    if (!topDiv || !tableDiv) return;

    const onTopScroll = () => {
      if (tableDiv.scrollLeft !== topDiv.scrollLeft) tableDiv.scrollLeft = topDiv.scrollLeft;
    };
    const onTableScroll = () => {
      if (topDiv.scrollLeft !== tableDiv.scrollLeft) topDiv.scrollLeft = tableDiv.scrollLeft;
    };

    topDiv.addEventListener("scroll", onTopScroll);
    tableDiv.addEventListener("scroll", onTableScroll);

    return () => {
      topDiv.removeEventListener("scroll", onTopScroll);
      tableDiv.removeEventListener("scroll", onTableScroll);
    };
  }, []);

  // Fetch users from admin API (sorted DESC)
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");
      data = Array.isArray(data) ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];
      setUsers(data);
    } catch (err) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

// Find and replace your current fetchWinModes with this:
const fetchWinModes = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`${API_BASE}/api/admin/user-win-modes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    // Convert array to object map
    const modeMap = {};
    (Array.isArray(data) ? data : []).forEach((u) => {
      modeMap[u.id] = u.mode;
    });
    setUserWinModes(modeMap);
  } catch {
    setUserWinModes({});
  }
};

  // Set WIN/LOSE mode for user
  const setUserWinMode = async (user_id, mode) => {
    setActionLoading(user_id + "-winmode");
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_BASE}/api/admin/users/${user_id}/trade-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: mode === null ? null : mode.toUpperCase() }),
      });
      await fetchWinModes();
    } catch (err) {
      setError(err.message || "Failed to update win mode");
    }
    setActionLoading(null);
  };

  // Approve/Reject KYC
  const handleKYCStatus = async (user_id, kyc_status) => {
    setActionLoading(user_id + "-kyc");
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_BASE}/api/admin/user-kyc-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id, kyc_status }),
      });
      await fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to update KYC status");
    }
    setActionLoading(null);
  };

  // Delete user
  const deleteUser = async (user_id) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setActionLoading(user_id + "-delete");
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_BASE}/api/admin/user/${user_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to delete user");
    }
    setActionLoading(null);
  };

  useEffect(() => {
    fetchUsers();
    fetchWinModes();
    // eslint-disable-next-line
  }, []);

  // Filtered users by userIdSearch
  const filteredUsers = users.filter((user) => {
    if (!userIdSearch) return true;
    return String(user.id).toLowerCase().includes(userIdSearch.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto mt-10 px-2 sm:px-6 py-8 rounded-2xl shadow-2xl bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 border border-white/5">
      <h2 className="flex items-center gap-2 text-2xl font-extrabold mb-6 tracking-tight text-[#ffd700]">
        <UserCircle2 size={24} className="text-[#16d79c]" />
        All Users
      </h2>

      {/* Search Box */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by User ID"
          className="px-4 py-2 rounded-xl border border-[#232836] bg-[#191e29] text-[#ffd700] font-semibold w-64 shadow"
          value={userIdSearch}
          onChange={e => setUserIdSearch(e.target.value)}
        />
        {userIdSearch && (
          <button
            className="ml-2 px-2 py-1 bg-[#f34e6d] text-white rounded-lg text-xs"
            onClick={() => setUserIdSearch("")}
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="bg-gradient-to-r from-[#f34e6d]/80 to-[#fbbf24]/80 text-white p-2 rounded-lg mb-4 font-semibold shadow">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-[#FFD700] mr-2" size={30} />
          <span className="text-yellow-200 font-bold">Loading users...</span>
        </div>
      ) : (
        <>
          {/* --- TOP SCROLLBAR (SYNCS WITH TABLE) --- */}
          <div ref={topScrollRef} className="overflow-x-auto rounded-xl max-w-full mb-2" style={{ height: 12 }}>
            <div style={{ minWidth: "1300px", height: 1 }} />
          </div>

          {/* --- TABLE with scrollable wrapper (SYNCS WITH TOP) --- */}
          <div ref={tableScrollRef} className="overflow-x-auto rounded-xl max-w-full" style={{ position: "relative" }}>
            <table className="admin-table min-w-[1300px]">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Selfie</th>
                  <th>ID Card</th>
                  <th>KYC Status</th>
                  <th>Sign Up Date</th>
                  <th>Current Mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9}>No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.email}</td>
                      <td>{user.password}</td>
                      {/* Selfie */}
                      <td>
                        {user.kyc_selfie ? (
                          <img
                            src={resolveKYCUrl(user.kyc_selfie)}
                            alt="Selfie"
                            style={{
                              width: "62px",
                              height: "62px",
                              objectFit: "cover",
                              borderRadius: "10px",
                              border: "2px solid #16d79c",
                              boxShadow: "0 2px 8px #0002",
                              display: "block",
                              margin: "auto",
                            }}
                            onError={e => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                      {/* ID Card */}
                      <td>
                        {user.kyc_id_card ? (
                          <img
                            src={resolveKYCUrl(user.kyc_id_card)}
                            alt="ID Card"
                            style={{
                              width: "62px",
                              height: "62px",
                              objectFit: "cover",
                              borderRadius: "10px",
                              border: "2px solid #ffd700",
                              boxShadow: "0 2px 8px #0002",
                              display: "block",
                              margin: "auto",
                            }}
                            onError={e => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                      {/* KYC Status */}
                      <td>
                        {user.kyc_status === "approved" && (
                          <span className="flex items-center gap-1 text-green-400 font-bold">
                            <BadgeCheck size={14} /> Approved
                          </span>
                        )}
                        {user.kyc_status === "rejected" && (
                          <span className="flex items-center gap-1 text-red-400 font-bold">
                            <XCircle size={14} /> Rejected
                          </span>
                        )}
                        {user.kyc_status === "pending" && (
                          <>
                            <span className="flex items-center gap-1 text-yellow-400 font-bold">
                              Pending
                            </span>
                            {user.kyc_selfie && user.kyc_id_card && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleKYCStatus(user.id, "approved")}
                                  disabled={actionLoading === user.id + "-kyc"}
                                  className="px-2 py-1 bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#181b25] rounded-lg font-bold shadow hover:opacity-90 transition flex items-center gap-1 text-xs"
                                >
                                  {actionLoading === user.id + "-kyc"
                                    ? <Loader2 className="animate-spin" size={15} />
                                    : <BadgeCheck size={15} />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleKYCStatus(user.id, "rejected")}
                                  disabled={actionLoading === user.id + "-kyc"}
                                  className="px-2 py-1 bg-gradient-to-r from-[#f34e6d] to-[#ffd700] text-[#181b25] rounded-lg font-bold shadow hover:opacity-90 transition flex items-center gap-1 text-xs"
                                >
                                  <XCircle size={15} /> Reject
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      {/* Sign Up Date */}
                      <td>{formatDate(user.created_at)}</td>
                      {/* Current Mode */}
                      <td>
                        <div className="flex flex-col gap-1">
                          {userWinModes[user.id] === "WIN" && (
                            <span className="px-2 py-1 rounded-lg bg-green-800 text-green-300 font-bold text-xs shadow mb-1">WIN</span>
                          )}
                          {userWinModes[user.id] === "LOSE" && (
                            <span className="px-2 py-1 rounded-lg bg-red-900 text-red-300 font-bold text-xs shadow mb-1">LOSE</span>
                          )}
                          {!userWinModes[user.id] && (
                            <span className="px-2 py-1 rounded-lg bg-gray-800 text-gray-400 font-semibold text-xs shadow mb-1">DEFAULT</span>
                          )}
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() => setUserWinMode(user.id, userWinModes[user.id] === "WIN" ? null : "WIN")}
                              className={`px-2 py-1 rounded-lg text-xs font-bold shadow transition flex items-center gap-1 ${
                                userWinModes[user.id] === "WIN"
                                  ? "bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#232836] ring-2 ring-[#16d79c66]"
                                  : "bg-[#18241a] text-green-300"
                              }`}
                              disabled={actionLoading === user.id + "-winmode"}
                            >
                              {userWinModes[user.id] === "WIN" ? <BadgeCheck size={14} /> : null}
                              {userWinModes[user.id] === "WIN" ? "Auto Win" : "Set Win"}
                            </button>
                            <button
                              onClick={() => setUserWinMode(user.id, userWinModes[user.id] === "LOSE" ? null : "LOSE")}
                              className={`px-2 py-1 rounded-lg text-xs font-bold shadow transition flex items-center gap-1 ${
                                userWinModes[user.id] === "LOSE"
                                  ? "bg-gradient-to-r from-[#f34e6d] to-[#ffd700] text-[#232836] ring-2 ring-[#ffd70066]"
                                  : "bg-[#24181a] text-red-300"
                              }`}
                              disabled={actionLoading === user.id + "-winmode"}
                            >
                              {userWinModes[user.id] === "LOSE" ? <XCircle size={14} /> : null}
                              {userWinModes[user.id] === "LOSE" ? "Auto Lose" : "Set Lose"}
                            </button>
                          </div>
                        </div>
                      </td>
                      {/* Actions */}
                      <td>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="px-3 py-1 bg-gradient-to-r from-[#f34e6d] to-[#ffd700] rounded-lg text-xs font-bold text-[#181b25] shadow hover:opacity-90 transition flex items-center gap-1"
                          disabled={actionLoading === user.id + "-delete"}
                        >
                          <XCircle size={14} />
                          {actionLoading === user.id + "-delete" ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- BOTTOM SCROLL (optional, as before) --- */}
          <div className="overflow-x-auto rounded-xl max-w-full mt-2">
            <div style={{ minWidth: "1300px", height: "6px" }} />
          </div>
        </>
      )}
    </div>
  );
}
