// src/components/AdminUsers.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Eye,
  ImageIcon,
  Loader2,
  LogIn,
  ChevronLeft,
ChevronRight,
RefreshCcw,
Search,
Trash2,
UserCircle2,
  X,
  XCircle,
  Key,
} from "lucide-react";
import { API_BASE } from "../config";

const MAIN_API_BASE = "https://novachain2-backend.onrender.com";
const USER_FRONTEND_URL = "https://novachain2-frontend.vercel.app";

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
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

function getKycLabel(status) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

export default function AdminUsers() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [userWinModes, setUserWinModes] = useState({});
  const [userIdSearch, setUserIdSearch] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [resetModal, setResetModal] = useState({ 
    isOpen: false, 
    user: null, 
    newPassword: "" 
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      data = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];

      setUsers(data);
    } catch (err) {
      setError(err.message || "Network error");
    }

    setLoading(false);
  };

  const fetchWinModes = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/user-win-modes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const modeMap = {};

      (Array.isArray(data) ? data : []).forEach((u) => {
        modeMap[u.id] = u.mode;
      });

      setUserWinModes(modeMap);
    } catch {
      setUserWinModes({});
    }
  };

  const setUserWinMode = async (user_id, mode) => {
    setActionLoading(user_id + "-winmode");
    setError("");

    try {
      const token = localStorage.getItem("adminToken");

      await fetch(`${API_BASE}/api/admin/users/${user_id}/trade-mode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode: mode === null ? null : mode.toUpperCase(),
        }),
      });

      await fetchWinModes();
    } catch (err) {
      setError(err.message || t("users.updateError"));
    }

    setActionLoading(null);
  };

  const handleKYCStatus = async (user_id, kyc_status) => {
    setActionLoading(user_id + "-kyc");
    setError("");

    try {
      const token = localStorage.getItem("adminToken");

      await fetch(`${API_BASE}/api/admin/user-kyc-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id, kyc_status }),
      });

      await fetchUsers();
    } catch (err) {
      setError(err.message || t("users.kycUpdateError"));
    }

    setActionLoading(null);
  };

  const deleteUser = async (user_id) => {
    if (!window.confirm(t("users.deleteConfirm"))) return;

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
      setError(err.message || t("users.deleteError"));
    }

    setActionLoading(null);
  };

  const generateNewPassword = async (user_id) => {
    setActionLoading(user_id + "-reset");
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/user/${user_id}/reset-password`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      setResetModal({
        isOpen: true,
        user: users.find((u) => u.id === user_id),
        newPassword: data.newPassword,
      });
    } catch (err) {
      setError(err.message || "Failed to generate password");
    }

    setActionLoading(null);
  };

  const loginAsUser = async (user) => {
    setActionLoading(user.id + "-login");
    setError("");

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_BASE}/api/admin/impersonate/${user.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to login as user");
      }

      localStorage.setItem("impersonateToken", data.userToken);
      localStorage.setItem("impersonatedUserId", user.id);
      localStorage.setItem("impersonatedUserEmail", user.email);

      window.open(
        `${USER_FRONTEND_URL}/login?impersonate=true&token=${data.userToken}`,
        "_blank"
      );
    } catch (err) {
      setError(err.message || t("users.loginError"));
    }

    setActionLoading(null);
  };

  useEffect(() => {
    fetchUsers();
    fetchWinModes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
  if (!userIdSearch) return users;

  return users.filter((user) =>
    String(user.id).toLowerCase().includes(userIdSearch.toLowerCase())
  );
}, [users, userIdSearch]);

const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
const safeCurrentPage = Math.min(currentPage, totalPages);
const startIndex = (safeCurrentPage - 1) * pageSize;
const endIndex = startIndex + pageSize;
const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

const showingFrom = filteredUsers.length === 0 ? 0 : startIndex + 1;
const showingTo = Math.min(endIndex, filteredUsers.length);

useEffect(() => {
  setCurrentPage(1);
}, [userIdSearch, pageSize]);

const approvedCount = users.filter((user) => user.kyc_status === "approved").length;
  const pendingCount = users.filter((user) => user.kyc_status === "pending").length;

  return (
    <section className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <div className="admin-users-kicker">
            <UserCircle2 size={17} />
            User Control
          </div>

          <h1>{t("users.title")}</h1>
          <p>
            Manage registered users, KYC documents, impersonation access, and
            user trade modes.
          </p>
        </div>

        <button type="button" className="admin-users-refresh" onClick={() => {
          fetchUsers();
          fetchWinModes();
        }}>
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="admin-users-stats">
        <div className="admin-users-stat">
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </div>

        <div className="admin-users-stat">
          <span>KYC Approved</span>
          <strong>{approvedCount}</strong>
        </div>

        <div className="admin-users-stat">
          <span>KYC Pending</span>
          <strong>{pendingCount}</strong>
        </div>
      </div>

      <div className="admin-users-toolbar">
        <div className="admin-users-search">
          <Search size={18} />
          <input
            type="text"
            placeholder={t("users.searchById")}
            value={userIdSearch}
            onChange={(e) => setUserIdSearch(e.target.value)}
          />

          {userIdSearch && (
            <button type="button" onClick={() => setUserIdSearch("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="admin-users-count">
          Showing <strong>{filteredUsers.length}</strong> users
        </div>
      </div>

      {error && (
        <div className="admin-users-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-users-loading">
          <Loader2 className="admin-users-spin" size={26} />
          <span>{t("common.loading")}</span>
        </div>
      ) : (
        <div className="admin-users-table-card">
          <div className="admin-users-table-scroll">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>{t("users.userId")}</th>
                  <th>{t("users.email")}</th>
                  <th>{t("users.loginAs")}</th>
                  <th>{t("users.selfie")}</th>
                  <th>{t("users.idCard")}</th>
                  <th>{t("users.kycStatus")}</th>
                  <th>{t("users.signUpDate")}</th>
                  <th>{t("users.currentMode")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="admin-users-empty">
                        <UserCircle2 size={28} />
                        <strong>{t("users.noUsers")}</strong>
                        <span>No matching user found.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const selfieUrl = resolveKYCUrl(user.kyc_selfie);
                    const idCardUrl = resolveKYCUrl(user.kyc_id_card);
                    const mode = userWinModes[user.id];
                    const kycLabel = getKycLabel(user.kyc_status);

                    return (
                      <tr key={user.id}>
                        <td>
                          <span className="admin-users-id">#{user.id}</span>
                        </td>

                        <td>
                          <div className="admin-users-email">
                            <strong>{user.email}</strong>
                            <span>User account</span>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => loginAsUser(user)}
                            disabled={actionLoading === user.id + "-login"}
                            className="admin-users-action-btn login"
                          >
                            {actionLoading === user.id + "-login" ? (
                              <Loader2 className="admin-users-spin" size={15} />
                            ) : (
                              <LogIn size={15} />
                            )}
                            <span>{t("users.loginAs")}</span>
                          </button>
                        </td>

                        <td>
                          {selfieUrl ? (
                            <button
                              type="button"
                              className="admin-users-kyc-thumb"
                              onClick={() =>
                                setPreviewImage({
                                  url: selfieUrl,
                                  title: `User #${user.id} Selfie`,
                                })
                              }
                            >
                              <img
                                src={selfieUrl}
                                alt="Selfie"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <span>
                                <Eye size={14} />
                              </span>
                            </button>
                          ) : (
                            <span className="admin-users-na">N/A</span>
                          )}
                        </td>

                        <td>
                          {idCardUrl ? (
                            <button
                              type="button"
                              className="admin-users-kyc-thumb"
                              onClick={() =>
                                setPreviewImage({
                                  url: idCardUrl,
                                  title: `User #${user.id} ID Card`,
                                })
                              }
                            >
                              <img
                                src={idCardUrl}
                                alt="ID Card"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <span>
                                <Eye size={14} />
                              </span>
                            </button>
                          ) : (
                            <span className="admin-users-na">N/A</span>
                          )}
                        </td>

                        <td>
                          <div className="admin-users-kyc-cell">
                            <span className={`admin-users-status ${user.kyc_status || "pending"}`}>
                              {user.kyc_status === "approved" && <BadgeCheck size={14} />}
                              {user.kyc_status === "rejected" && <XCircle size={14} />}
                              {(!user.kyc_status || user.kyc_status === "pending") && (
                                <ImageIcon size={14} />
                              )}
                              {kycLabel}
                            </span>

                            {user.kyc_status === "pending" && selfieUrl && idCardUrl && (
                              <div className="admin-users-kyc-actions">
                                <button
                                  type="button"
                                  className="approve"
                                  onClick={() => handleKYCStatus(user.id, "approved")}
                                  disabled={actionLoading === user.id + "-kyc"}
                                >
                                  {actionLoading === user.id + "-kyc" ? (
                                    <Loader2 className="admin-users-spin" size={14} />
                                  ) : (
                                    <CheckCircle2 size={14} />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  className="reject"
                                  onClick={() => handleKYCStatus(user.id, "rejected")}
                                  disabled={actionLoading === user.id + "-kyc"}
                                >
                                  <Ban size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="admin-users-date">
                            {formatDate(user.created_at)}
                          </span>
                        </td>

                        <td>
                          <div className="admin-users-mode">
                            <span className={`admin-users-mode-label ${mode || "default"}`}>
                              {mode === "WIN" && "WIN MODE"}
                              {mode === "LOSE" && "LOSE MODE"}
                              {!mode && "DEFAULT"}
                            </span>

                            <div className="admin-users-mode-buttons">
                              <button
                                type="button"
                                onClick={() =>
                                  setUserWinMode(user.id, mode === "WIN" ? null : "WIN")
                                }
                                disabled={actionLoading === user.id + "-winmode"}
                                className={mode === "WIN" ? "active win" : ""}
                              >
                                WIN
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setUserWinMode(user.id, mode === "LOSE" ? null : "LOSE")
                                }
                                disabled={actionLoading === user.id + "-winmode"}
                                className={mode === "LOSE" ? "active lose" : ""}
                              >
                                LOSE
                              </button>
                            </div>
                          </div>
                        </td>

<td style={{ display: "flex", gap: "8px", border: "none" }}>
                          <button
                            type="button"
                            onClick={() => generateNewPassword(user.id)}
                            disabled={actionLoading === user.id + "-reset"}
                            className="admin-users-action-btn reset"
                          >
                            {actionLoading === user.id + "-reset" ? (
                              <Loader2 className="admin-users-spin" size={15} />
                            ) : (
                              <Key size={15} />
                            )}
                            <span>Reset Pass</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteUser(user.id)}
                            disabled={actionLoading === user.id + "-delete"}
                            className="admin-users-action-btn delete"
                          >
                            {actionLoading === user.id + "-delete" ? (
                              <Loader2 className="admin-users-spin" size={15} />
                            ) : (
                              <Trash2 size={15} />
                            )}
                            <span>{t("common.delete")}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
                {filteredUsers.length > 0 && (
            <div className="admin-users-pagination">
              <div className="admin-users-pagination-info">
                Showing <strong>{showingFrom}</strong> - <strong>{showingTo}</strong> of{" "}
                <strong>{filteredUsers.length}</strong> users
              </div>

              <div className="admin-users-pagination-controls">
                <label>
                  Rows
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage <= 1}
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>

                <span>
                  Page <strong>{safeCurrentPage}</strong> / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={safeCurrentPage >= totalPages}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

      {previewImage && (
        <div className="admin-users-preview-backdrop" onClick={() => setPreviewImage(null)}>
          <div className="admin-users-preview" onClick={(e) => e.stopPropagation()}>
            <div className="admin-users-preview-head">
              <strong>{previewImage.title}</strong>
              <button type="button" onClick={() => setPreviewImage(null)}>
                <X size={18} />
              </button>
            </div>

            <img src={previewImage.url} alt={previewImage.title} />
          </div>
        </div>
      )}

      {resetModal.isOpen && (
        <div className="admin-users-preview-backdrop" onClick={() => setResetModal({ isOpen: false, user: null, newPassword: "" })}>
          <div 
            className="admin-users-preview" 
            onClick={(e) => e.stopPropagation()} 
            style={{ padding: "24px", maxWidth: "400px", background: "rgba(20, 20, 20, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
          >
            <div className="admin-users-preview-head" style={{ marginBottom: "20px" }}>
              <strong>New Password for #{resetModal.user?.id}</strong>
              <button type="button" onClick={() => setResetModal({ isOpen: false, user: null, newPassword: "" })}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <p style={{ marginBottom: "15px", color: "#a1a1aa", fontSize: "0.9rem" }}>
                Password successfully generated. Please copy and securely share it with the user.
              </p>
              <div style={{ 
                background: "rgba(0,0,0,0.5)", 
                padding: "15px", 
                borderRadius: "8px", 
                fontSize: "1.5rem", 
                fontFamily: "'Geist Mono', monospace", 
                color: "#fff",
                userSelect: "all", 
                border: "1px solid rgba(255,255,255,0.05)" 
              }}>
                {resetModal.newPassword}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
