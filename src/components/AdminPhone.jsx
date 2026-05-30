// src/components/AdminPhone.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  RefreshCcw,
  Search,
  Smartphone,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { API_BASE } from "../config";

const filterOptions = ["all", "pending", "approved"];

export default function AdminPhone() {
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPhoneUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_BASE}/api/admin/phone-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("phone.fetchError"));
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || t("phone.networkError"));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPhoneUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_BASE}/api/admin/phone-users/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || t("phone.approveError"));
      }

      setSuccess(t("phone.approveSuccess", { id }) || `User #${id} approved.`);
      await fetchPhoneUsers();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || t("phone.serverError"));
    }

    setActionLoading(null);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && !user.verified) ||
        (filter === "approved" && user.verified);

      const cleanPhone = user.email ? user.email.replace("@phone.demo", "") : "";
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        String(user.id || "").toLowerCase().includes(keyword) ||
        String(user.username || "").toLowerCase().includes(keyword) ||
        String(user.memberCode || "").toLowerCase().includes(keyword) ||
        String(cleanPhone || "").toLowerCase().includes(keyword);

      return matchesFilter && matchesSearch;
    });
  }, [users, filter, searchTerm]);

  const stats = {
    total: users.length,
    pending: users.filter((user) => !user.verified).length,
    approved: users.filter((user) => user.verified).length,
  };

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const showingFrom = filteredUsers.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(endIndex, filteredUsers.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, pageSize]);

  return (
    <section className="admin-phone-page">
      <div className="admin-phone-header">
        <div>
          <div className="admin-phone-kicker">
            <Phone size={17} />
            Phone Control
          </div>

          <h1>{t("phone.title")}</h1>
          <p>
            Review phone-login users, member codes, verification status, and
            approve pending phone accounts.
          </p>
        </div>

        <button type="button" className="admin-phone-refresh" onClick={fetchPhoneUsers}>
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="admin-phone-stats">
        <button
          type="button"
          className={filter === "all" ? "admin-phone-stat active" : "admin-phone-stat"}
          onClick={() => setFilter("all")}
        >
          <span>{t("phone.total")}</span>
          <strong>{stats.total}</strong>
        </button>

        <button
          type="button"
          className={
            filter === "pending"
              ? "admin-phone-stat pending active"
              : "admin-phone-stat pending"
          }
          onClick={() => setFilter("pending")}
        >
          <span>{t("phone.pending")}</span>
          <strong>{stats.pending}</strong>
        </button>

        <button
          type="button"
          className={
            filter === "approved"
              ? "admin-phone-stat approved active"
              : "admin-phone-stat approved"
          }
          onClick={() => setFilter("approved")}
        >
          <span>{t("phone.approved")}</span>
          <strong>{stats.approved}</strong>
        </button>
      </div>

      <div className="admin-phone-toolbar">
        <div className="admin-phone-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by ID, username, phone, or member code"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="admin-phone-filter-pills">
          {filterOptions.map((filterType) => (
            <button
              key={filterType}
              type="button"
              onClick={() => setFilter(filterType)}
              className={filter === filterType ? "active" : ""}
            >
              {t(`phone.filters.${filterType}`)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="admin-phone-message error">
          <XCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="admin-phone-message success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-phone-loading">
          <Loader2 className="admin-phone-spin" size={26} />
          <span>{t("common.loading")}</span>
        </div>
      ) : (
        <>
          <div className="admin-phone-table-card">
            <div className="admin-phone-table-scroll">
              <table className="admin-phone-table">
                <thead>
                  <tr>
                    <th>{t("phone.id")}</th>
                    <th>{t("phone.username")}</th>
                    <th>{t("phone.phoneNumber")}</th>
                    <th>{t("phone.code")}</th>
                    <th>{t("phone.status")}</th>
                    <th>{t("common.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="admin-phone-empty">
                          <Smartphone size={30} />
                          <strong>
                            {filter === "pending"
                              ? t("phone.noPendingUsers")
                              : filter === "approved"
                              ? t("phone.noApprovedUsers")
                              : t("phone.noUsers")}
                          </strong>
                          <span>No matching phone user found.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => {
                      const cleanPhone = user.email
                        ? user.email.replace("@phone.demo", "")
                        : "N/A";

                      return (
                        <tr key={user.id}>
                          <td>
                            <span className="admin-phone-id">#{user.id}</span>
                          </td>

                          <td>
                            <div className="admin-phone-user">
                              <UserRound size={15} />
                              <strong>{user.username || "N/A"}</strong>
                            </div>
                          </td>

                          <td>
                            <span className="admin-phone-number">
                              <Phone size={13} />
                              {cleanPhone}
                            </span>
                          </td>

                          <td>
                            <span className="admin-phone-code">
                              {user.memberCode || "N/A"}
                            </span>
                          </td>

                          <td>
                            {user.verified ? (
                              <span className="admin-phone-status approved">
                                <CheckCircle size={14} />
                                {t("phone.approved")}
                              </span>
                            ) : (
                              <span className="admin-phone-status pending">
                                <AlertCircle size={14} />
                                {t("phone.pending")}
                              </span>
                            )}
                          </td>

                          <td>
                            {!user.verified ? (
                              <button
                                type="button"
                                className="admin-phone-approve"
                                onClick={() => handleApprove(user.id)}
                                disabled={!!actionLoading}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2
                                    className="admin-phone-spin"
                                    size={15}
                                  />
                                ) : (
                                  <CheckCircle size={15} />
                                )}
                                {t("phone.approve")}
                              </button>
                            ) : (
                              <span className="admin-phone-approved-text">
                                {t("phone.alreadyApproved")}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length > 0 && (
            <div className="admin-phone-pagination">
              <div className="admin-phone-pagination-info">
                Showing <strong>{showingFrom}</strong> -{" "}
                <strong>{showingTo}</strong> of{" "}
                <strong>{filteredUsers.length}</strong> phone users
              </div>

              <div className="admin-phone-pagination-controls">
                <label>
                  Rows
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
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
        </>
      )}
    </section>
  );
}