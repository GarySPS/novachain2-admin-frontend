//src>App.jsx

// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import NavBar from "./components/NavBar";
import AdminBalance from "./components/AdminBalance"; 

import AdminLogin from "./pages/AdminLogin.jsx";
import AdminPhone from "./components/AdminPhone";
import AdminUsers from "./components/AdminUsers";
import AdminDeposits from "./components/AdminDeposits";
import AdminWithdrawals from "./components/AdminWithdrawals";
import DepositWalletSettings from "./components/DepositWalletSettings";

const BgGradient = () => (
  <div className="fixed inset-0 z-0 opacity-95 pointer-events-none" />
);

function AnimatedPage({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="admin-app-shell">
      <BgGradient />
      <NavBar />

      <main className="admin-main">
        {children}
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
        
        {/* Protected Admin Routes */}
        <Route path="/dashboard" element={<Navigate to="/users" replace />} />
        <Route path="/phone" element={<Protected><AnimatedPage><AdminPhone /></AnimatedPage></Protected>} />
        <Route path="/users" element={<Protected><AnimatedPage><AdminUsers /></AnimatedPage></Protected>} />
        <Route path="/deposits" element={<Protected><AnimatedPage><AdminDeposits /></AnimatedPage></Protected>} />
        <Route path="/withdrawals" element={<Protected><AnimatedPage><AdminWithdrawals /></AnimatedPage></Protected>} />
        <Route path="/settings" element={<Protected><AnimatedPage><DepositWalletSettings /></AnimatedPage></Protected>} />
        <Route path="/balance" element={<Protected><AnimatedPage><AdminBalance /></AnimatedPage></Protected>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;