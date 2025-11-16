import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import AdminBalance from "./components/AdminBalance"; 


import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import AdminKYC from "./components/AdminKYC";
import AdminUsers from "./components/AdminUsers";
import AdminDeposits from "./components/AdminDeposits";
import AdminWithdrawals from "./components/AdminWithdrawals";
import DepositWalletSettings from "./components/DepositWalletSettings";

const BgGradient = () => (
  <div
    className="fixed inset-0 z-0 bg-gradient-to-br from-[#1a2636] via-[#191e29] to-[#11151c] opacity-95 blur-[2px]"
    style={{
      background: "linear-gradient(120deg, #23243a 0%, #23243a 60%, #16203c 100%)",
      pointerEvents: 'none'
    }}
  />
);

function AnimatedPage({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -32 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden font-sans text-slate-200 bg-transparent">
      <BgGradient />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-b from-white/5 via-[#191e29]/80 to-[#101622]/90 shadow-2xl p-6 min-h-[65vh]">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  const location = useLocation();

  const Protected = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    return token ? <AdminLayout>{children}</AdminLayout> : <Navigate to="/" replace />;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><AdminLogin /></AnimatedPage>} />
        <Route path="/dashboard" element={<Protected><AnimatedPage><AdminDashboard /></AnimatedPage></Protected>} />
        <Route path="/users" element={<Protected><AnimatedPage><AdminUsers /></AnimatedPage></Protected>} />
        <Route path="/kyc" element={<Protected><AnimatedPage><AdminKYC /></AnimatedPage></Protected>} />
        <Route path="/deposits" element={<Protected><AnimatedPage><AdminDeposits /></AnimatedPage></Protected>} />
        <Route path="/withdrawals" element={<Protected><AnimatedPage><AdminWithdrawals /></AnimatedPage></Protected>} />
        <Route path="/settings" element={<Protected><AnimatedPage><DepositWalletSettings /></AnimatedPage></Protected>} />
        <Route
  path="/balance"
  element={
    <Protected>
      <AnimatedPage>
        <AdminBalance />
      </AnimatedPage>
    </Protected>
  }
/>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
