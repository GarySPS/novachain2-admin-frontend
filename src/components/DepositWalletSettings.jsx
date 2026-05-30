// src/components/DepositWalletSettings.jsx

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  Loader2,
  Save,
  UploadCloud,
  Wallet2,
  X,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { API_BASE } from "../config";

const SUPABASE_URL = "https://obrfnkggcfgfspyqgtws.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJvYnJmbmtnZ2NmZ2ZzcHlxZ3R3cyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzYzMjM5MjUwLCJleHAiOjIwNzg4MTUyNTB9.fMvyyXxfQn3kSA1phf1-qRnMN-BvtbMIaTwGD0I";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const supportedCoins = [
  { symbol: "USDT", name: "Tether USDT" },
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "BNB", name: "BNB" },
];

const API_URL = `${API_BASE}/api/admin/deposit-addresses`;

export default function DepositWalletSettings() {
  const [wallets, setWallets] = useState(
    supportedCoins.map((coin) => ({
      ...coin,
      address: "",
      qr_url: "",
      qr_preview: null,
      isUploading: false,
    }))
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewQR, setPreviewQR] = useState(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch wallet settings.");
      }

      setWallets(
        supportedCoins.map((coin) => {
          const found = Array.isArray(data)
            ? data.find((wallet) => wallet.coin === coin.symbol)
            : null;

          return found
            ? {
                ...coin,
                ...found,
                qr_preview: null,
                isUploading: false,
              }
            : {
                ...coin,
                address: "",
                qr_url: "",
                qr_preview: null,
                isUploading: false,
              };
        })
      );
    } catch (err) {
      setError(err.message || "Network error.");
    }

    setLoading(false);
  };

  const handleAddressChange = (index, value) => {
    setWallets((current) =>
      current.map((wallet, walletIndex) =>
        walletIndex === index ? { ...wallet, address: value } : wallet
      )
    );
  };

  const handleQRUpload = async (index, file) => {
    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("QR image is too large. Maximum size is 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      setWallets((current) =>
        current.map((wallet, walletIndex) =>
          walletIndex === index
            ? { ...wallet, qr_preview: event.target.result }
            : wallet
        )
      );
    };

    reader.readAsDataURL(file);

    try {
      const coin = supportedCoins[index];
      const filePath = `deposit-qr-${coin.symbol}-${Date.now()}`;

      setWallets((current) =>
        current.map((wallet, walletIndex) =>
          walletIndex === index ? { ...wallet, isUploading: true } : wallet
        )
      );

      const { data, error: uploadError } = await supabase.storage
        .from("deposit")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicURLData } = supabase.storage
        .from("deposit")
        .getPublicUrl(data.path);

      setWallets((current) =>
        current.map((wallet, walletIndex) =>
          walletIndex === index
            ? {
                ...wallet,
                qr_url: publicURLData.publicUrl,
                qr_preview: null,
                isUploading: false,
              }
            : wallet
        )
      );

      setSuccess(`${coin.symbol} QR uploaded successfully.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error uploading QR code:", err);
      setError(`Failed to upload QR code for ${supportedCoins[index].symbol}.`);

      setWallets((current) =>
        current.map((wallet, walletIndex) =>
          walletIndex === index ? { ...wallet, isUploading: false } : wallet
        )
      );
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin session expired. Please login again.");
      }

      const payload = wallets.map((wallet) => ({
        coin: wallet.symbol,
        address: wallet.address,
        qr_url: wallet.qr_url || null,
      }));

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save wallet settings.");
      }

      setSuccess("Deposit wallet settings saved successfully.");
      await fetchWallets();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save wallet settings.");
    }

    setSaving(false);
  };

  const copyAddress = async (address) => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setSuccess("Wallet address copied.");
      setTimeout(() => setSuccess(""), 1800);
    } catch {
      setError("Failed to copy wallet address.");
    }
  };

  const walletsReady = wallets.filter((wallet) => wallet.address && wallet.qr_url).length;

  return (
    <section className="admin-wallet-settings-page">
      <div className="admin-wallet-settings-header">
        <div>
          <div className="admin-wallet-settings-kicker">
            <Wallet2 size={17} />
            Deposit Wallet Control
          </div>

          <h1>Deposit Wallet Settings</h1>
          <p>
            Manage deposit wallet addresses and QR codes for supported coins.
            Keep QR images compact and easy to review.
          </p>
        </div>

        <button
          type="button"
          className="admin-wallet-settings-save-top"
          onClick={handleSave}
          disabled={saving || wallets.some((wallet) => wallet.isUploading)}
        >
          {saving ? (
            <Loader2 size={17} className="admin-wallet-settings-spin" />
          ) : (
            <Save size={17} />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="admin-wallet-settings-stats">
        <div>
          <span>Total Coins</span>
          <strong>{wallets.length}</strong>
        </div>

        <div>
          <span>Ready</span>
          <strong>{walletsReady}</strong>
        </div>

        <div>
          <span>Missing Setup</span>
          <strong>{wallets.length - walletsReady}</strong>
        </div>
      </div>

      {error && (
        <div className="admin-wallet-settings-message error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="admin-wallet-settings-message success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-wallet-settings-loading">
          <Loader2 size={26} className="admin-wallet-settings-spin" />
          <span>Loading wallet settings...</span>
        </div>
      ) : (
        <div className="admin-wallet-settings-list">
          {wallets.map((wallet, index) => {
            const qrImage = wallet.qr_preview || wallet.qr_url;

            return (
              <div className="admin-wallet-card" key={wallet.symbol}>
                <div className="admin-wallet-coin">
                  <div className="admin-wallet-coin-icon">
                    {wallet.symbol.slice(0, 2)}
                  </div>

                  <div>
                    <strong>{wallet.symbol}</strong>
                    <span>{wallet.name}</span>
                  </div>
                </div>

                <div className="admin-wallet-address">
                  <label>Wallet Address</label>

                  <div className="admin-wallet-address-input">
                    <input
                      type="text"
                      value={wallet.address || ""}
                      onChange={(event) =>
                        handleAddressChange(index, event.target.value)
                      }
                      placeholder={`Enter ${wallet.symbol} deposit address`}
                    />

                    <button
                      type="button"
                      onClick={() => copyAddress(wallet.address)}
                      disabled={!wallet.address}
                      title="Copy address"
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </div>

                <div className="admin-wallet-qr">
                  <label>QR Code</label>

                  <div className="admin-wallet-qr-row">
                    <button
                      type="button"
                      className="admin-wallet-qr-preview"
                      onClick={() =>
                        qrImage &&
                        setPreviewQR({
                          url: qrImage,
                          title: `${wallet.symbol} Deposit QR`,
                        })
                      }
                      disabled={!qrImage}
                    >
                      {qrImage ? (
                        <>
                          <img src={qrImage} alt={`${wallet.symbol} QR`} />
                          <span>
                            <Eye size={15} />
                          </span>
                        </>
                      ) : (
                        <small>No QR</small>
                      )}

                      {wallet.isUploading && (
                        <div className="admin-wallet-qr-uploading">
                          <Loader2
                            size={18}
                            className="admin-wallet-settings-spin"
                          />
                        </div>
                      )}
                    </button>

                    <label
                      className={
                        wallet.isUploading
                          ? "admin-wallet-upload disabled"
                          : "admin-wallet-upload"
                      }
                    >
                      {wallet.isUploading ? (
                        <Loader2
                          size={15}
                          className="admin-wallet-settings-spin"
                        />
                      ) : (
                        <UploadCloud size={15} />
                      )}
                      {wallet.isUploading ? "Uploading..." : "Upload QR"}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          handleQRUpload(index, event.target.files?.[0])
                        }
                        disabled={wallet.isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && (
        <div className="admin-wallet-settings-footer">
          <div>
            <strong>Review before saving</strong>
            <span>Changes are not final until you click Save Settings.</span>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || wallets.some((wallet) => wallet.isUploading)}
          >
            {saving ? (
              <Loader2 size={18} className="admin-wallet-settings-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      )}

      {previewQR && (
        <div
          className="admin-wallet-preview-backdrop"
          onClick={() => setPreviewQR(null)}
        >
          <div
            className="admin-wallet-preview"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-wallet-preview-head">
              <strong>{previewQR.title}</strong>
              <button type="button" onClick={() => setPreviewQR(null)}>
                <X size={18} />
              </button>
            </div>

            <img src={previewQR.url} alt={previewQR.title} />
          </div>
        </div>
      )}
    </section>
  );
}