// src/components/UserBalanceTable.jsx

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Loader2, Snowflake } from "lucide-react";
import { API_BASE } from "../config";

export default function UserBalanceTable({ userId, refresh }) {
  const { t } = useTranslation();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

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
        setError(err.response?.data?.message || t("balance.fetchBalancesError"))
      )
      .finally(() => setLoading(false));
  }, [userId, refresh, t]);

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
    (sum, b) => sum + (Number(b.balance) || 0),
    0
  );

  const totalFrozen = balances.reduce(
    (sum, b) => sum + (Number(b.frozen) || 0),
    0
  );

  return (
    <div className="w-full">
      {/* Total Stats Bar */}
      {!loading && balances.length > 0 && (
        <div className="flex flex-wrap gap-4 px-6 py-3 bg-white/5 border-b border-white/5 text-[11px] font-bold uppercase tracking-wider">
          <span className="text-emerald-400 flex items-center gap-1">
            {t("balance.totalBalance")}: <span className="font-mono">{totalBalance.toFixed(4)}</span>
          </span>
          <span className="text-sky-400 flex items-center gap-1">
            {t("balance.totalFrozen")}: <span className="font-mono">{totalFrozen.toFixed(4)}</span>
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-[#ffd700] mr-2" size={20} />
          <span className="text-gray-400 text-sm font-medium">{t("common.loading")}</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-rose-400 text-sm font-bold bg-rose-500/10">
          {error}
        </div>
      ) : balances.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          {t("balance.noBalances")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Using the global admin-table class to match other pages */}
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>{t("balance.coin")}</th>
                <th className="text-right">{t("balance.balance")}</th>
                <th className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Snowflake size={12} />
                    {t("balance.frozen")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b, i) => (
                <tr key={b.coin || i}>
                  <td className="font-bold text-gray-300">
                    {b.coin}
                  </td>
                  <td className="text-right font-mono text-emerald-400 font-medium">
                    {formatCoinAmount(b.balance)}
                  </td>
                  <td className="text-right font-mono text-sky-400 font-medium">
                    {formatCoinAmount(b.frozen)}
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