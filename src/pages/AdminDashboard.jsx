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
  Users, DollarSign, Settings, Banknote, PlusCircle, KeyRound, 
  Phone, ShieldCheck, LogOut, Sparkles, Activity, Bell,
  Menu, X, LayoutDashboard, Wallet, ArrowRightLeft, Coins
} from "lucide-react";

const tabList = [
  { 
    key: "users", 
    label: "Users", 
    icon: <Users size={18} />, 
    color: "from-emerald-500 to-teal-500",
    bgColor: "emerald-500/20",
    description: "Manage user accounts and KYC"
  },
  { 
    key: "phone", 
    label: "Phone", 
    icon: <Phone size={18} />, 
    color: "from-sky-500 to-blue-500",
    bgColor: "sky-500/20",
    description: "Manage phone verifications"
  },
  { 
    key: "deposits", 
    label: "Deposits", 
    icon: <DollarSign size={18} />, 
    color: "from-cyan-500 to-teal-500",
    bgColor: "cyan-500/20",
    description: "Review deposit requests"
  },
  { 
    key: "walletSettings", 
    label: "Wallet Settings", 
    icon: <Wallet size={18} />, 
    color: "from-indigo-500 to-purple-500",
    bgColor: "indigo-500/20",
    description: "Configure deposit addresses"
  },
  { 
    key: "withdrawals", 
    label: "Withdrawals", 
    icon: <ArrowRightLeft size={18} />, 
    color: "from-rose-500 to-pink-500",
    bgColor: "rose-500/20",
    description: "Process withdrawal requests"
  },
  { 
    key: "balance", 
    label: "Balance", 
    icon: <Coins size={18} />, 
    color: "from-amber-500 to-yellow-600",
    bgColor: "amber-500/20",
    description: "Adjust user balances"
  },
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

  const getActiveTabConfig = () => {
    return tabList.find(tab => tab.key === activeTab) || tabList[0];
  };

  const activeConfig = getActiveTabConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0d16]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#ffd700]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#16d79c]/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <div className="sticky top-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#ffd700]/20 to-[#16d79c]/20">
                <LayoutDashboard className="w-6 h-6 text-[#ffd700]" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-[#ffd700] to-[#16d79c] bg-clip-text text-transparent">
                  NovaChain Admin
                </h1>
                <p className="text-xs text-gray-500">Control Panel v2.0</p>
              </div>
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Welcome Message */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <ShieldCheck size={14} className="text-[#ffd700]" />
                <span className="text-sm text-gray-300">
                  Welcome, <span className="text-[#ffd700] font-semibold">{adminInfo.email}</span>
                </span>
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Change Password Button */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg"
              >
                <KeyRound size={16} />
                Change Password
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg"
              >
                <LogOut size={16} />
                Logout
              </button>
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
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                    <ShieldCheck size={14} className="text-[#ffd700]" />
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Current Activity Indicator */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffd700]/10 border border-[#ffd700]/20">
            <Activity size={14} className="text-[#ffd700]" />
            <span className="text-xs text-[#ffd700]">Active Module</span>
            <span className="text-xs font-bold text-white ml-1">{activeConfig.label}</span>
          </div>
          <div className="flex-1" />
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
            <Sparkles size={12} />
            <span>Real-time updates</span>
          </div>
        </div>

        {/* Premium Navigation Tabs - Desktop */}
        <div className="hidden lg:block mb-8">
          <div className="bg-gradient-to-r from-[#1a1f2e]/50 to-[#131724]/50 rounded-2xl p-1.5 border border-white/10 backdrop-blur">
            <div className="flex gap-1">
              {tabList.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                    font-extrabold text-sm transition-all duration-300 overflow-hidden
                    ${activeTab === tab.key 
                      ? "text-[#181b25]" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"}
                  `}
                >
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-2 ${activeTab === tab.key ? "text-[#181b25]" : ""}`}>
                    {tab.icon}
                    {tab.label}
                  </span>
                  {activeTab === tab.key && (
                    <motion.div
                      className="absolute -bottom-px left-0 right-0 h-0.5 bg-white/50"
                      layoutId="activeUnderline"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Scrollable */}
        <div className="lg:hidden mb-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max pb-2">
            {tabList.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap
                  ${activeTab === tab.key 
                    ? `bg-gradient-to-r ${tab.color} text-[#181b25] shadow-lg scale-105` 
                    : "bg-[#1e2434] text-gray-400 hover:text-white"}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Description */}
        <motion.div
          key={`desc-${activeTab}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#1a1f2e]/30 to-transparent border-l-4 border-[#ffd700]"
        >
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Sparkles size={14} className="text-[#ffd700]" />
            {activeConfig.description}
          </p>
        </motion.div>

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
                  className="w-full"
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
                  className="w-full"
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
                  className="w-full"
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
                  className="w-full"
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
                  className="w-full"
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
                  className="w-full"
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