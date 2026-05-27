// src/pages/AdminDashboard.jsx

import React, { useState } from "react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import AdminUsers from "../components/AdminUsers";
import AdminDeposits from "../components/AdminDeposits";
import AdminWithdrawals from "../components/AdminWithdrawals";
import DepositWalletSettings from "../components/DepositWalletSettings";
import AdminPhone from "../components/AdminPhone";
import AdminBalance from "../components/AdminBalance";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { motion, AnimatePresence } from "framer-motion";
import { Users, DollarSign, Settings, Banknote, PlusCircle, KeyRound, Phone, LogOut } from "lucide-react";

const tabList = [
  { key: "users", label: "Users", icon: <Users size={18} /> },
  { key: "phone", label: "Phone", icon: <Phone size={18} /> },
  { key: "deposits", label: "Deposits", icon: <DollarSign size={18} /> },
  { key: "withdrawals", label: "Withdrawals", icon: <Banknote size={18} /> },
  { key: "balance", label: "Adjust Balance", icon: <PlusCircle size={18} /> },
  { key: "walletSettings", label: "Deposit Settings", icon: <Settings size={18} /> },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    window.location.href = '/';
  };

  return (
    <div className="w-full flex flex-col">
      {/* Sleek Modern Top Navigation */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-6 bg-[#131722]/90 backdrop-blur-md rounded-2xl border border-white/5 p-2 shadow-lg">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar w-full xl:w-auto gap-1 pb-2 xl:pb-0">
          {tabList
            .filter(tab => tab.key !== "walletSettings" || localStorage.getItem('adminRole') === 'superadmin')
            .map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                  ${activeTab === tab.key 
                    ? "bg-white/10 text-[#ffd700] shadow-sm" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"}
                `}
              >
                <span className={activeTab === tab.key ? "opacity-100" : "opacity-60"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 px-2 shrink-0 w-full xl:w-auto justify-end">
          <LanguageSwitcher />
          
          <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white text-sm font-bold transition-colors"
          >
            <KeyRound size={16} className="text-sky-400" />
            <span className="hidden sm:inline">Password</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-sm font-bold transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Clean Content Container without double-boxing */}
      <div className="w-full relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <AdminUsers />
            </motion.div>
          )}

          {activeTab === "deposits" && (
            <motion.div key="deposits" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <AdminDeposits />
            </motion.div>
          )}

          {activeTab === "walletSettings" && (
            <motion.div key="walletSettings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <DepositWalletSettings />
            </motion.div>
          )}

          {activeTab === "withdrawals" && (
            <motion.div key="withdrawals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <AdminWithdrawals />
            </motion.div>
          )}

          {activeTab === "balance" && (
            <motion.div key="balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <AdminBalance />
            </motion.div>
          )}
          
          {activeTab === "phone" && (
            <motion.div key="phone" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <AdminPhone />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}