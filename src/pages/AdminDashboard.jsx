// src/pages/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  KeyRound,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { motion, AnimatePresence } from "framer-motion";

const dashboardCards = [
  {
    title: "User Management",
    desc: "Review users, KYC images, account mode, and login as user controls.",
    href: "/users",
    icon: Users,
    tone: "blue",
    cta: "Open Users",
  },
  {
    title: "Deposits",
    desc: "Check incoming deposit requests and approve verified payments.",
    href: "/deposits",
    icon: ArrowDownToLine,
    tone: "green",
    cta: "View Deposits",
  },
  {
    title: "Withdrawals",
    desc: "Review pending withdrawals and process user payout requests.",
    href: "/withdrawals",
    icon: ArrowUpFromLine,
    tone: "rose",
    cta: "View Withdrawals",
  },
  {
    title: "Adjust Balance",
    desc: "Safely update user balance with admin-controlled adjustment actions.",
    href: "/balance",
    icon: WalletCards,
    tone: "gold",
    cta: "Adjust Balance",
  },
  {
    title: "Phone Control",
    desc: "Manage phone-related admin tools and operator support workflows.",
    href: "/phone",
    icon: Phone,
    tone: "sky",
    cta: "Open Phone",
  },
];

const quickStats = [
  { label: "Admin Status", value: "Online", hint: "Control panel active" },
  { label: "Security", value: "Protected", hint: "Token-based session" },
  { label: "Mode", value: "Live Admin", hint: "Frontend control center" },
];

export default function AdminDashboard() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [role, setRole] = useState("admin");

  useEffect(() => {
    setRole(localStorage.getItem("adminRole") || "admin");
  }, []);

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-hero">
        <div>
          <div className="admin-dashboard-kicker">
            <Sparkles size={16} />
            NovaChain Admin Center
          </div>

          <h1>Control Dashboard</h1>
          <p>
            Manage users, deposits, withdrawals, balance controls, and admin
            operations from one clean modern workspace.
          </p>
        </div>

        <div className="admin-dashboard-hero-actions">
          <div className="admin-dashboard-role-card">
            <ShieldCheck size={18} />
            <div>
              <span>Current Role</span>
              <strong>{role}</strong>
            </div>
          </div>

          <button
            type="button"
            className="admin-dashboard-password-btn"
            onClick={() => setShowPasswordModal(true)}
          >
            <KeyRound size={17} />
            Change Password
          </button>
        </div>
      </div>

      <div className="admin-dashboard-stats">
        {quickStats.map((item) => (
          <div className="admin-dashboard-stat" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.hint}</small>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-section-title">
        <BarChart3 size={19} />
        <div>
          <h2>Admin Modules</h2>
          <p>Choose a control area to continue.</p>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.a
              href={card.href}
              key={card.title}
              className={`admin-dashboard-card ${card.tone}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: index * 0.04 }}
            >
              <div className="admin-dashboard-card-icon">
                <Icon size={24} />
              </div>

              <div className="admin-dashboard-card-content">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>

              <span className="admin-dashboard-card-cta">{card.cta}</span>
            </motion.a>
          );
        })}
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}