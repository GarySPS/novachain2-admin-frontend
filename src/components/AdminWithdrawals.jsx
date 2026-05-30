// src/components/AdminWithdrawals.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { API_BASE } from "../config";

const filterOptions = ["all", "pending", "approved", "completed", "rejected"];

export default function AdminWithdrawals() {
  const { t } = useTranslation();

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_BASE}/api/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("withdrawals.fetchError"));
      }

      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];

      setWithdrawals(sorted);
    } catch (err) {
      setError(err.message || t("withdrawals.networkError"));
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

      if (!res.ok) {
        throw new Error(data.message || t(`withdrawals.${action}Error`));
      }

      await fetchWithdrawals();
    } catch (err) {
      setError(err.message || t("withdrawals.networkError"));
    }

    setActionLoading(null);
  };

  const getStatusLabel = (status) => {
    if (status === "approved") return t("withdrawals.approved");
    if (status === "pending") return t("withdrawals.pending");
    if (status === "rejected") return t("withdrawals.rejected");
    if (status === "completed") return t("withdrawals.completed");
    return status || t("common.na");
  };

  const getStatusClass = (status) => {
    if (status === "approved") return "approved";
    if (status === "pending") return "pending";
    if (status === "completed") return "completed";
    if (status === "rejected") return "rejected";
    return "unknown";
  };

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      const matchesStatus = filter === "all" || w.status === filter;
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        String(w.id || "").toLowerCase().includes(keyword) ||
        String(w.user_id || "").toLowerCase().includes(keyword) ||
        String(w.user_email || w.email || "").toLowerCase().includes(keyword) ||
        String(w.coin || "").toLowerCase().includes(keyword) ||
        String(w.amount || "").toLowerCase().includes(keyword) ||
        String(w.address || "").toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [withdrawals, filter, searchTerm]);

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status === "pending").length,
    approved: withdrawals.filter((w) => w.status === "approved").length,
    completed: withdrawals.filter((w) => w.status === "completed").length,
    rejected: withdrawals.filter((w) => w.status === "rejected").length,
    totalAmount: withdrawals.reduce(
      (sum, w) => sum + (Number.parseFloat(w.amount) || 0),
      0
    ),
  };

  const totalPages = Math.max(1, Math.ceil(filteredWithdrawals.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedWithdrawals = filteredWithdrawals.slice(startIndex, endIndex);

  const showingFrom = filteredWithdrawals.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(endIndex, filteredWithdrawals.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, pageSize]);

  return (
    <section className="admin-withdrawals-page">
      <div className="admin-withdrawals-header">
        <div>
          <div className="admin-withdrawals-kicker">
            <ArrowUpRight size={17} />
            Withdrawal Control
          </div>

          <h1>{t("withdrawals.title")}</h1>
          <p>
            Review withdrawal requests, verify destination addresses, and approve
            or deny pending payout operations.
          </p>
        </div>

        <button
          type="button"
          className="admin-withdrawals-refresh"
          onClick={fetchWithdrawals}
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="admin-withdrawals-stats">
        <button
          type="button"
          className={
            filter === "all"
              ? "admin-withdrawals-stat total active"
              : "admin-withdrawals-stat total"
          }
          onClick={() => setFilter("all")}
        >
          <span>{t("withdrawals.totalAmount")}</span>
          <strong>
            {stats.totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </strong>
        </button>

        <button
          type="button"
          className={
            filter === "all"
              ? "admin-withdrawals-stat count active"
              : "admin-withdrawals-stat count"
          }
          onClick={() => setFilter("all")}
        >
          <span>{t("withdrawals.total")}</span>
          <strong>{stats.total}</strong>
        </button>

        <button
          type="button"
          className={
            filter === "pending"
              ? "admin-withdrawals-stat pending active"
              : "admin-withdrawals-stat pending"
          }
          onClick={() => setFilter("pending")}
        >
          <span>{t("withdrawals.pending")}</span>
          <strong>{stats.pending}</strong>
        </button>

        <button
          type="button"
          className={
            filter === "approved"
              ? "admin-withdrawals-stat approved active"
              : "admin-withdrawals-stat approved"
          }
          onClick={() => setFilter("approved")}
        >
          <span>{t("withdrawals.approved")}</span>
          <strong>{stats.approved}</strong>
        </button>

        <button
          type="button"
          className={
            filter === "completed"
              ? "admin-withdrawals-stat completed active"
              : "admin-withdrawals-stat completed"
          }
          onClick={() => setFilter("completed")}
        >
          <span>{t("withdrawals.completed")}</span>
          <strong>{stats.completed}</strong>
        </button>
      </div>

      <div className="admin-withdrawals-toolbar">
        <div className="admin-withdrawals-search">
          <Search size={18} />
          <input
            type="text"
            placeholder={t("withdrawals.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="admin-withdrawals-filter-pills">
          {filterOptions.map((filterType) => (
            <button
              key={filterType}
              type="button"
              onClick={() => setFilter(filterType)}
              className={filter === filterType ? "active" : ""}
            >
              {t(`withdrawals.filters.${filterType}`)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="admin-withdrawals-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-withdrawals-loading">
          <Loader2 className="admin-withdrawals-spin" size={26} />
          <span>{t("common.loading")}</span>
        </div>
      ) : (
        <>
          <div className="admin-withdrawals-table-card">
            <div className="admin-withdrawals-table-scroll">
              <table className="admin-withdrawals-table">
                <thead>
                  <tr>
                    <th>{t("withdrawals.id")}</th>
                    <th>{t("withdrawals.userId")}</th>
                    <th>{t("withdrawals.coin")}</th>
                    <th>{t("withdrawals.amount")}</th>
                    <th>{t("withdrawals.toAddress")}</th>
                    <th>{t("withdrawals.date")}</th>
                    <th>{t("withdrawals.status")}</th>
                    <th>{t("common.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="admin-withdrawals-empty">
                          <ArrowUpRight size={30} />
                          <strong>{t("withdrawals.noWithdrawals")}</strong>
                          <span>No matching withdrawal request found.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedWithdrawals.map((w, index) => {
                      const statusClass = getStatusClass(w.status);

                      return (
                        <tr key={`withdrawal-${w.id || index}`}>
                          <td>
                            <span className="admin-withdrawals-id">#{w.id}</span>
                          </td>

                          <td>
                            <div className="admin-withdrawals-user">
                              <strong>#{w.user_id}</strong>
                              <span>{w.user_email || w.email || "NO EMAIL"}</span>
                            </div>
                          </td>

                          <td>
                            <span className="admin-withdrawals-coin">
                              {w.coin || "USDT"}
                            </span>
                          </td>

                          <td>
                            <span className="admin-withdrawals-amount">
                              {Number(w.amount || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </td>

                          <td>
                            <span
                              className="admin-withdrawals-address"
                              title={w.address}
                            >
                              {w.address || "N/A"}
                            </span>
                          </td>

                          <td>
                            <span className="admin-withdrawals-date">
                              {w.created_at?.slice(0, 19).replace("T", " ") ||
                                "N/A"}
                            </span>
                          </td>

                          <td>
                            <span className={`admin-withdrawals-status ${statusClass}`}>
                              {statusClass === "approved" && (
                                <CheckCircle2 size={14} />
                              )}
                              {statusClass === "pending" && (
                                <Loader2
                                  size={14}
                                  className="admin-withdrawals-spin"
                                />
                              )}
                              {statusClass === "completed" && <BadgeCheck size={14} />}
                              {statusClass === "rejected" && <XCircle size={14} />}
                              {getStatusLabel(w.status)}
                            </span>
                          </td>

                          <td>
                            {w.status === "pending" ? (
                              <div className="admin-withdrawals-actions">
                                <button
                                  type="button"
                                  className="approve"
                                  onClick={() => handleAction(w.id, "approve")}
                                  disabled={!!actionLoading}
                                >
                                  {actionLoading === w.id + "approve" ? (
                                    <Loader2
                                      className="admin-withdrawals-spin"
                                      size={15}
                                    />
                                  ) : (
                                    <CheckCircle2 size={15} />
                                  )}
                                  {t("withdrawals.approve")}
                                </button>

                                <button
                                  type="button"
                                  className="deny"
                                  onClick={() => handleAction(w.id, "deny")}
                                  disabled={!!actionLoading}
                                >
                                  {actionLoading === w.id + "deny" ? (
                                    <Loader2
                                      className="admin-withdrawals-spin"
                                      size={15}
                                    />
                                  ) : (
                                    <XCircle size={15} />
                                  )}
                                  {t("withdrawals.deny")}
                                </button>
                              </div>
                            ) : (
                              <span className="admin-withdrawals-dash">—</span>
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

          {filteredWithdrawals.length > 0 && (
            <div className="admin-withdrawals-pagination">
              <div className="admin-withdrawals-pagination-info">
                Showing <strong>{showingFrom}</strong> -{" "}
                <strong>{showingTo}</strong> of{" "}
                <strong>{filteredWithdrawals.length}</strong> withdrawals
              </div>

              <div className="admin-withdrawals-pagination-controls">
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
        </>
      )}
    </section>
  );
}