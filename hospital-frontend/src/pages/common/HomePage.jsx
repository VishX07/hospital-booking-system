/**
 * ============================================================
 *  AlphaCare — HomePage.jsx
 *  Single-file home page.
 *  Sections: Navbar · Hero · Stats · HowItWorks · Features
 *            · Doctors · FAQ · Footer
 *
 *  Imports (keep in your project):
 *    react-router-dom  →  Link, useNavigate
 *    Your API layer    →  getPublicStats, getDepartments, getAllDoctors
 *    Your auth store   →  useAuthStore
 * ============================================================
 */

import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  getPublicStats,
  getDepartments,
  getAllDoctors,
} from '../../api/home.api.js';
import useAuthStore from '../../store/auth.store.js';

/* ================================================================
   GLOBAL STYLES  (injected once via <style> tag)
   ================================================================ */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');

  :root {
    --navy:   #0a1628;
    --navy2:  #0e1f3d;
    --blue:   #1565c0;
    --sky:    #2196f3;
    --teal:   #00b4d8;
    --ice:    #e8f4fd;
    --white:  #ffffff;
    --slate:  #64748b;
    --gold:   #f59e0b;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body { font-family: 'Outfit', sans-serif; background: var(--white); color: var(--navy); overflow-x: hidden; }

  /* ── Keyframes ── */
  @keyframes fadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes slideRight { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes float1   { 0%,100%{transform:translateY(0) rotate(-1.5deg)} 50%{transform:translateY(-14px) rotate(1.5deg)} }
  @keyframes float2   { 0%,100%{transform:translateY(0) rotate(1deg)}   50%{transform:translateY(-9px)  rotate(-1deg)} }
  @keyframes float3   { 0%,100%{transform:translateY(0)}                50%{transform:translateY(-6px)} }
  @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
  @keyframes spin     { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes countUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes lineGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes waveMove { 0%{d:path("M0,40 Q180,0 360,40 Q540,80 720,40 L720,80 L0,80Z")} 50%{d:path("M0,40 Q180,80 360,40 Q540,0 720,40 L720,80 L0,80Z")} 100%{d:path("M0,40 Q180,0 360,40 Q540,80 720,40 L720,80 L0,80Z")} }

  /* ── Utility ── */
  .anim-fade-up    { animation: fadeUp .6s ease both; }
  .anim-fade-in    { animation: fadeIn .5s ease both; }
  .anim-slide-r    { animation: slideRight .6s ease both; }
  .d1{animation-delay:.08s} .d2{animation-delay:.16s} .d3{animation-delay:.24s}
  .d4{animation-delay:.32s} .d5{animation-delay:.40s} .d6{animation-delay:.48s}

  .float-1 { animation: float1 5.5s ease-in-out infinite; }
  .float-2 { animation: float2 4.8s ease-in-out infinite .7s; }
  .float-3 { animation: float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
  .spin-slow  { animation: spin 22s linear infinite; }

  /* ── Nav ── */
  .ac-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(10,22,40,.92);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(255,255,255,.07);
  }
  .nav-link {
    font-size: .875rem; font-weight: 500;
    color: rgba(255,255,255,.7);
    text-decoration: none;
    padding: .25rem 0;
    position: relative;
    transition: color .2s;
  }
  .nav-link::after {
    content:''; position:absolute; bottom:0; left:0;
    width:100%; height:1.5px;
    background: var(--teal);
    transform: scaleX(0); transform-origin: left;
    transition: transform .25s ease;
  }
  .nav-link:hover { color:#fff; }
  .nav-link:hover::after { transform: scaleX(1); }

  .btn-primary {
    display:inline-flex; align-items:center; gap:.5rem;
    background: linear-gradient(135deg, var(--sky), var(--teal));
    color:#fff; font-weight:700; font-size:.875rem;
    padding:.65rem 1.4rem; border-radius:12px; border:none;
    cursor:pointer; text-decoration:none;
    transition: transform .2s ease, box-shadow .2s ease;
    box-shadow: 0 4px 18px rgba(33,150,243,.35);
  }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(33,150,243,.45); }

  .btn-ghost {
    display:inline-flex; align-items:center; gap:.5rem;
    background: rgba(255,255,255,.08);
    color:rgba(255,255,255,.85); font-weight:600; font-size:.875rem;
    padding:.65rem 1.4rem; border-radius:12px;
    border:1px solid rgba(255,255,255,.18);
    cursor:pointer; text-decoration:none;
    transition: all .2s ease;
    backdrop-filter: blur(8px);
  }
  .btn-ghost:hover { background:rgba(255,255,255,.14); color:#fff; transform:translateY(-1px); }

  /* ── Hero ── */
  .hero-bg {
    background: linear-gradient(135deg, #0a1628 0%, #0e2147 45%, #0c1f45 70%, #071528 100%);
    position: relative; overflow: hidden;
  }
  .hero-grid {
    position:absolute; inset:0; pointer-events:none;
    background-image: linear-gradient(rgba(33,150,243,.07) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(33,150,243,.07) 1px, transparent 1px);
    background-size: 44px 44px;
  }
  .hero-orb-1 {
    position:absolute; width:600px; height:600px; border-radius:50%;
    background: radial-gradient(circle, rgba(0,180,216,.18) 0%, transparent 70%);
    top:-200px; right:-150px; pointer-events:none;
  }
  .hero-orb-2 {
    position:absolute; width:400px; height:400px; border-radius:50%;
    background: radial-gradient(circle, rgba(21,101,192,.2) 0%, transparent 70%);
    bottom:-100px; left:-100px; pointer-events:none;
  }

  /* ── Section headers ── */
  .section-eyebrow {
    display:inline-flex; align-items:center; gap:.5rem;
    background: linear-gradient(90deg,rgba(0,180,216,.12),rgba(33,150,243,.12));
    border:1px solid rgba(0,180,216,.2);
    color:var(--teal); font-size:.75rem; font-weight:700;
    letter-spacing:.12em; text-transform:uppercase;
    padding:.35rem 1rem; border-radius:100px;
    margin-bottom:1.25rem;
  }
  .section-title {
    font-family:'Playfair Display',serif;
    font-size:clamp(2rem,4vw,3rem);
    font-weight:800; line-height:1.15;
    color:var(--navy);
  }
  .section-title .accent { color:var(--sky); font-style:italic; }
  .section-sub {
    color:var(--slate); font-size:1.0625rem;
    line-height:1.7; margin-top:.75rem; max-width:520px;
  }

  /* ── Cards ── */
  .glass-card {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
    backdrop-filter: blur(16px);
    border-radius: 20px;
    transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
  }
  .glass-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 50px rgba(0,0,0,.35);
    border-color: rgba(0,180,216,.3);
  }

  .light-card {
    background:#fff;
    border:1px solid #e8eef6;
    border-radius:20px;
    transition:transform .25s ease, box-shadow .25s ease;
  }
  .light-card:hover {
    transform:translateY(-5px);
    box-shadow:0 16px 44px rgba(21,101,192,.1);
  }

  /* ── Step connector ── */
  .step-connector {
    position:absolute; top:28px; left:calc(50% + 32px);
    width:calc(100% - 64px); height:2px;
    background: linear-gradient(90deg, var(--sky), var(--teal));
    transform-origin:left; animation:lineGrow 1s ease .6s both;
  }

  /* ── FAQ ── */
  .faq-item {
    border:1px solid #e2eaf6;
    border-radius:16px; overflow:hidden;
    transition:border-color .2s;
  }
  .faq-item:hover { border-color:#90caf9; }
  .faq-item.open   { border-color:#2196f3; }
  .faq-btn {
    width:100%; display:flex; align-items:center; justify-content:space-between;
    padding:1.25rem 1.5rem; background:none; border:none; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:1rem; font-weight:600;
    color:var(--navy); text-align:left;
  }
  .faq-icon {
    flex-shrink:0; width:28px; height:28px; border-radius:50%;
    background:var(--ice); display:flex; align-items:center; justify-content:center;
    color:var(--sky); font-size:1.1rem; font-weight:700;
    transition:background .2s, transform .3s;
  }
  .faq-item.open .faq-icon { background:var(--sky); color:#fff; transform:rotate(45deg); }
  .faq-body { overflow:hidden; transition:max-height .35s ease; }

  /* ── Doctor card avatar fallback ── */
  .doc-avatar-fallback {
    display:flex; align-items:center; justify-content:center;
    font-weight:700; font-size:1.5rem; color:#fff;
  }

  /* ── Gradient animated text ── */
  .grad-text {
    background: linear-gradient(90deg, var(--sky), var(--teal), var(--sky));
    background-size:200% auto;
    -webkit-background-clip:text; background-clip:text;
    -webkit-text-fill-color:transparent;
    animation: gradMove 4s linear infinite;
  }

  /* ── Footer wave ── */
  .footer-bg { background: var(--navy2); }

  /* ── Responsive ── */
  @media(max-width:768px){
    .step-connector { display:none; }
    .hide-mob { display:none !important; }
  }
`;

/* ================================================================
   ALPHACARE LOGO SVG
   ================================================================ */
const AlphaCareLogo = ({ size = 40, textSize = 'xl', mono = false }) => {
  const c1 = mono ? '#fff' : '#1565c0';
  const c2 = mono ? 'rgba(255,255,255,.7)' : '#0097b2';
  const cPlus = mono ? '#fff' : '#00b4d8';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* SVG mark — "A" with medical cross inspired by uploaded logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* "A" shape */}
        <path d="M40 8 L70 68 H58 L52 54 H28 L22 68 H10 Z" fill={c1} />
        <path
          d="M40 24 L31 52 H49 Z"
          fill={mono ? 'rgba(0,0,0,.25)' : '#0e2147'}
        />
        {/* Swoosh wave under A */}
        <path
          d="M6 62 Q40 50 74 62"
          stroke={c2}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Medical cross top-left of A */}
        <rect x="12" y="12" width="16" height="5" rx="2.5" fill={cPlus} />
        <rect x="17.5" y="6.5" width="5" height="16" rx="2.5" fill={cPlus} />
      </svg>
      {/* Brand text */}
      <div style={{ lineHeight: 1 }}>
        <div
          style={{
            fontFamily: "'Outfit',sans-serif",
            fontWeight: 800,
            fontSize:
              textSize === 'xl'
                ? '1.25rem'
                : textSize === 'lg'
                  ? '1.1rem'
                  : '1rem',
            color: mono ? '#fff' : '#0a1628',
            letterSpacing: '-0.02em',
          }}
        >
          Alpha<span style={{ color: c2 }}>Care</span>
        </div>
        <div
          style={{
            fontSize: '.65rem',
            fontWeight: 500,
            color: mono ? 'rgba(255,255,255,.55)' : '#94a3b8',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            marginTop: 2,
          }}
        >
          Smart Healthcare
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   NAVBAR
   ================================================================ */
const Navbar = ({ user, onDashboard, onLogout }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <style>{`
        .ac-nav-inner { max-width:1280px;margin:0 auto;padding:0 1.5rem;height:72px;display:flex;align-items:center;justify-content:space-between;gap:2rem; }
        .mob-menu { background:rgba(10,22,40,.97);border-top:1px solid rgba(255,255,255,.07);padding:1.25rem 1.5rem;display:flex;flex-direction:column;gap:1rem; }
        .mob-link { color:rgba(255,255,255,.8);text-decoration:none;font-weight:500;font-size:.95rem;padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.06); }
      `}</style>
      <header
        className="ac-nav"
        style={{
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,.4)' : 'none',
          transition: 'box-shadow .3s',
        }}
      >
        <div className="ac-nav-inner">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <AlphaCareLogo mono size={36} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hide-mob" style={{ display: 'flex', gap: '2rem' }}>
            {[
              ['#how-it-works', 'How It Works'],
              ['#features', 'Features'],
              ['#doctors', 'Doctors'],
              ['#faq', 'FAQ'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="nav-link">
                {label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div
            className="hide-mob"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="btn-ghost"
                  style={{ padding: '.55rem 1.1rem' }}
                >
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Get Started →
                </Link>
              </>
            ) : (
              <>
                <button onClick={onDashboard} className="btn-primary">
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  className="btn-ghost"
                  style={{ padding: '.55rem 1.1rem' }}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '1.4rem',
              padding: '.25rem',
            }}
            className="lg:hidden"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        {open && (
          <div className="mob-menu">
            {[
              ['#how-it-works', 'How It Works'],
              ['#features', 'Features'],
              ['#doctors', 'Doctors'],
              ['#faq', 'FAQ'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="mob-link"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
            <div
              style={{
                marginTop: '.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '.6rem',
              }}
            >
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="btn-ghost"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary"
                    onClick={() => setOpen(false)}
                  >
                    Get Started →
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onDashboard();
                      setOpen(false);
                    }}
                    className="btn-primary"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setOpen(false);
                    }}
                    className="btn-ghost"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

/* ================================================================
   HERO SECTION
   ================================================================ */
const HeroIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* Central medical monitor */}
    <svg
      viewBox="0 0 360 300"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1"
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1565c0" />
          <stop offset="100%" stopColor="#0a3d6b" />
        </linearGradient>
        <linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00b4d8" />
          <stop offset="100%" stopColor="#2196f3" />
        </linearGradient>
      </defs>

      {/* Background glow circles */}
      <circle cx="180" cy="150" r="140" fill="rgba(33,150,243,0.05)" />
      <circle cx="180" cy="150" r="100" fill="rgba(0,180,216,0.05)" />

      {/* Outer ring */}
      <circle
        cx="180"
        cy="150"
        r="135"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
        strokeDasharray="8 6"
        className="spin-slow"
      />
      <circle
        cx="180"
        cy="150"
        r="110"
        fill="none"
        stroke="rgba(0,180,216,0.12)"
        strokeWidth="1.5"
        strokeDasharray="4 8"
      />

      {/* Main monitor screen */}
      <rect
        x="70"
        y="55"
        width="220"
        height="145"
        rx="16"
        fill="url(#screenGrad)"
        opacity=".95"
      />
      <rect x="70" y="55" width="220" height="30" rx="16" fill="#0d2857" />
      <rect x="70" y="71" width="220" height="14" fill="#0d2857" />
      {/* Window dots */}
      <circle cx="90" cy="70" r="5" fill="#ef5350" opacity=".8" />
      <circle cx="106" cy="70" r="5" fill="#ffb300" opacity=".8" />
      <circle cx="122" cy="70" r="5" fill="#43a047" opacity=".8" />
      {/* Screen label */}
      <text
        x="183"
        y="73"
        textAnchor="middle"
        fontFamily="Outfit,sans-serif"
        fontSize="9"
        fill="rgba(255,255,255,.4)"
        fontWeight="600"
      >
        ALPHACARE MONITOR
      </text>

      {/* ECG Line */}
      <polyline
        points="82,140 100,140 112,108 122,168 133,125 143,145 162,145 174,118 186,160 198,132 208,145 230,145 242,118 252,155 262,135 272,145 288,145"
        fill="none"
        stroke="url(#accentLine)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stat pills */}
      <rect
        x="82"
        y="86"
        width="68"
        height="30"
        rx="8"
        fill="rgba(0,180,216,.15)"
        stroke="rgba(0,180,216,.3)"
        strokeWidth="1"
      />
      <text
        x="90"
        y="98"
        fontFamily="Outfit,sans-serif"
        fontSize="7"
        fill="#81d4fa"
        fontWeight="700"
      >
        HEART RATE
      </text>
      <text
        x="90"
        y="110"
        fontFamily="Outfit,sans-serif"
        fontSize="12"
        fill="#fff"
        fontWeight="800"
      >
        72 bpm
      </text>

      <rect
        x="158"
        y="86"
        width="68"
        height="30"
        rx="8"
        fill="rgba(33,150,243,.15)"
        stroke="rgba(33,150,243,.3)"
        strokeWidth="1"
      />
      <text
        x="166"
        y="98"
        fontFamily="Outfit,sans-serif"
        fontSize="7"
        fill="#90caf9"
        fontWeight="700"
      >
        BLOOD PRESS
      </text>
      <text
        x="166"
        y="110"
        fontFamily="Outfit,sans-serif"
        fontSize="12"
        fill="#fff"
        fontWeight="800"
      >
        120/80
      </text>

      <rect
        x="240"
        y="86"
        width="42"
        height="30"
        rx="8"
        fill="rgba(67,160,71,.15)"
        stroke="rgba(67,160,71,.3)"
        strokeWidth="1"
      />
      <text
        x="248"
        y="98"
        fontFamily="Outfit,sans-serif"
        fontSize="7"
        fill="#a5d6a7"
        fontWeight="700"
      >
        SpO2
      </text>
      <text
        x="248"
        y="110"
        fontFamily="Outfit,sans-serif"
        fontSize="12"
        fill="#fff"
        fontWeight="800"
      >
        99%
      </text>

      {/* Progress bar */}
      <rect
        x="82"
        y="172"
        width="196"
        height="5"
        rx="2.5"
        fill="rgba(255,255,255,.1)"
      />
      <rect
        x="82"
        y="172"
        width="130"
        height="5"
        rx="2.5"
        fill="url(#accentLine)"
      />
      <text
        x="82"
        y="188"
        fontFamily="Outfit,sans-serif"
        fontSize="7.5"
        fill="rgba(255,255,255,.45)"
      >
        Recovery Progress — 66%
      </text>

      {/* Monitor stand */}
      <rect x="163" y="200" width="34" height="18" rx="4" fill="#1a3a6b" />
      <rect x="140" y="217" width="80" height="8" rx="4" fill="#0d2857" />

      {/* Floating badge — Verified */}
      <rect
        x="22"
        y="130"
        width="130"
        height="40"
        rx="12"
        fill="rgba(13,40,87,.9)"
        stroke="rgba(0,180,216,.3)"
        strokeWidth="1"
      />
      <circle cx="42" cy="150" r="12" fill="rgba(67,160,71,.2)" />
      <path
        d="M36,150 l4,4 8-8"
        stroke="#66bb6a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text
        x="60"
        y="147"
        fontFamily="Outfit,sans-serif"
        fontSize="7.5"
        fill="rgba(255,255,255,.6)"
        fontWeight="600"
      >
        DOCTOR STATUS
      </text>
      <text
        x="60"
        y="160"
        fontFamily="Outfit,sans-serif"
        fontSize="9"
        fill="#fff"
        fontWeight="700"
      >
        Board Certified
      </text>

      {/* Floating badge — Booking */}
      <rect
        x="208"
        y="230"
        width="120"
        height="40"
        rx="12"
        fill="rgba(13,40,87,.9)"
        stroke="rgba(33,150,243,.3)"
        strokeWidth="1"
      />
      <circle cx="228" cy="250" r="12" fill="rgba(33,150,243,.2)" />
      <text
        x="227"
        y="254"
        textAnchor="middle"
        fontFamily="Outfit,sans-serif"
        fontSize="10"
        fill="#90caf9"
        fontWeight="800"
      >
        ✓
      </text>
      <text
        x="246"
        y="247"
        fontFamily="Outfit,sans-serif"
        fontSize="7.5"
        fill="rgba(255,255,255,.6)"
        fontWeight="600"
      >
        APPOINTMENT
      </text>
      <text
        x="246"
        y="260"
        fontFamily="Outfit,sans-serif"
        fontSize="9"
        fill="#fff"
        fontWeight="700"
      >
        Confirmed · 9:00 AM
      </text>

      {/* Stethoscope decoration top-right */}
      <circle
        cx="320"
        cy="80"
        r="26"
        fill="rgba(0,180,216,.08)"
        stroke="rgba(0,180,216,.15)"
        strokeWidth="1"
      />
      <path
        d="M308,72 Q310,60 320,60 Q330,60 332,72"
        fill="none"
        stroke="rgba(0,180,216,.6)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="308"
        y1="72"
        x2="308"
        y2="86"
        stroke="rgba(0,180,216,.6)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx="308"
        cy="90"
        r="6"
        fill="none"
        stroke="rgba(0,180,216,.6)"
        strokeWidth="3"
      />
      <circle cx="308" cy="90" r="3" fill="rgba(0,180,216,.4)" />

      {/* Plus cross bottom-left */}
      <rect
        x="28"
        y="218"
        width="10"
        height="30"
        rx="5"
        fill="rgba(33,150,243,.35)"
      />
      <rect
        x="18"
        y="228"
        width="30"
        height="10"
        rx="5"
        fill="rgba(33,150,243,.35)"
      />
    </svg>

    {/* Live badge */}
    <div
      className="float-2"
      style={{
        position: 'absolute',
        top: '8%',
        right: '4%',
        background: 'rgba(13,40,87,.92)',
        border: '1px solid rgba(0,180,216,.3)',
        borderRadius: 12,
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        backdropFilter: 'blur(12px)',
        fontSize: '.8rem',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#4caf50',
          display: 'inline-block',
        }}
        className="pulse-dot"
      />
      <span style={{ color: 'rgba(255,255,255,.85)', fontWeight: 600 }}>
        Live Health Monitor
      </span>
    </div>

    {/* Rating badge */}
    <div
      className="float-3"
      style={{
        position: 'absolute',
        bottom: '12%',
        left: '0%',
        background: 'rgba(13,40,87,.92)',
        border: '1px solid rgba(255,179,0,.25)',
        borderRadius: 12,
        padding: '8px 14px',
        backdropFilter: 'blur(12px)',
        fontSize: '.8rem',
      }}
    >
      <div style={{ color: '#ffb300', fontWeight: 800, fontSize: '1.1rem' }}>
        ★ 4.9
      </div>
      <div
        style={{
          color: 'rgba(255,255,255,.6)',
          fontSize: '.7rem',
          marginTop: 2,
        }}
      >
        200+ Verified Doctors
      </div>
    </div>
  </div>
);

const HeroSection = ({ user }) => (
  <section
    className="hero-bg"
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: '4rem',
    }}
  >
    <div className="hero-grid" />
    <div className="hero-orb-1" />
    <div className="hero-orb-2" />

    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '4rem 1.5rem',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
        gap: '4rem',
        alignItems: 'center',
      }}
    >
      {/* Text */}
      <div>
        <div
          className="anim-fade-up"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(0,180,216,.12)',
            border: '1px solid rgba(0,180,216,.25)',
            borderRadius: 100,
            padding: '.35rem 1rem',
            marginBottom: '1.5rem',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#00b4d8',
            }}
            className="pulse-dot"
          />
          <span
            style={{
              color: '#00b4d8',
              fontSize: '.75rem',
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
            }}
          >
            Trusted by 15,000+ Patients
          </span>
        </div>

        <h1
          className="anim-fade-up d1"
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 'clamp(2.4rem,5vw,3.8rem)',
            fontWeight: 800,
            lineHeight: 1.12,
            color: '#fff',
            marginBottom: '1.25rem',
          }}
        >
          Healthcare That <span className="grad-text">Puts You First</span>
        </h1>

        <p
          className="anim-fade-up d2"
          style={{
            color: 'rgba(255,255,255,.65)',
            fontSize: '1.0625rem',
            lineHeight: 1.75,
            maxWidth: 480,
            marginBottom: '2rem',
          }}
        >
          Book verified specialists, manage appointments, access digital
          prescriptions — all from one intelligent platform built for the modern
          patient.
        </p>

        {/* CTA row */}
        <div
          className="anim-fade-up d3"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {!user ? (
            <>
              <Link
                to="/signup"
                className="btn-primary"
                style={{ padding: '.85rem 1.75rem', fontSize: '1rem' }}
              >
                Start Free Today →
              </Link>
              <Link
                to="/doctors"
                className="btn-ghost"
                style={{ padding: '.85rem 1.75rem', fontSize: '1rem' }}
              >
                Browse Doctors
              </Link>
            </>
          ) : user.role === 'patient' ? (
            <>
              <Link
                to="/patient/dashboard"
                className="btn-primary"
                style={{ padding: '.85rem 1.75rem', fontSize: '1rem' }}
              >
                My Dashboard →
              </Link>
              <Link
                to="/doctors"
                className="btn-ghost"
                style={{ padding: '.85rem 1.75rem', fontSize: '1rem' }}
              >
                Find Doctors
              </Link>
            </>
          ) : null}
        </div>

        {/* Trust badges */}
        <div
          className="anim-fade-up d4"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}
        >
          {[
            { icon: '🛡️', label: 'HIPAA Compliant' },
            { icon: '⚡', label: 'Book in 60 sec' },
            { icon: '💬', label: '24/7 Support' },
          ].map((b) => (
            <div
              key={b.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10,
                padding: '.45rem .9rem',
                color: 'rgba(255,255,255,.7)',
                fontSize: '.8rem',
                fontWeight: 600,
              }}
            >
              <span>{b.icon}</span> {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* Illustration */}
      <div
        className="anim-fade-in d2"
        style={{ position: 'relative', height: 380 }}
      >
        <HeroIllustration />
      </div>
    </div>

    {/* Scroll cue */}
    <div
      style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          color: 'rgba(255,255,255,.3)',
          fontSize: '.75rem',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        Scroll
      </div>
      <div
        style={{
          width: 1,
          height: 32,
          background:
            'linear-gradient(to bottom, rgba(0,180,216,.5), transparent)',
          margin: '0 auto',
        }}
      />
    </div>
  </section>
);

/* ================================================================
   STATS SECTION
   ================================================================ */
const StatsSection = ({ stats }) => {
  const items = [
    {
      label: 'Patients Served',
      value: stats?.patients || '15K+',
      icon: '👤',
      color: '#2196f3',
    },
    {
      label: 'Verified Doctors',
      value: stats?.doctors || '200+',
      icon: '🩺',
      color: '#00b4d8',
    },
    {
      label: 'Appointments',
      value: stats?.appointments || '50K+',
      icon: '📅',
      color: '#43a047',
    },
    {
      label: 'Departments',
      value: stats?.departments || '24',
      icon: '🏥',
      color: '#f59e0b',
    },
  ];
  return (
    <section style={{ background: '#f0f6ff', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            gap: '1.5rem',
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.label}
              className={`light-card anim-fade-up d${i + 1}`}
              style={{
                padding: '2rem',
                textAlign: 'center',
                borderTop: `3px solid ${item.color}`,
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>
                {item.icon}
              </div>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: item.color,
                  lineHeight: 1,
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  color: '#64748b',
                  fontWeight: 500,
                  marginTop: '.5rem',
                  fontSize: '.9rem',
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================================================================
   HOW IT WORKS
   ================================================================ */
const HowItWorksSection = () => {
  const steps = [
    {
      n: '01',
      title: 'Create Account',
      desc: 'Sign up in seconds and set up your health profile securely.',
      icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0',
    },
    {
      n: '02',
      title: 'Find a Specialist',
      desc: 'Browse 200+ verified doctors by specialty, rating, or availability.',
      icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
    },
    {
      n: '03',
      title: 'Book Instantly',
      desc: 'Choose a time slot and confirm your appointment in under 60 seconds.',
      icon: 'M6.75 3v2.25M17.25 3v2.25M3.75 18.75h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75v12a1.5 1.5 0 001.5 1.5z',
    },
    {
      n: '04',
      title: 'Get Care & Prescriptions',
      desc: 'Consult online or in-clinic. Access digital prescriptions anytime.',
      icon: 'M9 12h6m-6 4h6M9 8h6m2.25-4.5H6.75A2.25 2.25 0 004.5 5.75v12.5a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 18.25V5.75A2.25 2.25 0 0017.25 3.5z',
    },
  ];
  return (
    <section
      id="how-it-works"
      style={{ padding: '6rem 1.5rem', background: '#fff' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div
            className="section-eyebrow anim-fade-up"
            style={{ justifyContent: 'center' }}
          >
            Simple Process
          </div>
          <h2
            className="section-title anim-fade-up d1"
            style={{ textAlign: 'center' }}
          >
            How <span className="accent">AlphaCare</span> Works
          </h2>
          <p
            className="section-sub anim-fade-up d2"
            style={{ margin: '0.75rem auto 0', textAlign: 'center' }}
          >
            From discovery to consultation in four seamless steps.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
            gap: '2rem',
            position: 'relative',
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.n}
              className={`anim-fade-up d${i + 1}`}
              style={{ position: 'relative' }}
            >
              {/* connector line between steps */}
              {i < steps.length - 1 && (
                <div
                  className="step-connector"
                  style={{
                    position: 'absolute',
                    top: 28,
                    left: 'calc(50% + 32px)',
                    width: 'calc(100% - 64px)',
                    height: 2,
                    background: 'linear-gradient(90deg, #2196f3, #00b4d8)',
                  }}
                />
              )}
              <div
                className="light-card"
                style={{ padding: '2rem', textAlign: 'center', height: '100%' }}
              >
                {/* Step number + icon */}
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1565c0, #00b4d8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      boxShadow: '0 8px 24px rgba(21,101,192,.3)',
                    }}
                  >
                    <svg
                      style={{ width: 28, height: 28 }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#fff"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={step.icon}
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: '#fff',
                      border: '2px solid #e2eaf6',
                      borderRadius: 8,
                      padding: '2px 6px',
                      fontSize: '.65rem',
                      fontWeight: 800,
                      color: '#1565c0',
                    }}
                  >
                    {step.n}
                  </span>
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: '#0a1628',
                    marginBottom: '.6rem',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    color: '#64748b',
                    fontSize: '.9rem',
                    lineHeight: 1.65,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================================================================
   FEATURES SECTION
   ================================================================ */
const FeaturesSection = () => {
  const features = [
    {
      title: 'Instant Booking',
      desc: 'Book appointments with any specialist in under 60 seconds, any time of day.',
      color: '#2196f3',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      title: 'Digital Prescriptions',
      desc: 'Access and download your prescriptions digitally after every consultation.',
      color: '#00b4d8',
      icon: 'M9 12h6m-6 4h6M9 8h6m2.25-4.5H6.75A2.25 2.25 0 004.5 5.75v12.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25z',
    },
    {
      title: 'Online Consultations',
      desc: 'Video and chat-based consultations with verified doctors from anywhere.',
      color: '#43a047',
      icon: 'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z',
    },
    {
      title: 'Smart Notifications',
      desc: 'Get reminded about appointments, follow-ups, and medication schedules.',
      color: '#f59e0b',
      icon: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
    },
    {
      title: 'Appointment Tracking',
      desc: 'Track appointment status from pending to confirmed to completed in real-time.',
      color: '#ec407a',
      icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      title: 'Secure Medical Records',
      desc: 'All records encrypted and HIPAA-compliant. Your health data, always protected.',
      color: '#7c3aed',
      icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
    },
  ];

  return (
    <section
      id="features"
      style={{
        background: 'linear-gradient(180deg, #f7fafe 0%, #fff 100%)',
        padding: '6rem 1.5rem',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
            marginBottom: '4rem',
          }}
          className="anim-fade-up"
        >
          <div>
            <div className="section-eyebrow">Platform Features</div>
            <h2 className="section-title">
              Everything You Need in <span className="accent">One Place</span>
            </h2>
            <p className="section-sub">
              AlphaCare brings the entire healthcare journey together — from
              booking to billing, in one seamless experience.
            </p>
          </div>
          {/* Dark feature summary card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0a1628, #0e2147)',
              borderRadius: 24,
              padding: '2rem',
              color: '#fff',
              border: '1px solid rgba(0,180,216,.15)',
            }}
          >
            <div
              style={{ fontSize: '2.5rem', fontWeight: 900, color: '#00b4d8' }}
            >
              6
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '1.1rem',
                marginTop: '.25rem',
              }}
            >
              Core Features
            </div>
            <p
              style={{
                color: 'rgba(255,255,255,.55)',
                fontSize: '.9rem',
                marginTop: '.5rem',
                lineHeight: 1.6,
              }}
            >
              Designed to simplify your healthcare journey from the first
              booking to the last prescription.
            </p>
            <div
              style={{
                marginTop: '1.25rem',
                display: 'flex',
                gap: '.5rem',
                flexWrap: 'wrap',
              }}
            >
              {['HIPAA Safe', 'Encrypted', '24/7'].map((t) => (
                <span
                  key={t}
                  style={{
                    background: 'rgba(0,180,216,.15)',
                    border: '1px solid rgba(0,180,216,.2)',
                    borderRadius: 8,
                    padding: '.25rem .7rem',
                    fontSize: '.75rem',
                    fontWeight: 600,
                    color: '#81d4fa',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: '1.5rem',
          }}
        >
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`light-card anim-fade-up d${(i % 6) + 1}`}
              style={{ padding: '1.75rem' }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.1rem',
                }}
              >
                <svg
                  style={{ width: 26, height: 26 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={f.color}
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={f.icon}
                  />
                </svg>
              </div>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: '#0a1628',
                  marginBottom: '.5rem',
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: '#64748b',
                  fontSize: '.9rem',
                  lineHeight: 1.65,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================================================================
   FEATURED DOCTORS
   ================================================================ */
const avatarPalettes = ['#1565c0', '#00838f', '#6a1b9a', '#2e7d32', '#c62828'];
const DoctorCard = ({ doctor, index }) => {
  const [imgErr, setImgErr] = useState(false);
  const name = doctor?.userId?.fullName || 'Doctor';
  const photo = doctor?.userId?.profilePicture;
  const dept = doctor?.department?.name || '';
  const spec = doctor?.specialization || dept;
  const exp = doctor?.experience;
  const fee = doctor?.consultationFee;
  const rating = doctor?.averageRating || 4 + (name.charCodeAt(0) % 10) / 10;
  const reviews = 40 + (name.charCodeAt(0) % 140);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const bg = avatarPalettes[index % avatarPalettes.length];

  return (
    <div
      className={`anim-fade-up d${(index % 4) + 1}`}
      style={{
        background: '#fff',
        border: '1px solid #e8eef6',
        borderRadius: 24,
        overflow: 'hidden',
        transition: 'transform .25s, box-shadow .25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 20px 48px rgba(21,101,192,.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Avatar zone */}
      <div
        style={{
          background: `linear-gradient(135deg, ${bg}18, ${bg}08)`,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Dept chip */}
        <span
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: `${bg}20`,
            color: bg,
            border: `1px solid ${bg}30`,
            borderRadius: 8,
            padding: '.2rem .6rem',
            fontSize: '.7rem',
            fontWeight: 700,
          }}
        >
          {dept}
        </span>

        {/* Available dot */}
        <span
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: '#e8f5e9',
            color: '#2e7d32',
            border: '1px solid #c8e6c9',
            borderRadius: 8,
            padding: '.2rem .6rem',
            fontSize: '.7rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#43a047',
              display: 'inline-block',
            }}
            className="pulse-dot"
          />
          Available
        </span>

        {/* Avatar */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: 20,
            overflow: 'hidden',
            border: '3px solid #fff',
            boxShadow: `0 8px 24px ${bg}40`,
            marginTop: '1rem',
          }}
        >
          {photo && !imgErr ? (
            <img
              src={photo}
              alt={name}
              onError={() => setImgErr(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="doc-avatar-fallback"
              style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg,${bg},${bg}cc)`,
              }}
            >
              {initials || '?'}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1.25rem' }}>
        <h3
          style={{
            fontWeight: 700,
            fontSize: '1.05rem',
            color: '#0a1628',
            marginBottom: '.2rem',
          }}
        >
          Dr. {name}
        </h3>
        <p
          style={{
            color: '#1565c0',
            fontSize: '.85rem',
            fontWeight: 600,
            marginBottom: '.75rem',
          }}
        >
          {spec}
        </p>

        {/* Stars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: '.75rem',
          }}
        >
          <div style={{ display: 'flex' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                style={{
                  color: s <= Math.round(rating) ? '#f59e0b' : '#e2e8f0',
                  fontSize: '.85rem',
                }}
              >
                ★
              </span>
            ))}
          </div>
          <span
            style={{ fontSize: '.8rem', fontWeight: 600, color: '#64748b' }}
          >
            {Number(rating).toFixed(1)} ({reviews})
          </span>
        </div>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            gap: '.5rem',
            flexWrap: 'wrap',
            marginBottom: '1.1rem',
          }}
        >
          {exp && (
            <span
              style={{
                background: '#f0f6ff',
                color: '#1565c0',
                borderRadius: 8,
                padding: '.2rem .6rem',
                fontSize: '.75rem',
                fontWeight: 600,
              }}
            >
              {exp} yrs
            </span>
          )}
          {fee && (
            <span
              style={{
                background: '#f0fdf4',
                color: '#2e7d32',
                borderRadius: 8,
                padding: '.2rem .6rem',
                fontSize: '.75rem',
                fontWeight: 600,
              }}
            >
              ₹{fee}
            </span>
          )}
        </div>

        <Link
          to={`/doctors/${doctor._id}`}
          style={{
            display: 'block',
            textAlign: 'center',
            background: `linear-gradient(135deg,${bg},${bg}cc)`,
            color: '#fff',
            fontWeight: 700,
            fontSize: '.875rem',
            borderRadius: 12,
            padding: '.75rem',
            textDecoration: 'none',
            transition: 'opacity .2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

const DoctorsSection = ({ doctors }) => {
  const featured = doctors.slice(0, 4);
  return (
    <section
      id="doctors"
      style={{ background: '#f7fafe', padding: '6rem 1.5rem' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            className="section-eyebrow anim-fade-up"
            style={{ justifyContent: 'center' }}
          >
            Our Specialists
          </div>
          <h2
            className="section-title anim-fade-up d1"
            style={{ textAlign: 'center' }}
          >
            Meet Our <span className="accent">Top Doctors</span>
          </h2>
          <p
            className="section-sub anim-fade-up d2"
            style={{ margin: '.75rem auto 0', textAlign: 'center' }}
          >
            Board-certified specialists committed to delivering exceptional
            care.
          </p>
        </div>

        {featured.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem',
            }}
          >
            {featured.map((doc, i) => (
              <DoctorCard key={doc._id} doctor={doc} index={i} />
            ))}
          </div>
        ) : (
          <div
            style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}
          >
            No doctors available right now.
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link
            to="/doctors"
            className="btn-primary"
            style={{ padding: '.9rem 2rem', fontSize: '1rem' }}
          >
            View All Doctors →
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ================================================================
   FAQ SECTION
   ================================================================ */
const FAQSection = () => {
  const [active, setActive] = useState(null);
  const faqs = [
    {
      q: 'How do I book an appointment?',
      a: 'Browse doctors, select a specialist, choose a date and available time slot, then confirm your booking. The whole process takes under 60 seconds.',
    },
    {
      q: 'Can I have an online consultation?',
      a: 'Yes! AlphaCare supports video and text-based online consultations. When you book, choose "Online" as the consultation type and you\'ll receive a meeting link.',
    },
    {
      q: 'Where can I access my prescriptions?',
      a: 'All prescriptions are stored digitally in "My Prescriptions" inside your patient dashboard. You can view, download, or share them anytime.',
    },
    {
      q: 'Can I cancel or reschedule?',
      a: 'Yes. Navigate to "My Appointments" in your dashboard, select the appointment, and use the Cancel option. Reschedule by booking a new slot.',
    },
    {
      q: 'Is my health data secure?',
      a: 'Absolutely. AlphaCare uses end-to-end encryption and is fully HIPAA-compliant. Your data is never shared without your explicit consent.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept UPI, credit/debit cards, and net banking. Payment is collected at booking confirmation.',
    },
  ];
  return (
    <section id="faq" style={{ background: '#fff', padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            className="section-eyebrow anim-fade-up"
            style={{ justifyContent: 'center' }}
          >
            FAQ
          </div>
          <h2
            className="section-title anim-fade-up d1"
            style={{ textAlign: 'center' }}
          >
            Common <span className="accent">Questions</span>
          </h2>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}
        >
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item${active === i ? ' open' : ''} anim-fade-up d${(i % 5) + 1}`}
            >
              <button
                className="faq-btn"
                onClick={() => setActive(active === i ? null : i)}
              >
                <span>{faq.q}</span>
                <span className="faq-icon">{active === i ? '×' : '+'}</span>
              </button>
              <div
                className="faq-body"
                style={{ maxHeight: active === i ? 300 : 0 }}
              >
                <div
                  style={{
                    padding: '0 1.5rem 1.25rem',
                    color: '#64748b',
                    lineHeight: 1.7,
                    fontSize: '.95rem',
                  }}
                >
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================================================================
   CTA BANNER
   ================================================================ */
const CTABanner = ({ user }) => (
  <section
    style={{
      background:
        'linear-gradient(135deg, #0a1628 0%, #0e2147 60%, #071528 100%)',
      padding: '5rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(33,150,243,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(33,150,243,.05) 1px,transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: '-10%',
        top: '-30%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background:
          'radial-gradient(circle,rgba(0,180,216,.15) 0%,transparent 70%)',
        pointerEvents: 'none',
      }}
    />

    <div
      style={{
        maxWidth: 700,
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <div
        className="anim-fade-up"
        style={{
          display: 'inline-block',
          marginBottom: '1.5rem',
          background: 'rgba(0,180,216,.12)',
          border: '1px solid rgba(0,180,216,.25)',
          borderRadius: 100,
          padding: '.35rem 1rem',
          color: '#00b4d8',
          fontSize: '.75rem',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
        }}
      >
        Ready to get started?
      </div>
      <h2
        className="anim-fade-up d1"
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 'clamp(1.8rem,4vw,2.8rem)',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.2,
          marginBottom: '1.1rem',
        }}
      >
        Your Health Deserves the <span className="grad-text">Best Care</span>
      </h2>
      <p
        className="anim-fade-up d2"
        style={{
          color: 'rgba(255,255,255,.6)',
          fontSize: '1.0625rem',
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}
      >
        Join thousands of patients who trust AlphaCare to connect them with the
        right specialist, at the right time.
      </p>
      <div
        className="anim-fade-up d3"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {!user ? (
          <Link
            to="/signup"
            className="btn-primary"
            style={{ padding: '.9rem 2rem', fontSize: '1rem' }}
          >
            Create Free Account →
          </Link>
        ) : (
          <Link
            to="/doctors"
            className="btn-primary"
            style={{ padding: '.9rem 2rem', fontSize: '1rem' }}
          >
            Find a Doctor →
          </Link>
        )}
        <Link
          to="/doctors"
          className="btn-ghost"
          style={{ padding: '.9rem 2rem', fontSize: '1rem' }}
        >
          Browse Specialists
        </Link>
      </div>
    </div>
  </section>
);

/* ================================================================
   FOOTER
   ================================================================ */
const Footer = () => (
  <footer
    className="footer-bg"
    style={{ padding: '4rem 1.5rem 2rem', color: 'rgba(255,255,255,.7)' }}
  >
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}
      >
        {/* Brand */}
        <div>
          <AlphaCareLogo mono size={34} textSize="lg" />
          <p
            style={{
              color: 'rgba(255,255,255,.45)',
              marginTop: '1rem',
              fontSize: '.9rem',
              lineHeight: 1.7,
            }}
          >
            Smart healthcare platform connecting patients with verified
            specialists across India.
          </p>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
            {['Twitter', 'LinkedIn', 'Instagram'].map((s) => (
              <a
                key={s}
                href="#"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,.5)',
                  fontSize: '.7rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(33,150,243,.2)';
                  e.currentTarget.style.color = '#90caf9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.07)';
                  e.currentTarget.style.color = 'rgba(255,255,255,.5)';
                }}
              >
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h4
            style={{
              fontWeight: 700,
              color: '#fff',
              marginBottom: '1rem',
              fontSize: '.9rem',
              letterSpacing: '.05em',
            }}
          >
            PLATFORM
          </h4>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}
          >
            {[
              ['Find Doctors', '/doctors'],
              ['Book Appointment', '/doctors'],
              ['My Prescriptions', '/patient/prescriptions'],
            ].map(([l, h]) => (
              <Link
                key={l}
                to={h}
                style={{
                  color: 'rgba(255,255,255,.45)',
                  textDecoration: 'none',
                  fontSize: '.9rem',
                  transition: 'color .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#90caf9')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'rgba(255,255,255,.45)')
                }
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4
            style={{
              fontWeight: 700,
              color: '#fff',
              marginBottom: '1rem',
              fontSize: '.9rem',
              letterSpacing: '.05em',
            }}
          >
            ACCOUNT
          </h4>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}
          >
            {[
              ['Login', '/login'],
              ['Sign Up', '/signup'],
              ['Dashboard', '/patient/dashboard'],
            ].map(([l, h]) => (
              <Link
                key={l}
                to={h}
                style={{
                  color: 'rgba(255,255,255,.45)',
                  textDecoration: 'none',
                  fontSize: '.9rem',
                  transition: 'color .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#90caf9')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'rgba(255,255,255,.45)')
                }
              >
                {l}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4
            style={{
              fontWeight: 700,
              color: '#fff',
              marginBottom: '1rem',
              fontSize: '.9rem',
              letterSpacing: '.05em',
            }}
          >
            CONTACT
          </h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '.6rem',
              fontSize: '.9rem',
            }}
          >
            <span>📧 support@alphacare.in</span>
            <span>📞 +91 98765 43210</span>
            <span>📍 Mumbai, India</span>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,.07)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '.8rem',
          color: 'rgba(255,255,255,.3)',
        }}
      >
        <span>
          © 2026 AlphaCare Health Technologies Pvt. Ltd. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
            <a
              key={l}
              href="#"
              style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'rgba(255,255,255,.6)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'rgba(255,255,255,.3)')
              }
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

/* ================================================================
   LOADING SCREEN
   ================================================================ */
const LoadingScreen = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#0a1628,#0e2147)',
      gap: '1.5rem',
    }}
  >
    <AlphaCareLogo mono size={52} textSize="xl" />
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '4px solid rgba(33,150,243,.2)',
        borderTopColor: '#2196f3',
        animation: 'spin 1s linear infinite',
      }}
    />
    <p
      style={{
        color: 'rgba(255,255,255,.4)',
        fontSize: '.9rem',
        letterSpacing: '.08em',
      }}
    >
      Loading your health platform…
    </p>
    <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
  </div>
);

/* ================================================================
   HOME PAGE  (root component)
   ================================================================ */
const HomePage = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuthStore();

  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, , dRes] = await Promise.all([
          getPublicStats(),
          getDepartments(), // fetched but not rendered as a section
          getAllDoctors(),
        ]);
        setStats(sRes.data.stats);
        setDoctors(dRes.data.doctors);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDashboard = () => {
    if (user?.role === 'patient') navigate('/patient/dashboard');
    else if (user?.role === 'doctor') navigate('/doctor/dashboard');
    else if (user?.role === 'admin') navigate('/admin/dashboard');
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div style={{ fontFamily: "'Outfit',sans-serif", overflowX: 'hidden' }}>
        {/* ── NAVBAR ── */}
        <Navbar
          user={user}
          onDashboard={handleDashboard}
          onLogout={logoutUser}
        />

        {/* ── HERO ── */}
        <HeroSection user={user} />

        {/* ── STATS ── */}
        <StatsSection stats={stats} />

        {/* ── HOW IT WORKS ── */}
        <HowItWorksSection />

        {/* ── FEATURES ── */}
        <FeaturesSection />

        {/* ── DOCTORS ── */}
        <DoctorsSection doctors={doctors} />

        {/* ── FAQ ── */}
        <FAQSection />

        {/* ── CTA BANNER ── */}
        <CTABanner user={user} />

        {/* ── FOOTER ── */}
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
