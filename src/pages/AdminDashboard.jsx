// src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import AdminUsers from "../components/AdminUsers";
import AdminDeposits from "../components/AdminDeposits";
import AdminWithdrawals from "../components/AdminWithdrawals";
import DepositWalletSettings from "../components/DepositWalletSettings";
import AdminPhone from "../components/AdminPhone";
import AdminBalance from "../components/AdminBalance";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, DollarSign, Settings, Banknote, KeyRound, 
  Phone, ShieldCheck, LogOut, Sparkles, Activity, Bell,
  Menu, X, LayoutDashboard, Wallet, ArrowRightLeft, Coins
} from "lucide-react";

const tabList = [
  { key: "users", label: "Users", icon: <Users size={18} />, color: "from-emerald-500 to-teal-500" },
  { key: "phone", label: "Phone", icon: <Phone size={18} />, color: "from-sky-500 to-blue-500" },
  { key: "deposits", label: "Deposits", icon: <DollarSign size={18} />, color: "from-cyan-500 to-teal-500" },
  { key: "walletSettings", label: "Wallet Settings", icon: <Wallet size={18} />, color: "from-indigo-500 to-purple-500" },
  { key: "withdrawals", label: "Withdrawals", icon: <ArrowRightLeft size={18} />, color: "from-rose-500 to-pink-500" },
  { key: "balance", label: "Balance", icon: <Coins size={18} />, color: "from-amber-500 to-yellow-600" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("adminActiveTab") || "users";
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ email: "", role: "admin" });

  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdminInfo({ email: payload.email || payload.sub || "Admin", role: "Administrator" });
      } catch (e) {
        setAdminInfo({ email: "Admin", role: "Administrator" });
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminActiveTab');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0d16]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#ffd700]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#16d79c]/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar - Clean layout */}
      <div className="sticky top-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#ffd700]/20 to-[#16d79c]/20">
                <LayoutDashboard className="w-6 h-6 text-[#ffd700]" />
              </div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-[#ffd700] to-[#16d79c] bg-clip-text text-transparent">
                NovaChain Admin
              </h1>
            </div>

            {/* Desktop Navigation - Pages Tabs + User Actions in one row */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Pages Tabs */}
              <div className="flex gap-1 bg-[#1a1f2e]/50 rounded-xl p-1 border border-white/10">
                {tabList.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      px-4 py-2 rounded-lg font-bold text-sm transition-all
                      ${activeTab === tab.key 
                        ? `bg-gradient-to-r ${tab.color} text-[#181b25] shadow-md` 
                        : "text-gray-400 hover:text-white hover:bg-white/5"}
                    `}
                  >
                    <span className="flex items-center gap-2">
                      {tab.icon}
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* User Actions - Same row as tabs */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-sm text-gray-300">
                    {adminInfo.email}
                  </span>
                </div>
                <LanguageSwitcher />
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:scale-105 transition-all"
                >
                  <KeyRound size={14} />
                  Password
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-sm hover:scale-105 transition-all"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-3 pt-3 border-t border-white/10"
              >
                {/* Mobile Tabs */}
                <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-white/10">
                  {tabList.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                        activeTab === tab.key
                          ? `bg-gradient-to-r ${tab.color} text-[#181b25]`
                          : "bg-[#1e2434] text-gray-400"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {tab.icon}
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
                {/* Mobile User Actions */}
                <div className="flex flex-col gap-2">
                  <div className="px-3 py-2 rounded-lg bg-white/5">
                    <span className="text-sm text-gray-300">{adminInfo.email}</span>
                  </div>
                  <LanguageSwitcher />
                  <button
                    onClick={() => {
                      setShowPasswordModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm"
                  >
                    <KeyRound size={16} />
                    Change Password
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-sm"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Content Container */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-br from-white/5 via-[#191e29]/80 to-[#181b25]/90 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <AdminUsers />
                </motion.div>
              )}

              {activeTab === "phone" && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <AdminPhone />
                </motion.div>
              )}

              {activeTab === "deposits" && (
                <motion.div
                  key="deposits"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <AdminDeposits />
                </motion.div>
              )}

              {activeTab === "walletSettings" && (
                <motion.div
                  key="walletSettings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <DepositWalletSettings />
                </motion.div>
              )}

              {activeTab === "withdrawals" && (
                <motion.div
                  key="withdrawals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <AdminWithdrawals />
                </motion.div>
              )}

              {activeTab === "balance" && (
                <motion.div
                  key="balance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <AdminBalance />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}