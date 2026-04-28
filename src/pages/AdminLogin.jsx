// src/pages/AdminLogin.jsx - Fixed version without external CSS dependency

import React, { useState, useRef, useEffect } from "react";
import { KeyRound, Mail, Lock, Shield, Sparkles, Eye, EyeOff, AlertCircle } from "lucide-react";
import { API_BASE } from "../config";

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLockWarning, setCapsLockWarning] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
    
    // Check for saved email
    const savedEmail = localStorage.getItem('adminEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockWarning(true);
    } else {
      setCapsLockWarning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in both email and password.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Login failed. Please check your credentials.');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      } else {
        localStorage.setItem('adminToken', data.token);
        if (rememberMe) {
          localStorage.setItem('adminEmail', email);
        } else {
          localStorage.removeItem('adminEmail');
        }
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0d16]">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#ffd700]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#16d79c]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay - inline SVG to avoid issues */}
        <div className="absolute inset-0 opacity-30" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,215,0,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 opacity-20 hidden lg:block">
        <Sparkles size={120} className="text-[#ffd700]" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-10 hidden lg:block">
        <Shield size={100} className="text-[#16d79c]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Main Card */}
        <div className="relative">
          <div className="relative backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10"
            style={{
              background: "linear-gradient(135deg, rgba(28,34,50,0.95) 0%, rgba(20,25,40,0.98) 100%)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ffd700] to-[#16d79c] rounded-full blur-md opacity-50" />
                <div className="relative rounded-full bg-gradient-to-br from-[#1a1f2e] to-[#131724] p-4 mb-3 shadow-xl border border-white/10">
                  <KeyRound size={42} className="text-[#ffd700]" />
                </div>
              </div>
              
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#ffd700] via-[#f0b90b] to-[#16d79c] bg-clip-text text-transparent mb-2 text-center">
                Welcome Back
              </h1>
              <p className="text-sm text-gray-400 text-center">
                Sign in to access the admin dashboard
              </p>
            </div>

            {/* Error Message with inline shake animation */}
            {error && (
              <div 
                className={`mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/50 ${shakeError ? 'transition-all duration-200' : ''}`}
                style={{
                  animation: shakeError ? 'shake 0.5s ease-in-out' : 'none'
                }}
              >
                <div className="flex items-center gap-2 text-red-300 text-sm">
                  <AlertCircle size={16} />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Caps Lock Warning */}
            {capsLockWarning && (
              <div className="mb-4 p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs flex items-center gap-2">
                <AlertCircle size={12} />
                Caps Lock is on
              </div>
            )}

            <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="group">
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail size={18} className="text-gray-500 group-focus-within:text-[#ffd700] transition-colors" />
                  </div>
                  <input
                    ref={emailRef}
                    type="email"
                    className="w-full bg-[#1a1f2e] border-2 border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/20 transition-all"
                    placeholder="admin@novachain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock size={18} className="text-gray-500 group-focus-within:text-[#ffd700] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-[#1a1f2e] border-2 border-gray-700 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/20 transition-all"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ffd700] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border transition-all ${rememberMe ? 'bg-[#ffd700] border-[#ffd700]' : 'border-gray-500 group-hover:border-[#ffd700]'}`}>
                      {rememberMe && (
                        <svg className="w-3 h-3 text-[#181b25] m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="select-none">Remember me</span>
                </label>
                
                <button
                  type="button"
                  className="text-sm text-[#ffd700]/70 hover:text-[#ffd700] transition-colors"
                  onClick={() => {
                    alert('Please contact system administrator to reset your password.');
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative mt-2 w-full py-3.5 rounded-xl font-extrabold text-[#181b25] text-base transition-all overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #ffd700 0%, #16d79c 100%)",
                  boxShadow: "0 4px 20px rgba(255, 215, 0, 0.3)",
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-[#181b25]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield size={18} />
                      Sign In
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#16d79c] to-[#ffd700] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-gray-500">
                Secure admin access only. All activities are logged.
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="w-1 h-1 rounded-full bg-[#ffd700]/50" />
                <span className="text-[10px] text-gray-600">NovaChain Admin Panel v2.0</span>
                <span className="w-1 h-1 rounded-full bg-[#ffd700]/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <Shield size={12} />
            SSL Secured Connection
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>256-bit Encryption</span>
          </p>
        </div>
      </div>

      {/* Add keyframe styles */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}