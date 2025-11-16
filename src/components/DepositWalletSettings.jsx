import React, { useEffect, useState } from "react";
import { Loader2, Wallet2, Image as LucideImage, UploadCloud, CheckCircle2 } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// --- NEW: Add Supabase Client ---
// (I got these from your WalletPage.js file)
const SUPABASE_URL = "https://obrfnkggcfgfspyqgtws.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icmZua2dnY2ZnZnNweXFndHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzkyNTAsImV4cCI6MjA3ODgxNTI1MH0.fMvyyXxfQn3dTzkiCA1phf1-qRnMN-BvtbMIaTwGD0I";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ---------------------------------

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
      if (!res.ok) throw new Error(data.message || "Failed to fetch deposit settings");

      setWallets(
        supportedCoins.map(c => {
          const found = data.find(w => w.coin === c.symbol);
          return found ? { ...c, ...found, qr_preview: null, isUploading: false } : { ...c, address: "", qr_url: "", qr_preview: null, isUploading: false };
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

  // --- NEW: handleQRUpload (uploads file directly) ---
  const handleQRUpload = async (i, file) => {
    if (!file) return;

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
      
      // Set loading state for this specific wallet
      setWallets(ws =>
        ws.map((w, idx) => (idx === i ? { ...w, isUploading: true } : w))
      );

      const { data, error } = await supabase.storage
        .from('deposit') // Use your 'deposit' bucket
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite if file exists (optional)
        });

      if (error) throw error;

      // 3. Get the public URL
      const { data: publicURLData } = supabase.storage
        .from('deposit')
        .getPublicUrl(data.path);
      
      const publicUrl = publicURLData.publicUrl;

      // 4. Update state with the final URL
      setWallets(ws =>
        ws.map((w, idx) =>
          idx === i
            ? { ...w, qr_url: publicUrl, isUploading: false, qr_preview: null } // Clear preview
            : w
        )
      );

   } catch (err) {
      console.error("Error uploading QR code:", err);
      setError(`Failed to upload QR for ${supportedCoins[i].symbol}`);
      setWallets(ws =>
        ws.map((w, idx) => (idx === i ? { ...w, isUploading: false } : w))
      );
    }
  };
  // -------------------------------------------------

  // --- NEW: handleSave (sends JSON, not FormData) ---
  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Not logged in as admin");

      // Filter for only the data the backend needs
      const payload = wallets.map(w => ({
        coin: w.symbol,
        address: w.address,
        qr_url: w.qr_url || null // Send null if empty
      }));

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { // <-- ERROR WAS HERE
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // Set content type to JSON
        },
        body: JSON.stringify(payload), // Send the JSON payload
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      setSuccess("Deposit settings saved!");
      fetchWallets(); // Reload data from DB
    } catch (err) {
      setError(err.message || "Failed to save settings");
    }
    setSaving(false);
  };
  // ------------------------------------------------

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
              {/* --- NEW: Updated Image/Upload Logic --- */}
              <div className="flex flex-col items-center">
                {(w.qr_preview || w.qr_url) ? (
                  <img 
                    src={w.qr_preview || w.qr_url} 
                    alt={w.symbol + " QR"} 
                    className="w-20 h-20 rounded-lg bg-white border border-[#ffd70077] shadow mb-2" 
                  />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center rounded-lg bg-white text-gray-400 text-xs mb-2 border border-[#eee]">
                    No QR
                  </div>
                )}
                <label className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-[#ffd700]/80 to-[#16d79c]/80 text-[#232836] font-bold shadow text-xs transition mt-1 ${w.isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}>
                  {w.isUploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : ( // <-- ERROR WAS HERE
                    <UploadCloud size={14} />
                  )}
                  {w.isUploading ? "Uploading..." : "Upload QR"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleQRUpload(i, e.target.files[0])}
                    className="hidden"
                _   disabled={w.isUploading} // <-- ERROR WAS HERE
                  />
                </label>
              </div>
              {/* ----------------------------------- */}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={handleSave}
        className="mt-8 px-8 py-3 bg-gradient-to-r from-[#FFD700] to-[#16d79c] text-[#232836] font-bold rounded-xl text-lg shadow-lg hover:opacity-90 transition flex items-center gap-2"
        disabled={saving || wallets.some(w => w.isUploading)}
      >
        {saving && <Loader2 className="animate-spin" size={19} />}
        {saving ? "Saving..." : "Save Settings"} 
      </button>
    </div>
  );
}
