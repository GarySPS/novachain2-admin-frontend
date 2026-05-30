// src/components/AdminBalance.jsx

// src/components/AdminBalance.jsx

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import BalanceAdjuster from "./BalanceAdjuster";
import { API_BASE } from "../config";

export default function AdminBalance() {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("recentBalanceUsers");
      if (saved) {
        setRecentUsers(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      setRecentUsers([]);
    }
  }, []);

  const saveRecentUser = (userData) => {
    try {
      const saved = localStorage.getItem("recentBalanceUsers");
      let users = saved ? JSON.parse(saved) : [];

      users = [userData, ...users.filter((item) => item.id !== userData.id)].slice(
        0,
        5
      );

      localStorage.setItem("recentBalanceUsers", JSON.stringify(users));
      setRecentUsers(users);
    } catch {
      setRecentUsers([]);
    }
  };

  const showMessage = (text, type = "error") => {
    setMsg(text);
    setMsgType(type);

    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 4000);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const keyword = search.trim();

    setMsg("");
    setMsgType("");
    setUser(null);

    if (!keyword) {
      showMessage(t("balance.enterIdOrEmail") || "Enter user ID or email.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const users = await res.json();

      if (!res.ok) {
        throw new Error(users.message || t("balance.fetchError"));
      }

      const found = Array.isArray(users)
        ? users.find(
            (item) =>
              String(item.id) === String(keyword) ||
              (item.email && item.email.toLowerCase() === keyword.toLowerCase())
          )
        : null;

      if (!found) {
        showMessage(t("balance.userNotFound") || "User not found.");
        setUser(null);
      } else {
        setUser(found);
        saveRecentUser({
          id: found.id,
          email: found.email,
          username: found.username,
        });
        setMsg("");
        setMsgType("");
      }
    } catch (err) {
      showMessage(err.message || t("balance.searchError") || "Search failed.");
    }

    setLoading(false);
  };

  const handleRecentUser = (recent) => {
    setSearch(String(recent.id));
  };

  return (
    <section className="admin-balance-page">
      <div className="admin-balance-page-header">
        <div>
          <div className="admin-balance-page-kicker">
            <WalletCards size={17} />
            Balance Control
          </div>

          <h1>{t("balance.title") || "Adjust Balance"}</h1>
          <p>
            Search one user, review the account, then adjust balance with one clear
            action.
          </p>
        </div>
      </div>

      <section className="admin-balance-search-card">
        <form className="admin-balance-search-form" onSubmit={handleSearch}>
          <div className="admin-balance-search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder={
                t("balance.searchPlaceholder") || "Search by User ID or Email"
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />

            {search && (
              <button type="button" onClick={() => setSearch("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="admin-balance-search-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="admin-balance-page-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={18} />
                Find User
              </>
            )}
          </button>
        </form>

        {recentUsers.length > 0 && !user && (
          <div className="admin-balance-recent">
            <div className="admin-balance-recent-title">
              <Clock size={15} />
              <span>{t("balance.recentUsers") || "Recent Users"}</span>
            </div>

            <div className="admin-balance-recent-list">
              {recentUsers.map((recent) => (
                <button
                  key={recent.id}
                  type="button"
                  onClick={() => handleRecentUser(recent)}
                >
                  <strong>#{recent.id}</strong>
                  <span>{recent.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {msg && (
          <div className={`admin-balance-page-message ${msgType}`}>
            {msgType === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{msg}</span>
          </div>
        )}
      </section>

      {user ? (
        <>
          <section className="admin-balance-user-card">
            <div className="admin-balance-user-main">
              <div className="admin-balance-user-icon">
                <UserRound size={24} />
              </div>

              <div>
                <span>Selected User</span>
                <strong>#{user.id}</strong>
              </div>
            </div>

            <div className="admin-balance-user-detail">
              <span>Email</span>
              <strong>{user.email || "N/A"}</strong>
            </div>

            <div className="admin-balance-user-detail">
              <span>Username</span>
              <strong>{user.username || user.email?.split("@")[0] || "N/A"}</strong>
            </div>
          </section>

          <BalanceAdjuster
            userId={user.id}
            onDone={() =>
              showMessage(t("balance.updateSuccess") || "Balance updated.", "success")
            }
          />
        </>
      ) : (
        !msg && (
          <section className="admin-balance-empty">
            <div>
              <Users size={42} />
            </div>

            <h2>{t("balance.searchPrompt") || "Search for a user to get started"}</h2>
            <p>
              {t("balance.searchHint") ||
                "Enter a user ID or email address above."}
            </p>
          </section>
        )
      )}
    </section>
  );
}