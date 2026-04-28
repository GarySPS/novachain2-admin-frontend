//src>components>DepositWalletSettings.jsx

import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  Loader2, Wallet2, Image as LucideImage, UploadCloud, CheckCircle2, 
  Copy, Check, AlertCircle, ExternalLink, QrCode, RefreshCw,
  ChevronDown, ChevronUp, Trash2, Eye, EyeOff, Shield, Database
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { API_BASE } from "../config";

// Supabase Configuration
const SUPABASE_URL = "https://obrfnkggcfgfspyqgtws.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icmZua2dnY2ZnZnNweXFndHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzkyNTAsImV4cCI6MjA3ODgxNTI1MH0.fMvyyXxfQn3dTzkiCA1phf1-qRnMN-BvtbMIaTwGD0I";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const supportedCoins = [
  { symbol: "USDT", name: "Tether USDT", network: "TRC20 / ERC20", color: "from-green-500/20 to-emerald-600/20", icon: "💵" },
  { symbol: "USDC", name: "USD Coin", network: "ERC20 / Solana", color: "from-blue-500/20 to-cyan-600/20", icon: "💎" },
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin Network", color: "from-orange-500/20 to-amber-600/20", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", network: "ERC20 Network", color: "from-purple-500/20 to-violet-600/20", icon: "Ξ" },
  { symbol: "BNB", name: "BNB", network: "BEP20 / BSC", color: "from-yellow-500/20 to-amber-600/20", icon: "🔶" },
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
      isUploading: false,
      isExpanded: true,
      copied: false
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAddress, setEditingAddress] = useState(null);
  const fileInputRefs = useRef({});

  useEffect(() => {
    fetchWallets();
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
          return found 
            ? { ...c, ...found, qr_preview: null, isUploading: false, isExpanded: true, copied: false } 
            : { ...c, address: "", qr_url: "", qr_preview: null, isUploading: false, isExpanded: true, copied: false };
        })
      );
    } catch (err) {
      setError(err.message || t("settings.networkError"));
      setTimeout(() => setError(""), 5000);
    }
    setLoading(false);
  };

  const handleAddressChange = (i, value) => {
    setWallets(ws => ws.map((w, idx) => (idx === i ? { ...w, address: value } : w)));
  };

  const copyToClipboard = async (text, i) => {
    try {
      await navigator.clipboard.writeText(text);
      setWallets(ws => ws.map((w, idx) => (idx === i ? { ...w, copied: true } : w)));
      setTimeout(() => {
        setWallets(ws => ws.map((w, idx) => (idx === i ? { ...w, copied: false } : w)));
      }, 2000);
    } catch (err) {
      setError(t("settings.copyError"));
    }
  };

  const handleQRUpload = async (i, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t("settings.invalidImageType"));
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("settings.fileTooLarge"));
      setTimeout(() => setError(""), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setWallets(ws => ws.map((w, idx) => idx === i ? { ...w, qr_preview: e.target.result } : w));
    };
    reader.readAsDataURL(file);

    try {
      const filePath = `deposit-qr-${supportedCoins[i].symbol}-${Date.now()}`;
      
      setWallets(ws => ws.map((w, idx) => idx === i ? { ...w, isUploading: true } : w));

      const { data, error } = await supabase.storage
        .from('deposit')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicURLData } = supabase.storage.from('deposit').getPublicUrl(data.path);
      const publicUrl = publicURLData.publicUrl;

      setWallets(ws => ws.map((w, idx) => idx === i ? { ...w, qr_url: publicUrl, isUploading: false, qr_preview: null } : w));
      setSuccess(`${supportedCoins[i].symbol} ${t("settings.uploadSuccess")}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error uploading QR code:", err);
      setError(`${supportedCoins[i].symbol} ${t("settings.uploadError")}`);
      setWallets(ws => ws.map((w, idx) => idx === i ? { ...w, isUploading: false, qr_preview: null } : w));
      setTimeout(() => setError(""), 3000);
    }
  };

  const removeQR = async (i) => {
    if (!window.confirm(t("settings.removeQRConfirm"))) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      const wallet = wallets[i];
      
      // Update in database
      const payload = [{
        coin: wallet.symbol,
        address: wallet.address,
        qr_url: null
      }];
      
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error();
      
      setWallets(ws => ws.map((w, idx) => idx === i ? { ...w, qr_url: null, qr_preview: null } : w));
      setSuccess(t("settings.qrRemoved"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(t("settings.removeQRError"));
      setTimeout(() => setError(""), 3000);
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("settings.saveError"));
      
      setSuccess(t("settings.saveSuccess"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || t("settings.saveError"));
      setTimeout(() => setError(""), 3000);
    }
    setSaving(false);
  };

  const toggleExpand = (i) => {
    setWallets(ws => ws.map((w, idx) => idx === i ? { ...w, isExpanded: !w.isExpanded } : w));
  };

  const filteredWallets = wallets.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.network.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasChanges = wallets.some(w => w.address !== undefined);
  const allConfigured = wallets.filter(w => w.address && w.address.trim()).length;
  const configuredCount = allConfigured;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0d16] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#ffd700]/20 to-[#16d79c]/20">
              <Wallet2 className="w-8 h-8 text-[#ffd700]" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#ffd700] via-[#f0b90b] to-[#16d79c] bg-clip-text text-transparent">
                {t("settings.depositWalletTitle")}
              </h1>
              <p className="text-gray-400 mt-1">{t("settings.depositWalletSubtitle")}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-[#ffd700]/10">
              <div className="flex items-center justify-between">
                <Database size={20} className="text-[#ffd700]" />
                <span className="text-xs text-gray-500">{t("settings.totalCoins")}</span>
              </div>
              <div className="text-2xl font-bold text-white mt-2">{wallets.length}</div>
            </div>
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-green-500/10">
              <div className="flex items-center justify-between">
                <CheckCircle2 size={20} className="text-green-500" />
                <span className="text-xs text-gray-500">{t("settings.configured")}</span>
              </div>
              <div className="text-2xl font-bold text-green-500 mt-2">{configuredCount}</div>
            </div>
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-blue-500/10">
              <div className="flex items-center justify-between">
                <QrCode size={20} className="text-blue-500" />
                <span className="text-xs text-gray-500">{t("settings.withQR")}</span>
              </div>
              <div className="text-2xl font-bold text-blue-500 mt-2">{wallets.filter(w => w.qr_url).length}</div>
            </div>
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#131724] rounded-xl p-4 border border-[#ffd700]/10">
              <div className="flex items-center justify-between">
                <Shield size={20} className="text-[#ffd700]" />
                <span className="text-xs text-gray-500">{t("settings.status")}</span>
              </div>
              <div className="text-2xl font-bold text-[#ffd700] mt-2">{configuredCount === wallets.length ? "✓" : "⚠️"}</div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Search and Actions Bar */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t("settings.searchCoins")}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#1e2434] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700] transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchWallets}
                  className="px-4 py-2.5 bg-[#1e2434] border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-all flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  {t("common.refresh")}
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/50">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle size={18} />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-green-500/20 border border-green-500/50">
              <div className="flex items-center gap-2 text-green-300">
                <CheckCircle2 size={18} />
                <span className="font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#ffd700] mb-3" size={40} />
              <span className="text-gray-400">{t("common.loading")}</span>
            </div>
          ) : (
            <>
              {/* Wallets Grid */}
              <div className="p-6 space-y-4">
                {filteredWallets.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet2 size={48} className="mx-auto text-gray-500 mb-3" />
                    <p className="text-gray-400">{t("settings.noWalletsFound")}</p>
                  </div>
                ) : (
                  filteredWallets.map((wallet, i) => {
                    const originalIndex = wallets.findIndex(w => w.symbol === wallet.symbol);
                    return (
                      <div
                        key={wallet.symbol}
                        className={`bg-gradient-to-r ${wallet.color} rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-[#ffd700]/30`}
                      >
                        {/* Expandable Header */}
                        <button
                          onClick={() => toggleExpand(originalIndex)}
                          className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffd700]/20 to-[#16d79c]/20 flex items-center justify-center text-2xl">
                              {wallet.icon}
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-white text-lg">{wallet.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-[#ffd700] font-mono">{wallet.symbol}</span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-400">{wallet.network}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {wallet.address && (
                              <span className="hidden sm:inline-block text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                                {t("settings.configured")}
                              </span>
                            )}
                            {wallet.qr_url && (
                              <QrCode size={16} className="text-blue-400" />
                            )}
                            {wallet.isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                          </div>
                        </button>

                        {/* Expandable Content */}
                        {wallet.isExpanded && (
                          <div className="p-5 pt-0 border-t border-white/10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Address Section */}
                              <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                                  <Shield size={14} className="text-[#ffd700]" />
                                  {t("settings.walletAddress")}
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={wallet.address || ""}
                                    onChange={e => handleAddressChange(originalIndex, e.target.value)}
                                    placeholder={t("settings.enterWalletAddress")}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#181b25] text-white font-mono text-sm focus:outline-none focus:border-[#16d79c] focus:ring-2 focus:ring-[#16d79c]/20 transition-all pr-24"
                                  />
                                  {wallet.address && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                      <button
                                        onClick={() => copyToClipboard(wallet.address, originalIndex)}
                                        className="p-1.5 rounded-lg bg-[#1e2434] hover:bg-[#252b3d] transition-colors"
                                        title={t("common.copy")}
                                      >
                                        {wallet.copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-400" />}
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {wallet.address && (
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span>{t("settings.addressDetected")}</span>
                                  </div>
                                )}
                              </div>

                              {/* QR Code Section */}
                              <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-300 flex items-center gap-2">
                                  <QrCode size={14} className="text-[#ffd700]" />
                                  {t("settings.qrCode")}
                                </label>
                                <div className="flex items-start gap-4">
                                  <div className="relative">
                                    {(wallet.qr_preview || wallet.qr_url) ? (
                                      <div className="group relative">
                                        <img
                                          src={wallet.qr_preview || wallet.qr_url}
                                          alt={`${wallet.symbol} ${t("settings.qrCode")}`}
                                          className="w-24 h-24 object-contain rounded-xl bg-white p-2 border-2 border-[#ffd700] shadow-lg cursor-pointer hover:scale-105 transition-transform"
                                          onClick={() => window.open(wallet.qr_preview || wallet.qr_url, "_blank")}
                                        />
                                        <button
                                          onClick={() => removeQR(originalIndex)}
                                          className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="w-24 h-24 flex items-center justify-center rounded-xl bg-[#1e2434] border-2 border-dashed border-gray-600 text-gray-500">
                                        <QrCode size={32} />
                                      </div>
                                    )}
                                    
                                    {wallet.isUploading && (
                                      <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
                                        <Loader2 className="animate-spin text-[#ffd700]" size={24} />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd700]/20 to-[#16d79c]/20 text-[#ffd700] font-semibold text-sm transition-all cursor-pointer hover:from-[#ffd700]/30 hover:to-[#16d79c]/30 ${wallet.isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                      {wallet.isUploading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                      ) : (
                                        <UploadCloud size={16} />
                                      )}
                                      {wallet.isUploading ? t("settings.uploading") : (wallet.qr_url ? t("settings.changeQR") : t("settings.uploadQR"))}
                                      <input
                                        ref={el => fileInputRefs.current[originalIndex] = el}
                                        type="file"
                                        accept="image/*"
                                        onChange={e => handleQRUpload(originalIndex, e.target.files[0])}
                                        className="hidden"
                                        disabled={wallet.isUploading}
                                      />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">
                                      {t("settings.qrHint")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Save Button */}
              <div className="p-6 border-t border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                <button
                  onClick={handleSave}
                  className={`w-full py-4 rounded-xl font-extrabold text-[#181b25] shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
                    saving ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] hover:shadow-2xl"
                  } bg-gradient-to-r from-[#ffd700] to-[#16d79c]`}
                  disabled={saving || wallets.some(w => w.isUploading)}
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span>{t("common.saving")}</span>
                    </>
                  ) : (
                    <>
                      <Database size={20} />
                      <span className="tracking-wide">{t("common.saveAllSettings")}</span>
                      {hasChanges && configuredCount > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                          {configuredCount}/{wallets.length}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}