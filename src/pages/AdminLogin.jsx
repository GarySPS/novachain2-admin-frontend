// src/pages/AdminLogin.jsx

import React, { useState, useRef, useEffect } from "react";
import { KeyRound, Mail, Lock } from "lucide-react";
import { API_BASE } from "../config";

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please fill in both email and password.');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.message || 'Login failed.');
      else {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminRole', data.role); // Save the role (superadmin/support)
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      {/* Sleek Floating Card */}
      <div className="bg-[#131722]/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-2xl px-8 py-10 max-w-[400px] w-full animate-fade-in z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl mb-4">
            <KeyRound size={28} className="text-[#ffd700]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Admin Login</h1>
          <p className="text-sm text-gray-400 font-medium">NovaChain Admin Panel</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl py-3 px-4 mb-6 font-bold text-center">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-1 focus-within:border-[#ffd700] transition-colors">
            <Mail className="text-gray-400 mr-3" size={18} />
            <input
              ref={emailRef}
              type="email"
              className="w-full bg-transparent text-white placeholder-gray-500 py-3 focus:outline-none text-sm font-medium"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-1 focus-within:border-[#ffd700] transition-colors">
            <Lock className="text-gray-400 mr-3" size={18} />
            <input
              type="password"
              className="w-full bg-transparent text-white placeholder-gray-500 py-3 focus:outline-none text-sm font-medium"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {/* Login Button (Flat, No Animation) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl font-bold bg-[#ffd700] text-[#0a0e17] text-sm transition-all hover:bg-[#e6c200] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="flex flex-row items-center justify-between mt-6 px-1">
          <label className="flex items-center text-gray-500 text-xs font-medium cursor-not-allowed">
            <input type="checkbox" className="mr-2 rounded border-gray-600 bg-transparent" disabled />
            Remember me
          </label>
          <span className="text-gray-500 text-xs font-medium hover:text-white cursor-pointer transition-colors">
            Forgot Password?
          </span>
        </div>
      </div>
    </div>
  );
}