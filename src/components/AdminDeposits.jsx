// src/components/AdminDeposits.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Image,
  Loader2,
  RefreshCcw,
  Search,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { API_BASE } from "../config";

const SUPABASE_PUBLIC_URL =
  "https://obrfnkggcfgfspyqgtws.supabase.co/storage/v1/object/public/deposit";

const filterOptions = ["all", "pending", "approved", "denied"];

export default function AdminDeposits() {
  const { t } = useTranslation();

  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [previewSlip, setPreviewSlip] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchDeposits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_BASE}/api/deposits`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("deposits.fetchError"));
      }

      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];

      setDeposits(sorted);
    } catch (err) {
      setError(err.message || t("deposits.networkError"));
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

      if (!res.ok) {
        throw new Error(data.message || t(`deposits.${action}Error`));
      }

      await fetchDeposits();
    } catch (err) {
      setError(err.message || t("deposits.networkError"));
    }

    setActionLoading(null);
  };

  const getScreenshotUrl = (screenshot) => {
    if (!screenshot) return null;

    if (screenshot.startsWith("web3-tx-")) {
      return { type: "web3", hash: screenshot.replace("web3-tx-", "") };
    }

    if (!screenshot.includes("/")) {
      return {
        type: "image",
        url: `${SUPABASE_PUBLIC_URL}/${encodeURIComponent(screenshot)}`,
      };
    }

    if (screenshot.startsWith("/uploads/")) {
      return { type: "image", url: `${API_BASE}${screenshot}` };
    }

    if (screenshot.startsWith("http")) {
      return { type: "image", url: screenshot };
    }

    const pathParts = screenshot.split("/");
    const fileName = encodeURIComponent(pathParts.pop());

    return {
      type: "image",
      url: `${SUPABASE_PUBLIC_URL}/${pathParts.join("/")}/${fileName}`,
    };
  };

  const getStatusLabel = (status) => {
    if (status === "approved") return t("deposits.approved");
    if (status === "pending") return t("deposits.pending");
    if (status === "denied" || status === "rejected") return t("deposits.denied");
    return status || "Unknown";
  };

  const filteredDeposits = useMemo(() => {
    return deposits.filter((deposit) => {
      const matchesStatus =
        filter === "all" ||
        (filter === "pending" && deposit.status === "pending") ||
        (filter === "approved" && deposit.status === "approved") ||
        (filter === "denied" &&
          (deposit.status === "denied" || deposit.status === "rejected"));

      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        String(deposit.id || "").toLowerCase().includes(keyword) ||
        String(deposit.user_id || "").toLowerCase().includes(keyword) ||
        String(deposit.user_email || deposit.email || "")
          .toLowerCase()
          .includes(keyword) ||
        String(deposit.coin || "").toLowerCase().includes(keyword) ||
        String(deposit.amount || "").toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [deposits, filter, search]);

  const stats = {
    total: deposits.length,
    pending: deposits.filter((d) => d.status === "pending").length,
    approved: deposits.filter((d) => d.status === "approved").length,
    denied: deposits.filter((d) => d.status === "denied" || d.status === "rejected")
      .length,
  };

  const totalPages = Math.max(1, Math.ceil(filteredDeposits.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDeposits = filteredDeposits.slice(startIndex, endIndex);

  const showingFrom = filteredDeposits.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(endIndex, filteredDeposits.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, pageSize]);

  return (
    <section className="admin-deposits-page">
      <div className="admin-deposits-header">
        <div>
          <div className="admin-deposits-kicker">
            <Wallet size={17} />
            Deposit Control
          </div>

          <h1>{t("deposits.title")}</h1>
          <p>
            Review user deposit requests, check payment slips, and approve or deny
            pending transactions.
          </p>
        </div>

        <button type="button" className="admin-deposits-refresh" onClick={fetchDeposits}>
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="admin-deposits-stats">
        <button
          type="button"
          className={filter === "all" ? "admin-deposits-stat active" : "admin-deposits-stat"}
          onClick={() => setFilter("all")}
        >
          <span>{t("deposits.total")}</span>
          <strong>{stats.total}</strong>
        </button>

        <button
          type="button"
          className={
            filter === "pending"
              ? "admin-deposits-stat pending active"
              : "admin-deposits-stat pending"
          }
          onClick={() => setFilter("pending")}
        >
          <span>{t("deposits.pending")}</span>
          <strong>{stats.pending}</strong>
        </button>

        <button
          type="button"
          className={
            filter === "approved"
              ? "admin-deposits-stat approved active"
              : "admin-deposits-stat approved"
          }
          onClick={() => setFilter("approved")}
        >
          <span>{t("deposits.approved")}</span>
          <strong>{stats.approved}</strong>
        </button>

        <button
          type="button"
          className={
            filter === "denied"
              ? "admin-deposits-stat denied active"
              : "admin-deposits-stat denied"
          }
          onClick={() => setFilter("denied")}
        >
          <span>{t("deposits.denied")}</span>
          <strong>{stats.denied}</strong>
        </button>
      </div>

      <div className="admin-deposits-toolbar">
        <div className="admin-deposits-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by deposit ID, user ID, email, coin, or amount"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="admin-deposits-filter-pills">
          {filterOptions.map((filterType) => (
            <button
              key={filterType}
              type="button"
              onClick={() => setFilter(filterType)}
              className={filter === filterType ? "active" : ""}
            >
              {t(`deposits.filters.${filterType}`)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="admin-deposits-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-deposits-loading">
          <Loader2 className="admin-deposits-spin" size={26} />
          <span>{t("common.loading")}</span>
        </div>
      ) : (
        <>
          <div className="admin-deposits-table-card">
            <div className="admin-deposits-table-scroll">
              <table className="admin-deposits-table">
                <thead>
                  <tr>
                    <th>{t("deposits.id")}</th>
                    <th>{t("deposits.user")}</th>
                    <th>{t("deposits.coin")}</th>
                    <th>{t("deposits.amount")}</th>
                    <th>{t("deposits.status")}</th>
                    <th>{t("deposits.time")}</th>
                    <th>{t("deposits.slip")}</th>
                    <th>{t("common.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDeposits.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="admin-deposits-empty">
                          <Wallet size={30} />
                          <strong>{t("deposits.noDeposits")}</strong>
                          <span>No matching deposit request found.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedDeposits.map((d, index) => {
                      const screenshotData = getScreenshotUrl(d.screenshot);
                      const statusClass =
                        d.status === "approved"
                          ? "approved"
                          : d.status === "pending"
                          ? "pending"
                          : d.status === "denied" || d.status === "rejected"
                          ? "denied"
                          : "unknown";

                      return (
                        <tr key={`deposit-${d.id || index}-${d.user_id || "x"}`}>
                          <td>
                            <span className="admin-deposits-id">#{d.id}</span>
                          </td>

                          <td>
                            <div className="admin-deposits-user">
                              <strong>#{d.user_id}</strong>
                              <span>{d.user_email || d.email || "NO EMAIL"}</span>
                            </div>
                          </td>

                          <td>
                            <span className="admin-deposits-coin">
                              {d.coin || "USDT"}
                            </span>
                          </td>

                          <td>
                            <span className="admin-deposits-amount">
                              {Number(d.amount || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </td>

                          <td>
                            <span className={`admin-deposits-status ${statusClass}`}>
                              {statusClass === "approved" && <CheckCircle2 size={14} />}
                              {statusClass === "pending" && (
                                <Loader2 size={14} className="admin-deposits-spin" />
                              )}
                              {statusClass === "denied" && <XCircle size={14} />}
                              {getStatusLabel(d.status)}
                            </span>
                          </td>

                          <td>
                            <span className="admin-deposits-date">
                              {d.created_at?.slice(0, 19).replace("T", " ") || "N/A"}
                            </span>
                          </td>

                          <td>
                            {screenshotData ? (
                              screenshotData.type === "web3" ? (
                                <button
                                  type="button"
                                  className="admin-deposits-web3"
                                  title={`${t("deposits.txHash")}: ${screenshotData.hash}`}
                                >
                                  <Image size={14} />
                                  Web3 Tx
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="admin-deposits-slip"
                                  onClick={() =>
                                    setPreviewSlip({
                                      url: screenshotData.url,
                                      title: `Deposit #${d.id} Slip`,
                                    })
                                  }
                                  title={t("deposits.viewSlip")}
                                >
                                  <img
                                    src={screenshotData.url}
                                    alt={t("deposits.depositSlip")}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                  <span>
                                    <Eye size={14} />
                                  </span>
                                </button>
                              )
                            ) : (
                              <span className="admin-deposits-na">
                                <Image size={14} />
                                {t("common.na")}
                              </span>
                            )}
                          </td>

                          <td>
                            {d.status === "pending" ? (
                              <div className="admin-deposits-actions">
                                <button
                                  type="button"
                                  className="approve"
                                  onClick={() => handleAction(d.id, "approve")}
                                  disabled={!!actionLoading}
                                >
                                  {actionLoading === d.id + "approve" ? (
                                    <Loader2
                                      className="admin-deposits-spin"
                                      size={15}
                                    />
                                  ) : (
                                    <CheckCircle2 size={15} />
                                  )}
                                  {t("deposits.approve")}
                                </button>

                                <button
                                  type="button"
                                  className="deny"
                                  onClick={() => handleAction(d.id, "deny")}
                                  disabled={!!actionLoading}
                                >
                                  {actionLoading === d.id + "deny" ? (
                                    <Loader2
                                      className="admin-deposits-spin"
                                      size={15}
                                    />
                                  ) : (
                                    <XCircle size={15} />
                                  )}
                                  {t("deposits.deny")}
                                </button>
                              </div>
                            ) : (
                              <span className="admin-deposits-dash">—</span>
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

          {filteredDeposits.length > 0 && (
            <div className="admin-deposits-pagination">
              <div className="admin-deposits-pagination-info">
                Showing <strong>{showingFrom}</strong> -{" "}
                <strong>{showingTo}</strong> of{" "}
                <strong>{filteredDeposits.length}</strong> deposits
              </div>

              <div className="admin-deposits-pagination-controls">
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

      {previewSlip && (
        <div
          className="admin-deposits-preview-backdrop"
          onClick={() => setPreviewSlip(null)}
        >
          <div className="admin-deposits-preview" onClick={(e) => e.stopPropagation()}>
            <div className="admin-deposits-preview-head">
              <strong>{previewSlip.title}</strong>
              <button type="button" onClick={() => setPreviewSlip(null)}>
                <X size={18} />
              </button>
            </div>

            <img src={previewSlip.url} alt={previewSlip.title} />
          </div>
        </div>
      )}
    </section>
  );
}