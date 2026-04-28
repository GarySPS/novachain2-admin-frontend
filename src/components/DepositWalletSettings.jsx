//src>components>DepositWalletSettings.jsx

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Wallet2, Image as LucideImage, UploadCloud, CheckCircle2 } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { API_BASE } from "../config";

// --- NEW: Add Supabase Client ---
const SUPABASE_URL = "https://obrfnkggcfgfspyqgtws.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icmZua2dnY2ZnZnNweXFndHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzkyNTAsImV4cCI6MjA3ODgxNTI1MH0.fMvyyXxfQn3dTzkiCA1phf1-qRnMN-BvtbMIaTwGD0I";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ---------------------------------

const supportedCoins = [
  { symbol: "USDT", name: "Tether USDT" },
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "BNB", name: "BNB" },
];

const API_URL = `${API_BASE}/api/admin/deposit-addresses`;

export default function DepositWalletSettings() {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState(
    supportedCoins.map(c => ({ 
      ...c, 
      address: "", 
      qr_url: "", 
      qr_preview: null, 
      isUploading: false 
    }))
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
      if (!res.ok) throw new Error(data.message || t("settings.fetchError"));

      setWallets(
        supportedCoins.map(c => {
          const found = data.find(w => w.coin === c.symbol);
          return found ? { ...c, ...found, qr_preview: null, isUploading: false } : { ...c, address: "", qr_url: "", qr_preview: null, isUploading: false };
        })
      );
    } catch (err) {
      setError(err.message || t("settings.networkError"));
    }
    setLoading(false);
  };

  const handleAddressChange = (i, value) => {
    setWallets(ws =>
      ws.map((w, idx) => (idx === i ? { ...w, address: value } : w))
    );
  };

  const handleQRUpload = async (i, file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t("settings.invalidImageType"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t("settings.fileTooLarge"));
      return;
    }

    // 1. Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setWallets(ws =>
        ws.map((w, idx) =>
          idx === i ? { ...w, qr_preview: e.target.result } : w
        )
      );
    };
    reader.readAsDataURL(file);

    // 2. Upload the file to Supabase
    try {
      const filePath = `deposit-qr-${supportedCoins[i].symbol}-${Date.now()}`;
      
      setWallets(ws =>
        ws.map((w, idx) => (idx === i ? { ...w, isUploading: true } : w))
      );

      const { data, error } = await supabase.storage
        .from('deposit')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicURLData } = supabase.storage
        .from('deposit')
        .getPublicUrl(data.path);
      
      const publicUrl = publicURLData.publicUrl;

      setWallets(ws =>
        ws.map((w, idx) =>
          idx === i
            ? { ...w, qr_url: publicUrl, isUploading: false, qr_preview: null }
            : w
        )
      );

      setSuccess(t("settings.uploadSuccess"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error uploading QR code:", err);
      setError(`${t("settings.uploadError")} ${supportedCoins[i].symbol}`);
      setWallets(ws =>
        ws.map((w, idx) => (idx === i ? { ...w, isUploading: false } : w))
      );
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error(t("settings.notLoggedIn"));

      const payload = wallets.map(w => ({
        coin: w.symbol,
        address: w.address,
        qr_url: w.qr_url || null
      }));

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("settings.saveError"));
      
      setSuccess(t("settings.saveSuccess"));
      fetchWallets();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || t("settings.saveError"));
    }
    setSaving(false);
  };

  const getCoinIcon = (symbol) => {
    const icons = {
      USDT: "₿",
      USDC: "💵",
      BTC: "₿",
      ETH: "Ξ",
      BNB: "🔶"
    };
    return icons[symbol] || "💰";
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-2 sm:px-6 py-8 bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 rounded-2xl shadow-2xl border border-white/10">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#ffd700]">
          <Wallet2 size={24} className="text-[#16d79c]" />
          {t("settings.depositWalletTitle")}
        </h2>
        <div className="text-xs text-slate-400 bg-white/5 px-3 py-1 rounded-full">
          {t("settings.totalCoins")}: {wallets.length}
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-[#f34e6d]/90 to-[#fbbf24]/80 text-white p-3 rounded-lg mb-4 font-semibold shadow flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#181b25] p-3 rounded-lg mb-4 font-bold flex items-center gap-2 shadow">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-[#FFD700] mr-2" size={30} />
          <span className="text-yellow-200 font-bold">{t("common.loading")}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {wallets.map((w, i) => (
            <div 
              key={w.symbol} 
              className="bg-gradient-to-r from-[#232836]/80 to-[#1a1f2a]/80 p-5 rounded-xl shadow-lg border border-[#ffd70022] hover:border-[#ffd70044] transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Coin Info */}
                <div className="min-w-[160px] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd700]/20 to-[#16d79c]/20 flex items-center justify-center text-xl">
                    {getCoinIcon(w.symbol)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{w.name}</p>
                    <p className="text-xs text-[#ffd700] font-mono">{w.symbol}</p>
                  </div>
                </div>

                {/* Address Input */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {t("settings.walletAddress")}
                  </label>
                  <input
                    type="text"
                    value={w.address || ""}
                    onChange={e => handleAddressChange(i, e.target.value)}
                    placeholder={t("settings.enterWalletAddress")}
                    className="w-full px-3 py-2 rounded-xl border border-gray-600 bg-[#181b25] text-white font-mono text-sm shadow focus:outline-none focus:border-[#16d79c] transition-colors"
                  />
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center min-w-[120px]">
                  <label className="text-xs font-semibold text-slate-400 mb-1">
                    {t("settings.qrCode")}
                  </label>
                  <div className="relative">
                    {(w.qr_preview || w.qr_url) ? (
                      <img
                        src={w.qr_preview || w.qr_url}
                        alt={`${w.symbol} ${t("settings.qrCode")}`}
                        className="w-20 h-20 object-contain rounded-lg bg-white p-1 border-2 border-[#ffd70077] shadow-md hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center rounded-lg bg-gray-700 text-gray-400 text-xs border border-gray-600">
                        {t("settings.noQR")}
                      </div>
                    )}
                    
                    {w.isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#ffd700]" size={20} />
                      </div>
                    )}
                  </div>
                  
                  <label className={`mt-2 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#ffd700]/80 to-[#16d79c]/80 text-[#232836] font-bold shadow text-xs transition-all cursor-pointer hover:shadow-lg ${w.isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}>
                    {w.isUploading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <UploadCloud size={12} />
                    )}
                    {w.isUploading ? t("settings.uploading") : t("settings.uploadQR")}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleQRUpload(i, e.target.files[0])}
                      className="hidden"
                      disabled={w.isUploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={handleSave}
        className="mt-8 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#FFD700] to-[#16d79c] text-[#232836] font-bold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={saving || wallets.some(w => w.isUploading)}
      >
        {saving && <Loader2 className="animate-spin" size={19} />}
        {saving ? t("common.saving") : t("common.saveSettings")}
      </button>
    </div>
  );
}