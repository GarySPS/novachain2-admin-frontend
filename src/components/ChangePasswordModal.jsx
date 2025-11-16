// src/components/ChangePasswordModal.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Loader2, X, ShieldCheck } from "lucide-react";
import { API_BASE as ADMIN_API_BASE } from "../config"; // <-- Use the correct import name

export default function ChangePasswordModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: '...' }

  const getToken = () => localStorage.getItem("adminToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // 1. Frontend Validation
    if (!oldPassword || !newPassword || !verifyPassword) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== verifyPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    // 2. API Call
    setIsLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${ADMIN_API_BASE}/api/admin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      // Success
      setMessage({ type: "success", text: "Password changed successfully!" });
      setOldPassword("");
      setNewPassword("");
      setVerifyPassword("");
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md rounded-2xl shadow-2xl bg-gradient-to-br from-[#191e29] to-[#181b25] border border-white/10 p-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal on content click
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl font-extrabold mb-5 tracking-tight text-[#ffd700] flex items-center gap-2">
          <KeyRound size={24} className="text-[#3af0ff]" />
          Change Admin Password
        </h3>

        {/* Message Area */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-4 p-3 rounded-lg font-semibold text-center ${
                message.type === "error"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">
              Current Password
            </label>
            {/* --- 💅 POLISHED INPUT --- */}
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2c3040] text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3af0ff] focus:border-transparent placeholder:text-gray-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">
              New Password
            </label>
            {/* --- 💅 POLISHED INPUT --- */}
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2c3040] text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3af0ff] focus:border-transparent placeholder:text-gray-500"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">
              Verify New Password
            </label>
            {/* --- 💅 POLISHED INPUT --- */}
            <input
              type="password"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#2c3040] text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3af0ff] focus:border-transparent placeholder:text-gray-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {/* --- 💅 POLISHED BUTTON --- */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 rounded-lg font-bold bg-[#374151] text-gray-200 hover:bg-[#4b5563] transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg font-bold bg-gradient-to-r from-[#16d79c] to-[#3af0ff] text-[#181b25] shadow hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShieldCheck size={18} />
              )}
              {isLoading ? "Saving..." : "Save Password"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}