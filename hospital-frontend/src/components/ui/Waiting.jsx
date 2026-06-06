import React from 'react';

const Waiting = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f0f5fb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes orbit {
          from { transform: rotate(0deg) translateX(36px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(36px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(120deg) translateX(36px) rotate(-120deg); }
          to   { transform: rotate(480deg) translateX(36px) rotate(-480deg); }
        }
        @keyframes orbit3 {
          from { transform: rotate(240deg) translateX(36px) rotate(-240deg); }
          to   { transform: rotate(600deg) translateX(36px) rotate(-600deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.8); opacity: 0.6; }
          50%  { transform: scale(1.15); opacity: 0.15; }
          100% { transform: scale(0.8); opacity: 0.6; }
        }
        @keyframes auth-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes text-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes dot-bounce {
          0%,80%,100% { transform: scaleY(0.4); opacity: 0.4; }
          40%          { transform: scaleY(1);   opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .auth-card {
          animation: fade-in-up 0.5s cubic-bezier(0.34,1.2,0.64,1) both, auth-float 4s ease-in-out infinite 0.5s;
        }
        .orbit-dot-1 { animation: orbit  2.4s linear infinite; }
        .orbit-dot-2 { animation: orbit2 2.4s linear infinite; }
        .orbit-dot-3 { animation: orbit3 2.4s linear infinite; }
        .pulse-ring   { animation: pulse-ring 2s ease-in-out infinite; }
        .pulse-ring-2 { animation: pulse-ring 2s ease-in-out infinite 0.5s; }

        .shimmer-text {
          background: linear-gradient(90deg, #1d4ed8 0%, #6366f1 40%, #38bdf8 60%, #1d4ed8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: text-shimmer 2.5s linear infinite;
        }

        .bar { animation: dot-bounce 1.2s ease-in-out infinite; }
        .bar:nth-child(2) { animation-delay: 0.15s; }
        .bar:nth-child(3) { animation-delay: 0.30s; }
        .bar:nth-child(4) { animation-delay: 0.45s; }
        .bar:nth-child(5) { animation-delay: 0.60s; }
      `}</style>

      <div
        className="auth-card"
        style={{
          background: 'white',
          borderRadius: '28px',
          border: '1px solid rgba(203,213,225,0.6)',
          padding: '48px 52px',
          textAlign: 'center',
          boxShadow:
            '0 24px 64px rgba(15,23,42,0.1), 0 4px 16px rgba(15,23,42,0.06)',
          maxWidth: '340px',
          width: '90%',
        }}
      >
        {/* Orbital spinner */}
        <div
          style={{
            position: 'relative',
            width: '88px',
            height: '88px',
            margin: '0 auto 28px',
          }}
        >
          {/* Pulse rings */}
          <div
            className="pulse-ring"
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              border: '1.5px solid rgba(37,99,235,0.3)',
            }}
          />
          <div
            className="pulse-ring-2"
            style={{
              position: 'absolute',
              inset: '-16px',
              borderRadius: '50%',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          />

          {/* Center circle */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
              border: '1.5px solid rgba(37,99,235,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            🔐
          </div>

          {/* Orbiting dots */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className="orbit-dot-1"
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
                boxShadow: '0 0 8px rgba(37,99,235,0.6)',
                position: 'absolute',
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className="orbit-dot-2"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                boxShadow: '0 0 8px rgba(99,102,241,0.6)',
                position: 'absolute',
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className="orbit-dot-3"
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                boxShadow: '0 0 8px rgba(14,165,233,0.6)',
                position: 'absolute',
              }}
            />
          </div>
        </div>

        {/* AlphaCare label */}
        <p
          style={{
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: '6px',
          }}
        >
          AlphaCare
        </p>

        {/* Shimmer heading */}
        <h2
          className="shimmer-text"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '20px',
            fontWeight: '800',
            margin: '0 0 8px',
          }}
        >
          Verifying Identity
        </h2>

        <p
          style={{
            fontSize: '13px',
            color: '#94a3b8',
            fontWeight: '500',
            margin: '0 0 24px',
          }}
        >
          Checking your credentials securely
        </p>

        {/* Waveform bars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            height: '28px',
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bar"
              style={{
                width: '4px',
                height: '20px',
                borderRadius: '99px',
                background:
                  i <= 2
                    ? 'linear-gradient(180deg,#38bdf8,#2563eb)'
                    : i === 3
                      ? 'linear-gradient(180deg,#6366f1,#2563eb)'
                      : 'linear-gradient(180deg,#a855f7,#6366f1)',
                transformOrigin: 'bottom',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Waiting;
