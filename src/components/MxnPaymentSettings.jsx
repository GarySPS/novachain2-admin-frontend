// src/components/MxnPaymentSettings.jsx
// The MXN configuration is saved separately from cryptocurrency wallet addresses.
import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, Check, Loader2, RefreshCw, Save, X } from "lucide-react";
import { API_BASE } from "../config";

const ENDPOINT = `${API_BASE}/api/admin/mxn-settings`;

const emptySettings = {
  institution: "",
  holder: "",
  clabe: "",
  rateMxnPerUsdt: "",
};

const formatCredit = (mxn, rate) =>
  (mxn / rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });

function getErrorMessage(data, fallback) {
  return data?.error || data?.message || fallback;
}

export default function MxnPaymentSettings() {
  const [draft, setDraft] = useState(emptySettings);
  const [saved, setSaved] = useState(null);
  const [source, setSource] = useState("environment");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSettings() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Session expired. Sign in again.");
      const response = await fetch(ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, "Could not load MXN settings."));
      const next = {
        institution: data.institution || "",
        holder: data.holder || "",
        clabe: data.clabe || "",
        rateMxnPerUsdt: data.rateMxnPerUsdt == null ? "" : String(data.rateMxnPerUsdt),
      };
      setDraft(next);
      setSaved(next);
      setSource(data.source || "environment");
      setConfirmationOpen(false);
    } catch (cause) {
      setError(cause.message || "Could not load MXN settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const rateValid = /^\\d+(?:\\.\\d{1,6})?$/.test(draft.rateMxnPerUsdt.trim()) &&
    Number(draft.rateMxnPerUsdt) > 0 &&
    Number(draft.rateMxnPerUsdt) < 100000;
  const valid = draft.holder.trim().length >= 2 &&
    draft.holder.trim().length <= 100 &&
    draft.institution.trim().length >= 2 &&
    draft.institution.trim().length <= 70 &&
    /^\\d{18}$/.test(draft.clabe.trim()) &&
    rateValid;
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const canSave = !loading && !saving && valid && (dirty || source !== "database");

  function change(field, value) {
    setDraft(current => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
    setConfirmationOpen(false);
  }

  async function saveSettings() {
    if (!canSave) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Session expired. Sign in again.");
      const payload = {
        institution: draft.institution.trim(),
        holder: draft.holder.trim(),
        clabe: draft.clabe.trim(),
        rateMxnPerUsdt: draft.rateMxnPerUsdt.trim(),
      };
      const response = await fetch(ENDPOINT, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, "Could not save MXN settings."));
      const actual = data.settings || payload;
      const next = {
        institution: actual.institution,
        holder: actual.holder,
        clabe: actual.clabe,
        rateMxnPerUsdt: String(actual.rateMxnPerUsdt),
      };
      setDraft(next);
      setSaved(next);
      setSource("database");
      setSuccess("MXN payment settings saved. New quotes will use these details.");
      setConfirmationOpen(false);
    } catch (cause) {
      setError(cause.message || "Could not save MXN settings.");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#080f1e] px-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/10";

  return (
    <section className="mb-5 rounded-2xl border border-sky-400/20 bg-gradient-to-br from-[#14233b] via-[#101827] to-[#0d1321] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-5" aria-label="MXN SPEI settings">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-lg font-black text-sky-300 ring-1 ring-sky-400/25">N</div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-white">MXN · SPEI</h2>
              <span className="rounded-md bg-sky-400/10 px-2 py-0.5 text-[10px] font-bold text-sky-300">Virtual USDT</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">Receiving account and conversion settings</p>
          </div>
        </div>
        <button type="button" onClick={loadSettings} disabled={loading || saving}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-400">
          <Loader2 size={17} className="animate-spin" /> Loading MXN settings…
        </div>
      ) : (
        <>
          {source !== "database" && (
            <p className="mb-3 rounded-xl border border-sky-400/15 bg-sky-500/[0.05] px-3 py-2 text-xs leading-relaxed text-slate-300">
              Currently using Render settings. Save this form to manage MXN directly here.
            </p>
          )}
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
            <label className="block min-w-0 text-xs font-semibold text-slate-400">
              Payment institution
              <input className={fieldClass} value={draft.institution} maxLength={70}
                autoComplete="off" placeholder="Mercado Pago"
                onChange={event => change("institution", event.target.value)} />
            </label>
            <label className="block min-w-0 text-xs font-semibold text-slate-400">
              Account holder
              <input className={fieldClass} value={draft.holder} maxLength={100}
                autoComplete="off" placeholder="Account holder name"
                onChange={event => change("holder", event.target.value)} />
            </label>
            <label className="block min-w-0 text-xs font-semibold text-slate-400">
              CLABE · 18 digits
              <input className={fieldClass + " font-mono tracking-wide"} value={draft.clabe}
                inputMode="numeric" maxLength={18} autoComplete="off" placeholder="000000000000000000"
                onChange={event => change("clabe", event.target.value.replace(/\\D/g, ""))} />
            </label>
            <label className="block min-w-0 text-xs font-semibold text-slate-400">
              MXN per 1 USDT
              <div className="relative">
                <input className={fieldClass + " pr-16"} value={draft.rateMxnPerUsdt}
                  inputMode="decimal" autoComplete="off" placeholder="18.60"
                  onChange={event => change("rateMxnPerUsdt", event.target.value)} />
                <span className="pointer-events-none absolute right-3 top-5 text-xs font-bold text-sky-300">MXN</span>
              </div>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#080f1e]/70 px-3.5 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Simulation quote preview</p>
              <p className="mt-1 text-sm font-bold text-white">1,000 MXN <ArrowRight size={13} className="inline text-sky-300" />
                <span className="ml-1 text-sky-300">
                  {rateValid ? formatCredit(1000, Number(draft.rateMxnPerUsdt)) : "—"} USDT
                </span>
              </p>
            </div>
            <span className="text-[11px] text-slate-500">Updates apply to new requests</span>
          </div>

          {error && <div role="alert" className="mt-3 flex items-center gap-2 text-xs text-rose-300"><AlertCircle size={15} />{error}</div>}
          {success && <div role="status" className="mt-3 flex items-center gap-2 text-xs text-emerald-300"><Check size={15} />{success}</div>}

          {confirmationOpen ? (
            <div className="mt-4 rounded-xl border border-amber-300/25 bg-amber-400/[0.06] p-3">
              <p className="text-sm font-bold text-white">Confirm MXN settings change</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                This changes the receiving account and simulation rate shown for new deposit requests.
                Existing requests retain their recorded quote.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={!canSave} onClick={saveSettings}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-xs font-black text-white transition hover:bg-sky-500 disabled:opacity-50">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Confirm & save
                </button>
                <button type="button" disabled={saving} onClick={() => setConfirmationOpen(false)}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-semibold text-slate-300">
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setConfirmationOpen(true)} disabled={!canSave}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-black text-white shadow-[0_10px_25px_rgba(2,132,199,0.16)] transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 sm:w-auto">
                <Save size={16} /> Save MXN Settings
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
