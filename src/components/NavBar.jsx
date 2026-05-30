// src/components/NavBar.jsx

import React, { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  LogOut,
  Menu,
  Phone,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  WalletCards,
  X,
} from "lucide-react";

const navLinks = [
  { path: "/users", label: "Users", icon: Users },
  { path: "/phone", label: "Phone", icon: Phone },
  { path: "/deposits", label: "Deposits", icon: ArrowDownToLine },
  { path: "/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { path: "/balance", label: "Adjust Balance", icon: WalletCards },
  { path: "/settings", label: "Wallet Settings", icon: Settings },
];

export default function NavBar() {
  const [currentPath, setCurrentPath] = useState("/dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState("admin");

  useEffect(() => {
    setCurrentPath(window.location.pathname || "/dashboard");
    setRole(localStorage.getItem("adminRole") || "admin");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminRemember");
    window.location.href = "/";
  };

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-inner">
        <a href="/users" className="admin-navbar-brand" aria-label="NovaChain Admin Users">
          <div className="admin-navbar-logo">
            <ShieldCheck size={22} />
          </div>

          <div className="admin-navbar-brand-text">
            <strong>
              Nova<span>Chain</span>
            </strong>
            <small>Admin Control</small>
          </div>
        </a>

        <nav className="admin-navbar-links" aria-label="Admin navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = currentPath === link.path;

            return (
              <a
                key={link.path}
                href={link.path}
                className={active ? "admin-navbar-link active" : "admin-navbar-link"}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="admin-navbar-actions">
          <div className="admin-navbar-role">
            <UserCog size={15} />
            <span>{role}</span>
          </div>

          <button type="button" className="admin-navbar-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>

          <button
            type="button"
            className="admin-navbar-menu-btn"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="admin-navbar-mobile">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = currentPath === link.path;

            return (
              <a
                key={link.path}
                href={link.path}
                className={active ? "admin-navbar-mobile-link active" : "admin-navbar-mobile-link"}
              >
                <Icon size={17} />
                <span>{link.label}</span>
              </a>
            );
          })}

          <button type="button" className="admin-navbar-mobile-logout" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}