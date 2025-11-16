import React, { useEffect, useState } from "react";
import { Loader2, Wallet2, Image as LucideImage, UploadCloud, CheckCircle2 } from "lucide-react";

const supportedCoins = [
  { symbol: "USDT", name: "Tether USDT" },
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "TON", name: "Toncoin" }, 
  { symbol: "SOL", name: "Solana" },
  { symbol: "XRP", name: "Ripple" },
];

import { API_BASE } from "../config";
const API_URL = `${API_BASE}/api/admin/deposit-addresses`;

export default function DepositWalletSettings() {
  const [wallets, setWallets] = useState(
    supportedCoins.map(c => ({ ...c, address: "", qr_url: "" }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchWallets();
    // eslint-disable-next-line
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch deposit settings");

      setWallets(
        supportedCoins.map(c => {
          const found = data.find(w => w.coin === c.symbol);
          return found ? { ...c, ...found, qr_preview: null, qr_file: null } : { ...c, address: "", qr_url: "" };
        })
      );
    } catch (err) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

  const handleAddressChange = (i, value) => {
    setWallets(ws =>
      ws.map((w, idx) => (idx === i ? { ...w, address: value } : w))
    );
  };

  const handleQRUpload = (i, file) => {
    const reader = new FileReader();
    reader.onload = e => {
      setWallets(ws =>
        ws.map((w, idx) =>
          idx === i ? { ...w, qr_preview: e.target.result, qr_file: file } : w
        )
      );
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Not logged in as admin");

      const formData = new FormData();
      wallets.forEach(w => {
        if (w.address) formData.append(`${w.symbol}_address`, w.address);
        if (w.qr_file) formData.append(`${w.symbol}_qr`, w.qr_file);
      });

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // <--- Do NOT add Content-Type for FormData!
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      setSuccess("Deposit settings saved!");
      fetchWallets();
    } catch (err) {
      setError(err.message || "Failed to save settings");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-2 sm:px-6 py-8 bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 rounded-2xl shadow-2xl border border-white/10">
      <h2 className="flex items-center gap-2 text-2xl font-extrabold mb-6 tracking-tight text-[#ffd700]">
        <Wallet2 size={22} className="text-[#16d79c]" />
        Deposit Wallet Settings
      </h2>
      {error && <div className="bg-gradient-to-r from-[#f34e6d]/90 to-[#fbbf24]/80 text-white p-2 rounded-lg mb-4 font-semibold shadow">{error}</div>}
      {success && <div className="bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#181b25] p-2 rounded-lg mb-4 font-bold flex items-center gap-2"><CheckCircle2 size={17} />{success}</div>}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-[#FFD700] mr-2" size={30} />
          <span className="text-yellow-200 font-bold">Loading wallet settings...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-9">
          {wallets.map((w, i) => (
            <div key={w.symbol} className="mb-2 bg-[#232836]/80 p-5 rounded-xl shadow border border-[#ffd70022] flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
              <div className="min-w-[130px] flex items-center gap-2 font-bold text-white text-lg">
                <LucideImage size={22} className="text-[#16d79c]" />
                {w.name} <span className="ml-2 text-[#ffd700]">({w.symbol})</span>
              </div>
              <input
                type="text"
                value={w.address || ""}
                onChange={e => handleAddressChange(i, e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-500 bg-[#181b25] text-white font-semibold shadow"
                placeholder="Deposit Address"
                style={{ maxWidth: 330 }}
              />
              <div className="flex flex-col items-center">
                {w.qr_preview ? (
                  <img src={w.qr_preview} alt={w.symbol + " QR"} className="w-20 h-20 rounded-lg bg-white border border-[#ffd70077] shadow mb-2" />
                ) : w.qr_url ? (
                  <img src={w.qr_url} alt={w.symbol + " QR"} className="w-20 h-20 rounded-lg bg-white border border-[#ffd70077] shadow mb-2" />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center rounded-lg bg-white text-gray-400 text-xs mb-2 border border-[#eee]">
                    No QR
                  </div>
                )}
                <label className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-[#ffd700]/80 to-[#16d79c]/80 text-[#232836] font-bold shadow cursor-pointer text-xs hover:opacity-90 transition mt-1">
                  <UploadCloud size={14} />
                  Upload QR
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleQRUpload(i, e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={handleSave}
        className="mt-8 px-8 py-3 bg-gradient-to-r from-[#FFD700] to-[#16d79c] text-[#232836] font-bold rounded-xl text-lg shadow-lg hover:opacity-90 transition flex items-center gap-2"
        disabled={saving}
      >
        {saving && <Loader2 className="animate-spin" size={19} />}
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
