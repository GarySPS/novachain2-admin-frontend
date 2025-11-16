import React, { useState, useEffect } from "react";
import { Loader2, BadgeCheck, XCircle, Image, ShieldCheck } from "lucide-react";
import { API_BASE, MAIN_API_BASE } from "../config";

export default function KYCModal({ open, onClose, user, onAction }) {
  const [kyc, setKyc] = useState({ selfie: "", id_card: "" });
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !user) return;
    const fetchKYC = async () => {
      try {
        const res = await fetch(`${ADMIN_API_BASE}/api/admin/user/${user.id}/kyc`);
        if (!res.ok) throw new Error("Could not load KYC docs");
        const data = await res.json();
        setKyc({
          selfie: data.kyc_selfie ? (data.kyc_selfie.startsWith("http") ? data.kyc_selfie : `${MAIN_API_BASE}${data.kyc_selfie}`) : "",
          id_card: data.kyc_id_card ? (data.kyc_id_card.startsWith("http") ? data.kyc_id_card : `${MAIN_API_BASE}${data.kyc_id_card}`) : "",
        });
      } catch {
        setKyc({ selfie: "", id_card: "" });
      }
    };
    fetchKYC();
  }, [open, user]);

  const handleKYC = async (action) => {
    setLoading(action);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${ADMIN_API_BASE}/api/admin/user-kyc-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.id, kyc_status: action === "approve" ? "approved" : "rejected" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (onAction) onAction(action);
      onClose();
    } catch (err) {
      setError(err.message || "Network error");
    }
    setLoading("");
  };

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[99] flex items-center justify-center px-2">
      <div className="bg-gradient-to-br from-white/10 via-[#181b25]/90 to-[#222b3a]/90 border border-[#16d79c44] rounded-2xl shadow-2xl px-7 py-6 w-full max-w-lg relative">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#ffd700] mb-6">
          <ShieldCheck size={21} className="text-[#16d79c]" />
          KYC Documents for User ID {user.id}
        </h2>
        {error && (
          <div className="bg-gradient-to-r from-[#f34e6d]/80 to-[#fbbf24]/80 text-white p-2 rounded-lg mb-4 font-semibold shadow">
            {error}
          </div>
        )}
        <div className="mb-4">
          <div className="flex items-center gap-1 text-[#16d79c] font-bold mb-1"><Image size={15}/>Selfie:</div>
          {kyc.selfie ? (
            <img src={kyc.selfie} alt="KYC Selfie" className="w-32 rounded-lg border-2 border-[#16d79c] bg-white mb-2 shadow" />
          ) : (
            <span className="text-gray-400">No selfie uploaded</span>
          )}
        </div>
        <div className="mb-4">
          <div className="flex items-center gap-1 text-[#ffd700] font-bold mb-1"><Image size={15}/>ID Card:</div>
          {kyc.id_card ? (
            <img src={kyc.id_card} alt="KYC ID" className="w-48 rounded-lg border-2 border-[#ffd700] bg-white shadow" />
          ) : (
            <span className="text-gray-400">No ID uploaded</span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <button
            onClick={() => handleKYC("approve")}
            className="px-4 py-2 bg-gradient-to-r from-[#16d79c] to-[#ffd700] text-[#181b25] rounded-lg font-bold shadow hover:opacity-90 transition flex items-center gap-1"
            disabled={loading === "approve"}
          >
            {loading === "approve"
              ? <Loader2 className="animate-spin" size={17} />
              : <BadgeCheck size={17} />}
            {loading === "approve" ? "" : "Approve"}
          </button>
          <button
            onClick={() => handleKYC("reject")}
            className="px-4 py-2 bg-gradient-to-r from-[#f34e6d] to-[#ffd700] text-[#181b25] rounded-lg font-bold shadow hover:opacity-90 transition flex items-center gap-1"
            disabled={loading === "reject"}
          >
            {loading === "reject"
              ? <Loader2 className="animate-spin" size={17} />
              : <XCircle size={17} />}
            {loading === "reject" ? "" : "Reject"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-[#a5b4fc] to-[#232836] text-[#232836] rounded-lg font-bold shadow hover:opacity-90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
