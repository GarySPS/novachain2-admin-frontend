// src/components/MxnPaymentSettings.jsx
// The MXN configuration is saved separately from cryptocurrency wallet addresses.
import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, Check, Copy, Info, Loader2, RefreshCw, Save, X } from "lucide-react";
import { API_BASE } from "../config";
import "./mxn-payment-settings.css";

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

  const rateValid = /^\d+(?:\.\d{1,6})?$/.test(draft.rateMxnPerUsdt.trim()) &&
    Number(draft.rateMxnPerUsdt) > 0 &&
    Number(draft.rateMxnPerUsdt) < 100000;
  const nameValid = (value, max) => value.trim().length >= 2 &&
    value.trim().length <= max && !/[\u0000-\u001F\u007F]/.test(value);
  const valid = nameValid(draft.holder, 100) &&
    nameValid(draft.institution, 70) &&
    /^\d{18}$/.test(draft.clabe.trim()) &&
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

  return (
    <section className="mxn-settings-card" aria-label="MXN SPEI settings">
      <div className="mxn-header">
        <div className="mxn-header-title">
          <div className="mxn-logo" aria-hidden="true">N</div>
          <div>
            <div className="mxn-title-line">
              <h2 className="mxn-title">MXN · SPEI</h2>
              <span className="mxn-tag">VIRTUAL USDT</span>
            </div>
            <p className="mxn-subtitle">Receiving account and conversion rate</p>
          </div>
        </div>
        <button
          type="button"
          className="mxn-refresh"
          onClick={loadSettings}
          disabled={loading || saving}
          aria-label="Reload MXN settings"
        >
          <RefreshCw size={15} className={loading ? "mxn-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="mxn-loading">
          <Loader2 size={18} className="mxn-spin" />
          Loading payment settings…
        </div>
      ) : (
        <>
          {source !== "database" && (
            <p className="mxn-notice">
              <Info size={16} aria-hidden="true" />
              Render defaults are active. Save once to manage these values here.
            </p>
          )}

          <div className="mxn-fields">
            <div className="mxn-field">
              <label className="mxn-field-label" htmlFor="mxn-settings-institution">Payment institution</label>
              <input
                id="mxn-settings-institution"
                className="mxn-input"
                type="text"
                value={draft.institution}
                maxLength={70}
                autoComplete="off"
                placeholder="e.g. Mercado Pago"
                onChange={(event) => change("institution", event.target.value)}
              />
            </div>
            <div className="mxn-field">
              <label className="mxn-field-label" htmlFor="mxn-settings-holder">Account holder</label>
              <input
                id="mxn-settings-holder"
                className="mxn-input"
                type="text"
                value={draft.holder}
                maxLength={100}
                autoComplete="off"
                placeholder="Name shown on the receiving account"
                onChange={(event) => change("holder", event.target.value)}
              />
            </div>
            <div className="mxn-field">
              <label className="mxn-field-label" htmlFor="mxn-settings-clabe">CLABE · 18 digits</label>
              <div className="mxn-clabe-wrap">
                <input
                  id="mxn-settings-clabe"
                  className="mxn-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={18}
                  autoComplete="off"
                  spellCheck={false}
                  value={draft.clabe}
                  placeholder="000000000000000000"
                  onChange={(event) => change("clabe", event.target.value.replace(/\D/g, ""))}
                />
                <button
                  type="button"
                  className="mxn-copy"
                  disabled={!draft.clabe}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(draft.clabe);
                      setSuccess("CLABE copied.");
                      setError("");
                    } catch {
                      setError("Unable to copy. Select the CLABE manually.");
                    }
                  }}
                >
                  <Copy size={14} aria-hidden="true" /> Copy
                </button>
              </div>
              <p className="mxn-field-hint">{draft.clabe.length}/18 digits</p>
            </div>
            <div className="mxn-field">
              <label className="mxn-field-label" htmlFor="mxn-settings-rate">Exchange rate · MXN per 1 USDT</label>
              <div className="mxn-input-wrap">
                <input
                  id="mxn-settings-rate"
                  className="mxn-input mxn-input--suffix"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={draft.rateMxnPerUsdt}
                  placeholder="18.60"
                  onChange={(event) => change("rateMxnPerUsdt", event.target.value)}
                />
                <span className="mxn-input-suffix">MXN</span>
              </div>
              <p className="mxn-field-hint">Applies to new simulation requests</p>
            </div>
          </div>

          <div className="mxn-preview">
            <div>
              <p className="mxn-preview-label">Live quote preview</p>
              <p className="mxn-preview-note">Estimated virtual credit for 1,000 MXN</p>
            </div>
            <div className="mxn-preview-value" aria-live="polite">
              <span>1,000 MXN</span>
              <ArrowRight size={18} aria-hidden="true" />
              <strong>{rateValid ? formatCredit(1000, Number(draft.rateMxnPerUsdt)) : "—"} USDT</strong>
            </div>
          </div>

          {error && <div className="mxn-alert mxn-alert--error" role="alert">
            <AlertCircle size={16} aria-hidden="true" /><span>{error}</span>
          </div>}
          {success && <div className="mxn-alert mxn-alert--success" role="status">
            <Check size={16} aria-hidden="true" /><span>{success}</span>
          </div>}

          {confirmationOpen ? (
            <div className="mxn-confirm">
              <p className="mxn-confirm-title">Confirm MXN settings</p>
              <p className="mxn-confirm-desc">
                New deposit requests will use this receiving account and exchange rate.
                Existing requests keep their recorded credit amount.
              </p>
              <div className="mxn-actions">
                <button type="button" className="mxn-button mxn-button--primary" disabled={!canSave} onClick={saveSettings}>
                  {saving ? <Loader2 size={16} className="mxn-spin" /> : <Check size={16} />}
                  {saving ? "Saving…" : "Confirm & save"}
                </button>
                <button type="button" className="mxn-button mxn-button--secondary"
                  disabled={saving} onClick={() => setConfirmationOpen(false)}>
                  <X size={15} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mxn-actions">
              <button type="button" className="mxn-button mxn-button--primary"
                disabled={!canSave} onClick={() => setConfirmationOpen(true)}>
                <Save size={16} aria-hidden="true" /> Save MXN Settings
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
