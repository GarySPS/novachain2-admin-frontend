//src>pages>AdminDashboard.jsx

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
import { Users, DollarSign, Settings, Banknote, PlusCircle, KeyRound, Phone, LogOut } from "lucide-react";

const tabList = [
  { key: "users", label: "Users", icon: <Users size={18} className="mr-1 text-[#16d79c]" />, mobileIcon: <Users size={20} className="text-[#16d79c]" /> },
  { key: "phone", label: "Phone", icon: <Phone size={18} className="mr-1 text-sky-400" />, mobileIcon: <Phone size={20} className="text-sky-400" /> },
  { key: "deposits", label: "Deposits", icon: <DollarSign size={18} className="mr-1 text-[#2dd4bf]" />, mobileIcon: <DollarSign size={20} className="text-[#2dd4bf]" /> },
  { key: "walletSettings", label: "Deposit Settings", icon: <Settings size={18} className="mr-1 text-[#3af0ff]" />, mobileIcon: <Settings size={20} className="text-[#3af0ff]" /> },
  { key: "withdrawals", label: "Withdrawals", icon: <Banknote size={18} className="mr-1 text-[#f34e6d]" />, mobileIcon: <Banknote size={20} className="text-[#f34e6d]" /> },
  { key: "balance", label: "Adjust Balance", icon: <PlusCircle size={18} className="mr-1 text-[#ffd700]" />, mobileIcon: <PlusCircle size={20} className="text-[#ffd700]" /> },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-2 pb-8 px-2 sm:px-4 md:px-6">
      {/* Premium Glass Tab Bar - Responsive */}
      <div
        className="overflow-x-auto flex-nowrap mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-[#1a243c]/80 via-[#21253e]/90 to-[#131622]/90 rounded-xl sm:rounded-2xl px-2 py-2 shadow-2xl backdrop-blur-[2.5px] w-full max-w-7xl border border-white/5 no-scrollbar"
        style={{
          WebkitOverflowScrolling: "touch",
          minHeight: isMobile ? 52 : 64,
        }}
      >
        <div className="flex flex-nowrap items-center gap-1 sm:gap-2 md:gap-3 min-w-max">
          {/* Tabs - Responsive padding and sizing */}
          {tabList.map(tab => (
            <button
              key={tab.key}
              className={`
                flex items-center justify-center gap-1 sm:gap-2 
                px-2 sm:px-4 md:px-6 
                py-1.5 sm:py-2 
                rounded-lg sm:rounded-xl 
                font-extrabold text-xs sm:text-sm md:text-base 
                tracking-wide transition-all duration-200 shadow-md whitespace-nowrap
                ${activeTab === tab.key 
                  ? "bg-gradient-to-r from-[#16d79c] via-[#ffd700]/90 to-[#fffbe8] text-[#181b25] shadow-lg scale-105 ring-2 ring-[#ffd70088]" 
                  : "bg-[#23243a] text-slate-100 hover:bg-[#1f283c] hover:text-[#ffd700]"}
              `}
              style={{
                letterSpacing: 0.5,
                boxShadow: activeTab === tab.key ? "0 0 16px #16d79c33" : "none"
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {/* Show different icons based on screen size */}
              <span className="hidden sm:inline">{tab.icon}</span>
              <span className="sm:hidden">{tab.mobileIcon}</span>
              {/* Hide text on very small screens, show on larger */}
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
          
          {/* Spacer */}
          <div className="flex-1"></div>
          
          {/* LANGUAGE SWITCHER - Responsive margins */}
          <div className="mr-1 sm:mr-2 md:mr-3">
            <LanguageSwitcher />
          </div>

          {/* PASSWORD BUTTON - Responsive sizing */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className={`
              flex items-center gap-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 
              rounded-lg sm:rounded-xl font-extrabold text-xs sm:text-sm md:text-base 
              tracking-wide transition-all duration-200 shadow-md mr-1 sm:mr-2 md:mr-3
              bg-gradient-to-r from-[#3af0ff] via-[#3b82f6] to-[#9333ea]
              text-white shadow-lg hover:scale-105 hover:ring-2 hover:ring-[#3af0ffbb]
              whitespace-nowrap
            `}
            style={{ letterSpacing: 0.5 }}
          >
            <KeyRound size={isMobile ? 14 : 18} />
            <span className="hidden sm:inline">Password</span>
            <span className="sm:hidden">Pwd</span>
          </button>
          
          {/* LOGOUT BUTTON - Responsive sizing */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-1 px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 
              rounded-lg sm:rounded-xl font-extrabold text-xs sm:text-sm md:text-base 
              tracking-wide transition-all duration-200 shadow-md
              bg-gradient-to-r from-[#f34e6d] via-[#ffd700]/80 to-[#16d79c]/80
              text-[#181b25] shadow-lg hover:scale-105 hover:ring-2 hover:ring-[#ffd700bb]
              whitespace-nowrap
            `}
            style={{ letterSpacing: 0.5 }}
          >
            <LogOut size={isMobile ? 14 : 18} />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </div>

      {/* Premium Glass Content Container - Responsive padding and sizing */}
      <div
        className="backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 min-h-[380px] sm:min-h-[420px] w-full max-w-7xl mx-auto relative"
        style={{
          background: "rgba(24,28,40,0.94)",
          boxShadow: "0 6px 36px #0007",
          backdropFilter: "blur(12px)"
        }}
      >
        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -32 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="w-full"
            >
              <AdminUsers />
            </motion.div>
          )}

          {activeTab === "deposits" && (
            <motion.div
              key="deposits"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -32 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="w-full"
            >
              <AdminDeposits />
            </motion.div>
          )}

          {activeTab === "walletSettings" && (
            <motion.div
              key="walletSettings"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -32 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="w-full"
            >
              <DepositWalletSettings />
            </motion.div>
          )}

          {activeTab === "withdrawals" && (
            <motion.div
              key="withdrawals"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -32 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="w-full"
            >
              <AdminWithdrawals />
            </motion.div>
          )}

          {activeTab === "balance" && (
            <motion.div
              key="balance"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -32 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="w-full"
            >
              <AdminBalance />
            </motion.div>
          )}
          
          {activeTab === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -32 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="w-full"
            >
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