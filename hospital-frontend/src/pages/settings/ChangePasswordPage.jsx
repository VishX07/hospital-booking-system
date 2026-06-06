import { useState } from 'react';
import toast from 'react-hot-toast';
import { changePassword, changeNewPassword } from '../../api/auth.api.js';

/* ─── Global styles ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');

  .cp-root * { box-sizing: border-box; }

  @keyframes cp-fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes cp-slideUp {
    from { opacity:0; transform:translateY(28px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes cp-float {
    0%,100% { transform:translateY(0) rotate(0deg); }
    40%     { transform:translateY(-11px) rotate(2deg); }
    70%     { transform:translateY(-5px) rotate(-1.5deg); }
  }
  @keyframes cp-floatB {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-14px); }
  }
  @keyframes cp-spin { to { transform:rotate(360deg); } }
  @keyframes cp-stepPop {
    0%   { transform:scale(0.7); opacity:0; }
    70%  { transform:scale(1.12); }
    100% { transform:scale(1); opacity:1; }
  }
  @keyframes cp-shake {
    0%,100% { transform:translateX(0); }
    20%     { transform:translateX(-6px); }
    40%     { transform:translateX(6px); }
    60%     { transform:translateX(-4px); }
    80%     { transform:translateX(4px); }
  }
  @keyframes cp-dotPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%     { opacity:0.35; transform:scale(0.65); }
  }
  @keyframes cp-successBounce {
    0%   { transform:scale(0); opacity:0; }
    60%  { transform:scale(1.2); }
    100% { transform:scale(1); opacity:1; }
  }
  @keyframes cp-lineDraw {
    from { stroke-dashoffset:60; }
    to   { stroke-dashoffset:0; }
  }
  @keyframes cp-otp-cursor {
    0%,100% { border-color: #2563eb; }
    50%     { border-color: transparent; }
  }

  .cp-float-a { animation:cp-float  6s ease-in-out infinite; }
  .cp-float-b { animation:cp-floatB 8s ease-in-out infinite; }
  .cp-float-c { animation:cp-float  7s ease-in-out 1.2s infinite; }

  .cp-card { animation:cp-slideUp 0.5s cubic-bezier(.22,1,.36,1) both; }

  .cp-step-icon { animation:cp-stepPop 0.4s cubic-bezier(.22,1,.36,1) both; }

  .cp-field {
    position: relative;
    margin-bottom: 0.875rem;
  }
  .cp-field label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .cp-field input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    color: #1e293b;
    background: #f8faff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .cp-field input:focus {
    border-color: #2563eb;
    background: white;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
  }
  .cp-field input.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 4px rgba(239,68,68,0.1);
    animation: cp-shake 0.4s ease;
  }
  .cp-field .cp-field-icon {
    position: absolute;
    left: 12px;
    bottom: 12px;
    width: 20px;
    height: 20px;
    pointer-events: none;
  }
  .cp-field .cp-eye-btn {
    position: absolute;
    right: 12px;
    bottom: 10px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    color: #94a3b8;
    transition: color 0.2s;
    font-family: inherit;
  }
  .cp-field .cp-eye-btn:hover { color: #2563eb; }

  .cp-strength-bar {
    height: 4px;
    border-radius: 999px;
    background: #f1f5f9;
    margin-top: 6px;
    overflow: hidden;
  }
  .cp-strength-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.4s ease, background 0.3s ease;
  }

  .cp-btn-primary {
    width: 100%;
    padding: 0.875rem;
    background: linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);
    color: white;
    border: none;
    border-radius: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.95rem;
    font-weight: 800;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 6px 20px rgba(37,99,235,0.32);
    letter-spacing: 0.01em;
  }
  .cp-btn-primary:hover  { opacity:0.9; transform:translateY(-2px); box-shadow:0 10px 28px rgba(37,99,235,0.38); }
  .cp-btn-primary:active { transform:scale(0.97); }
  .cp-btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; box-shadow:none; }

  .cp-spinner {
    width:18px; height:18px;
    border:2.5px solid rgba(255,255,255,0.4);
    border-top-color:white;
    border-radius:50%;
    animation:cp-spin 0.7s linear infinite;
    display:inline-block; flex-shrink:0;
  }

  /* OTP input boxes */
  .cp-otp-wrap {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 1.25rem;
  }
  .cp-otp-box {
    width: 52px; height: 60px;
    border: 2px solid #e2e8f0;
    border-radius: 14px;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 800;
    font-family: 'Sora', sans-serif;
    color: #1e293b;
    background: #f8faff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    caret-color: #2563eb;
  }
  .cp-otp-box:focus {
    border-color: #2563eb;
    background: white;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.12);
    animation: cp-otp-cursor 1s ease infinite;
  }
  .cp-otp-box.filled {
    border-color: #4f46e5;
    background: #f0f5ff;
    color: #2563eb;
  }

  /* Step indicator */
  .cp-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-bottom: 2rem;
  }
  .cp-step-dot {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; font-weight: 800;
    transition: all 0.35s;
    position: relative; z-index: 1;
  }
  .cp-step-dot.done {
    background: linear-gradient(135deg,#2563eb,#4f46e5);
    color: white;
    box-shadow: 0 4px 14px rgba(37,99,235,0.35);
  }
  .cp-step-dot.active {
    background: linear-gradient(135deg,#2563eb,#4f46e5);
    color: white;
    box-shadow: 0 0 0 5px rgba(37,99,235,0.18), 0 4px 14px rgba(37,99,235,0.35);
  }
  .cp-step-dot.inactive {
    background: #f1f5f9;
    color: #94a3b8;
  }
  .cp-step-line {
    height: 2px; width: 48px;
    transition: background 0.4s;
  }
  .cp-step-line.done   { background: linear-gradient(90deg,#2563eb,#4f46e5); }
  .cp-step-line.inactive { background: #e2e8f0; }

  .cp-step-label {
    font-size: 0.7rem; font-weight: 700;
    text-align: center; margin-top: 5px;
    letter-spacing: 0.04em; text-transform: uppercase;
  }

  /* Success state */
  .cp-success { animation: cp-successBounce 0.5s cubic-bezier(.22,1,.36,1) both; }
  .cp-check-draw {
    stroke-dasharray: 60;
    stroke-dashoffset: 60;
    animation: cp-lineDraw 0.6s ease forwards 0.2s;
  }
`;

/* ─── Illustrations ─── */
const ShieldIllustration = () => (
  <svg
    width="90"
    height="100"
    viewBox="0 0 90 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M45 8 L78 22 L78 52 C78 70 63 84 45 92 C27 84 12 70 12 52 L12 22 Z"
      fill="rgba(255,255,255,0.16)"
      stroke="rgba(255,255,255,0.28)"
      strokeWidth="1.5"
    />
    <path
      d="M45 18 L68 29 L68 52 C68 65 58 76 45 82 C32 76 22 65 22 52 L22 29 Z"
      fill="rgba(255,255,255,0.10)"
    />
    <path
      d="M33 50 L41 58 L57 42"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const KeyIllustration = () => (
  <svg
    width="70"
    height="35"
    viewBox="0 0 70 35"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="17"
      cy="17"
      r="14"
      fill="none"
      stroke="rgba(255,255,255,0.28)"
      strokeWidth="2"
    />
    <circle cx="17" cy="17" r="8" fill="rgba(255,255,255,0.14)" />
    <line
      x1="29"
      y1="20"
      x2="65"
      y2="20"
      stroke="rgba(255,255,255,0.28)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="52"
      y1="20"
      x2="52"
      y2="27"
      stroke="rgba(255,255,255,0.28)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="60"
      y1="20"
      x2="60"
      y2="26"
      stroke="rgba(255,255,255,0.28)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const DotsGrid = () => (
  <svg
    width="64"
    height="48"
    viewBox="0 0 64 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {[8, 24, 40, 56].flatMap((x) =>
      [8, 24, 40].map((y) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="3.5"
          fill="rgba(255,255,255,0.14)"
        />
      )),
    )}
  </svg>
);

/* ─── Password strength ─── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    null,
    { label: 'Weak', color: '#ef4444', pct: '25%' },
    { label: 'Fair', color: '#f59e0b', pct: '50%' },
    { label: 'Good', color: '#3b82f6', pct: '75%' },
    { label: 'Strong', color: '#22c55e', pct: '100%' },
  ];
  return map[s] || { label: 'Weak', color: '#ef4444', pct: '25%' };
};

/* ─── OTP box component ─── */
const OtpInput = ({ value, onChange }) => {
  const boxes = 6;
  const digits = value.split('').slice(0, boxes);

  const handleKey = (e, idx) => {
    const inputs = document.querySelectorAll('.cp-otp-box');
    if (e.key === 'Backspace') {
      const next = [...digits];
      next[idx] = '';
      onChange(next.join(''));
      if (idx > 0) inputs[idx - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const next = [...digits];
      next[idx] = e.key;
      onChange(next.join(''));
      if (idx < boxes - 1) inputs[idx + 1]?.focus();
    }
  };

  return (
    <div className="cp-otp-wrap">
      {Array.from({ length: boxes }).map((_, i) => (
        <input
          key={i}
          className={`cp-otp-box ${digits[i] ? 'filled' : ''}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={() => {}}
          onKeyDown={(e) => handleKey(e, i)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
};

/* ─── Eye icon ─── */
const EyeIcon = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

/* ─── Main Component ─── */
const ChangePasswordPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const strength = getStrength(formData.newPassword);

  const sendOtp = async () => {
    try {
      setLoading(true);
      await changePassword();
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMismatch(true);
      toast.error('Passwords do not match');
      setTimeout(() => setMismatch(false), 600);
      return;
    }
    try {
      setLoading(true);
      await changeNewPassword({
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      toast.success('Password updated successfully!');
      setDone(true);
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to update password',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="cp-root"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg,#1d4ed8 0%,#2563eb 30%,#4f46e5 65%,#7c3aed 100%)',
          padding: '2rem 1rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* BG shapes */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              top: -100,
              left: -80,
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -80,
              right: -60,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '30%',
              right: '5%',
              width: 130,
              height: 130,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
            }}
          />
        </div>

        {/* Floating illustrations */}
        <div
          className="cp-float-a"
          style={{ position: 'absolute', top: 32, right: 48, opacity: 0.6 }}
        >
          <ShieldIllustration />
        </div>
        <div
          className="cp-float-b"
          style={{ position: 'absolute', bottom: 60, left: 48, opacity: 0.5 }}
        >
          <KeyIllustration />
        </div>
        <div
          className="cp-float-c"
          style={{ position: 'absolute', top: '55%', left: '5%', opacity: 0.4 }}
        >
          <DotsGrid />
        </div>

        {/* Card */}
        <div
          className="cp-card"
          style={{
            background: 'white',
            borderRadius: 28,
            padding: '2.25rem 2rem',
            width: '100%',
            maxWidth: 440,
            boxShadow:
              '0 32px 80px rgba(0,0,0,0.22), 0 4px 20px rgba(0,0,0,0.12)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Logo/brand row */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
                marginBottom: 12,
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                margin: 0,
              }}
            >
              Change Password
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: 5 }}>
              {step === 1
                ? 'Verify your identity to continue'
                : 'Enter the OTP and set your new password'}
            </p>
          </div>

          {/* Step indicator */}
          {!done && (
            <div style={{ marginBottom: '1.75rem' }}>
              <div className="cp-steps">
                {[
                  { n: 1, label: 'Verify' },
                  { n: 2, label: 'Update' },
                  { n: 3, label: 'Done' },
                ].map(({ n, label }, i, arr) => (
                  <div
                    key={n}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        className={`cp-step-dot ${n < step ? 'done' : n === step ? 'active' : 'inactive'}`}
                        key={`${n}-${step}`}
                        style={{
                          animation:
                            n === step
                              ? 'cp-stepPop 0.4s cubic-bezier(.22,1,.36,1) both'
                              : 'none',
                        }}
                      >
                        {n < step ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <polyline points="2,7 5.5,10.5 12,3" />
                          </svg>
                        ) : (
                          n
                        )}
                      </div>
                      {i < arr.length - 1 && (
                        <div
                          className={`cp-step-line ${n < step ? 'done' : 'inactive'}`}
                        />
                      )}
                    </div>
                    <span
                      className="cp-step-label"
                      style={{ color: n <= step ? '#2563eb' : '#94a3b8' }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SUCCESS STATE ── */}
          {done && (
            <div
              className="cp-success"
              style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(34,197,94,0.38)',
                  marginBottom: 16,
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 40 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline
                    points="8,20 16,28 32,12"
                    className="cp-check-draw"
                  />
                </svg>
              </div>
              <h2
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                }}
              >
                Password Updated!
              </h2>
              <p
                style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 8 }}
              >
                Redirecting you back…
              </p>
            </div>
          )}

          {/* ── STEP 1: Send OTP ── */}
          {!done && step === 1 && (
            <div>
              <div
                style={{
                  background: 'linear-gradient(135deg,#f0f5ff,#f5f3ff)',
                  border: '1.5px solid #e0e7ff',
                  borderRadius: 16,
                  padding: '1rem 1.125rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>
                  📧
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#1e293b',
                      margin: 0,
                    }}
                  >
                    Email Verification
                  </p>
                  <p
                    style={{
                      color: '#64748b',
                      fontSize: '0.8rem',
                      marginTop: 4,
                      lineHeight: 1.5,
                    }}
                  >
                    We'll send a 6-digit OTP to your registered email address to
                    verify your identity.
                  </p>
                </div>
              </div>

              <button
                className="cp-btn-primary"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="cp-spinner" /> Sending OTP…
                  </>
                ) : (
                  <>
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Send OTP to Email
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── STEP 2: Enter OTP + new password ── */}
          {!done && step === 2 && (
            <form onSubmit={updatePassword}>
              {/* OTP section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 10,
                    textAlign: 'center',
                  }}
                >
                  Enter 6-digit OTP
                </p>
                <OtpInput
                  value={formData.otp}
                  onChange={(val) => setFormData((f) => ({ ...f, otp: val }))}
                />
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={sendOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  New Password
                </span>
                <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
              </div>

              {/* New password */}
              <div className="cp-field">
                <label>New Password</label>
                <svg
                  className="cp-field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="Minimum 8 characters"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  className="cp-eye-btn"
                  onClick={() => setShowNew((v) => !v)}
                >
                  <EyeIcon open={showNew} />
                </button>
                {/* Strength bar */}
                {formData.newPassword && (
                  <>
                    <div className="cp-strength-bar">
                      <div
                        className="cp-strength-fill"
                        style={{
                          width: strength.pct,
                          background: strength.color,
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: '0.72rem',
                        color: strength.color,
                        fontWeight: 700,
                        marginTop: 4,
                      }}
                    >
                      {strength.label}
                    </p>
                  </>
                )}
              </div>

              {/* Confirm password */}
              <div className="cp-field">
                <label>Confirm Password</label>
                <svg
                  className="cp-field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Repeat your new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={mismatch ? 'error' : ''}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  className="cp-eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  <EyeIcon open={showConfirm} />
                </button>
                {/* Match indicator */}
                {formData.confirmPassword && formData.newPassword && (
                  <p
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      marginTop: 4,
                      color:
                        formData.newPassword === formData.confirmPassword
                          ? '#22c55e'
                          : '#ef4444',
                    }}
                  >
                    {formData.newPassword === formData.confirmPassword
                      ? '✓ Passwords match'
                      : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="cp-btn-primary"
                disabled={loading}
                style={{ marginTop: '0.375rem' }}
              >
                {loading ? (
                  <>
                    <span className="cp-spinner" /> Updating…
                  </>
                ) : (
                  <>
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Update Password
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ChangePasswordPage;
