//src>components>UserBalanceTable.jsx

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Loader2, Coins, Snowflake } from "lucide-react";
import { API_BASE } from "../config";

export default function UserBalanceTable({ userId, refresh }) {
  const { t } = useTranslation();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError("");
    axios
      .get(`${API_BASE}/api/admin/user/${userId}/balances`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBalances(res.data.balances || []))
      .catch(() => setError(t("balance.fetchBalancesError")))
      .finally(() => setLoading(false));
  }, [userId, refresh, t]);

  const totalBalance = balances.reduce((sum, b) => sum + (parseFloat(b.balance) || 0), 0);
  const totalFrozen = balances.reduce((sum, b) => sum + (parseFloat(b.frozen) || 0), 0);

  return (
    <div className="bg-[#1e2434] rounded-xl shadow-lg p-5 overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#ffd700] flex items-center gap-2">
          <Coins size={18} />
          {t("balance.userBalances")}
        </h3>
        {!loading && balances.length > 0 && (
          <div className="flex gap-3 text-xs">
            <span className="text-green-400">
              {t("balance.totalBalance")}: {totalBalance.toFixed(4)}
            </span>
            <span className="text-blue-400">
              {t("balance.totalFrozen")}: {totalFrozen.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-[#ffd700] mr-2" size={24} />
          <span className="text-gray-400">{t("common.loading")}</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">{error}</div>
      ) : balances.length === 0 ? (
        <div className="text-center py-8 text-gray-400">{t("balance.noBalances")}</div>
      ) : (
        <table className="min-w-full text-white">
          <thead>
            <tr className="bg-[#282c3e]">
              <th className="px-4 py-2 text-left rounded-l-lg">{t("balance.coin")}</th>
              <th className="px-4 py-2 text-right">{t("balance.balance")}</th>
              <th className="px-4 py-2 text-right rounded-r-lg flex items-center justify-end gap-1">
                <Snowflake size={14} />
                {t("balance.frozen")}
              </th>
            </tr>
          </thead>
          <tbody>
            {balances.map((b, i) => (
              <tr key={i} className="border-b border-gray-700/50 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-bold text-[#ffd700]">{b.coin}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {parseFloat(b.balance).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 })}
                </td>
                <td className="px-4 py-3 text-right font-mono text-blue-400">
                  {parseFloat(b.frozen).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}