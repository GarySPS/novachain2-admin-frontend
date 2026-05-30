// src/components/UserBalanceTable.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  Coins,
  Loader2,
  Snowflake,
  WalletCards,
} from "lucide-react";
import { API_BASE } from "../config";

export default function UserBalanceTable({ userId, refresh }) {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

    if (!token) {
      setLoading(false);
      setError("Admin session expired. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    axios
      .get(`${API_BASE}/api/admin/user/${userId}/balances`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBalances(res.data.balances || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to fetch balances.")
      )
      .finally(() => setLoading(false));
  }, [userId, refresh]);

  const formatCoinAmount = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.0000";
    }

    return number.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    });
  };

  const totalBalance = balances.reduce(
    (sum, item) => sum + (Number(item.balance) || 0),
    0
  );

  const totalFrozen = balances.reduce(
    (sum, item) => sum + (Number(item.frozen) || 0),
    0
  );

  if (loading) {
    return (
      <div className="admin-user-balance-loading">
        <Loader2 size={24} className="admin-user-balance-spin" />
        <span>Loading balances...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-user-balance-error">
        <AlertCircle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="admin-user-balance-empty">
        <Coins size={34} />
        <strong>No balances found</strong>
        <span>This user does not have coin balances yet.</span>
      </div>
    );
  }

  return (
    <div className="admin-user-balance">
      <div className="admin-user-balance-summary">
        <div className="admin-user-balance-summary-card">
          <div className="admin-user-balance-summary-icon available">
            <WalletCards size={19} />
          </div>

          <div>
            <span>Total Available</span>
            <strong>{formatCoinAmount(totalBalance)}</strong>
          </div>
        </div>

        <div className="admin-user-balance-summary-card">
          <div className="admin-user-balance-summary-icon frozen">
            <Snowflake size={19} />
          </div>

          <div>
            <span>Total Frozen</span>
            <strong>{formatCoinAmount(totalFrozen)}</strong>
          </div>
        </div>
      </div>

      <div className="admin-user-balance-table-scroll">
        <table className="admin-user-balance-table">
          <thead>
            <tr>
              <th>Coin</th>
              <th>Available Balance</th>
              <th>Frozen Balance</th>
            </tr>
          </thead>

          <tbody>
            {balances.map((item, index) => (
              <tr key={item.coin || index}>
                <td>
                  <span className="admin-user-balance-coin">
                    {item.coin || "N/A"}
                  </span>
                </td>

                <td>
                  <span className="admin-user-balance-available">
                    {formatCoinAmount(item.balance)}
                  </span>
                </td>

                <td>
                  <span className="admin-user-balance-frozen">
                    {formatCoinAmount(item.frozen)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}