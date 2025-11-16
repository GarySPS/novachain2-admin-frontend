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
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center"
      style={{
        background: "linear-gradient(120deg, #23243a 0%, #23243a 60%, #101622 100%)"
      }}>
      <div className="flex-1 flex justify-center items-center z-10">
        <div
  className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-10 py-14 max-w-[380px] w-full mx-6"
  style={{
    background: "rgba(28,34,50,0.94)",        // <- dark, clean, NO YELLOW/GREEN!
    boxShadow: "0 6px 36px #0007",
    backdropFilter: "blur(12px)",
    backgroundImage: "none"                    // <- THIS REMOVES ALL DEMO SVGs!
  }}
>
          <div className="flex flex-col items-center mb-8">
            <span className="rounded-full bg-[#23243a] p-4 mb-2 shadow-lg">
  <KeyRound size={38} className="text-[#ffd700]" />
</span>

            <h1 className="text-2xl font-black text-white/90 mb-2 text-center drop-shadow-lg tracking-tight">
              Admin Login
            </h1>
            <div className="text-[15px] font-semibold text-white/40 text-center mb-1">
              NovaChain Admin Panel
            </div>
          </div>
          {error && (
            <div className="w-full bg-gradient-to-r from-[#f34e6d]/80 to-[#fbbf24]/80 text-white text-[1rem] rounded-xl py-2 px-5 mb-3 font-bold shadow-md animate-pulse text-center">
              {error}
            </div>
          )}
          <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
            <div className="flex items-center border-b border-white/25 focus-within:border-[#ffd700]">
              <Mail className="text-white/60 mr-2" size={18} />
              <input
                ref={emailRef}
                type="email"
                className="w-full bg-transparent text-white/90 placeholder-white/40 py-2 focus:outline-none font-medium text-base"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <div className="flex items-center border-b border-white/25 focus-within:border-[#ffd700]">
              <Lock className="text-white/60 mr-2" size={18} />
              <input
                type="password"
                className="w-full bg-transparent text-white/90 placeholder-white/40 py-2 focus:outline-none font-medium text-base"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#FFD700] to-[#16d79c] text-[#181b25] shadow-xl text-base transition-all flex items-center justify-center hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
              style={{
                letterSpacing: ".03em",
                boxShadow: "0 4px 24px #ffd70033",
              }}
            >
              {loading ? (
                <svg className="animate-spin h-7 w-7 text-[#181b25]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-30" cx="12" cy="12" r="10" stroke="#181b25" strokeWidth="4" />
                  <path className="opacity-75" fill="#FFD700" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                "LOGIN"
              )}
            </button>
          </form>
          <div className="flex flex-row items-center justify-between mt-5 px-1">
            <label className="flex items-center text-white/40 text-xs font-medium select-none">
              <input type="checkbox" className="mr-1 accent-[#6cf2ea]" disabled />
              Remember me
            </label>
            <span className="text-white/30 text-xs font-medium italic cursor-pointer hover:text-white/70 transition">
              Forgot Password?
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
