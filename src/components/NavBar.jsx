// src/components/NavBar.jsx

import React from "react";
import { LogOut } from "lucide-react";

const navLinks = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/users", label: "Users" },
  { path: "/kyc", label: "KYC" },
  { path: "/deposits", label: "Deposits" },
  { path: "/withdrawals", label: "Withdrawals" },
  { path: "/settings", label: "Wallet Settings" },
  { path: "/balance", label: "Adjust Balance" },
];

export default function NavBar() {
  // Use native window.location instead of react-router-dom's useLocation 
  // to avoid crashing when rendered outside of a <Router> context
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#131722]/90 backdrop-blur-md border-b border-white/5 px-5 md:px-8 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {/* Minimalist Logo */}
        <span className="font-extrabold text-2xl tracking-tight text-white">
          Nova<span className="text-[#ffd700]">Chain</span>
        </span>
        
        {/* Subtle Admin Badge */}
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white/10 text-gray-300 border border-white/5 tracking-wider uppercase">
          Admin
        </span>
        
        {/* Navigation Links */}
        <nav className="ml-6 hidden md:flex gap-1">
          {navLinks.map(link => (
            <a
              key={link.path}
              href={link.path}
              className={`px-3 py-2 rounded-xl font-bold text-sm transition-colors ${
                currentPath === link.path
                  ? "bg-white/10 text-[#ffd700]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Red Logout Button (Matches Dashboard) */}
      <button
        onClick={() => {
          localStorage.removeItem('adminToken');
          window.location.href = '/';
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-sm font-bold transition-colors"
        title="Logout"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}