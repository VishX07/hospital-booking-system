import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/auth.store.js';
import { updateProfile, updateProfilePhoto } from '../../api/auth.api.js';
import ROUTES from '../../constants/routes.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

/* ─── Inline styles / keyframes injected once ─── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');

  .ps-root * { box-sizing: border-box; }

  @keyframes ps-slideUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes ps-fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes ps-ringPulse {
    0%,100% { box-shadow: 0 0 0 0   rgba(255,255,255,0.45); }
    50%      { box-shadow: 0 0 0 10px rgba(255,255,255,0);  }
  }
  @keyframes ps-float {
    0%,100% { transform: translateY(0px) rotate(0deg);   }
    33%      { transform: translateY(-9px) rotate(2deg);  }
    66%      { transform: translateY(-4px) rotate(-1deg); }
  }
  @keyframes ps-floatB {
    0%,100% { transform: translateY(0px) rotate(0deg);   }
    50%      { transform: translateY(-12px) rotate(-3deg);}
  }
  @keyframes ps-barFill {
    from { width: 0 !important; }
  }
  @keyframes ps-checkDraw {
    from { stroke-dashoffset: 24; }
    to   { stroke-dashoffset: 0;  }
  }
  @keyframes ps-spin {
    to { transform: rotate(360deg); }
  }

  .ps-hero-card         { animation: ps-slideUp 0.5s cubic-bezier(.22,1,.36,1) both; }
  .ps-prog-card         { animation: ps-slideUp 0.5s cubic-bezier(.22,1,.36,1) 0.08s both; }
  .ps-stats-row         { animation: ps-slideUp 0.5s cubic-bezier(.22,1,.36,1) 0.14s both; }
  .ps-photo-card        { animation: ps-slideUp 0.5s cubic-bezier(.22,1,.36,1) 0.20s both; }
  .ps-form-card         { animation: ps-slideUp 0.5s cubic-bezier(.22,1,.36,1) 0.26s both; }
  .ps-security-card     { animation: ps-slideUp 0.5s cubic-bezier(.22,1,.36,1) 0.32s both; }

  .ps-float-a { animation: ps-float  6s ease-in-out infinite; }
  .ps-float-b { animation: ps-floatB 8s ease-in-out infinite; }
  .ps-float-c { animation: ps-float  7s ease-in-out 1s infinite; }

  .ps-bar-fill { animation: ps-barFill 1.2s cubic-bezier(.4,0,.2,1) 0.4s both; }

  .ps-ring-pulse { animation: ps-ringPulse 3s ease-in-out infinite; }

  .ps-check-draw {
    stroke-dasharray: 24;
    stroke-dashoffset: 24;
    animation: ps-checkDraw 0.45s ease forwards 0.2s;
  }

  .ps-upload-zone {
    border: 2px dashed #c7d2fe;
    border-radius: 16px;
    padding: 1.25rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
    background: #f5f8ff;
  }
  .ps-upload-zone:hover {
    border-color: #2563eb;
    background: #eff6ff;
    transform: scale(1.01);
  }

  .ps-field input,
  .ps-field select {
    width: 100%;
    padding: 0.7rem 1rem;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    color: #1e293b;
    background: white;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    appearance: none;
  }
  .ps-field input:focus,
  .ps-field select:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
  }
  .ps-field input:disabled {
    background: #f8fafc;
    color: #94a3b8;
    cursor: not-allowed;
  }

  .ps-btn-primary {
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    color: white;
    border: none;
    border-radius: 14px;
    padding: 0.8rem 1.75rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 16px rgba(37,99,235,0.3);
  }
  .ps-btn-primary:hover  { opacity: 0.92; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.35); }
  .ps-btn-primary:active { transform: scale(0.97); }
  .ps-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .ps-btn-dark {
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 14px;
    padding: 0.8rem 1.5rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
  }
  .ps-btn-dark:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.25); }

  .ps-btn-upload {
    background: white;
    color: #2563eb;
    border: 1.5px solid #c7d2fe;
    border-radius: 12px;
    padding: 0.65rem 1.25rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .ps-btn-upload:hover { background: #eff6ff; border-color: #2563eb; transform: translateY(-1px); }

  .ps-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .ps-section-icon {
    width: 46px; height: 46px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .ps-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: ps-spin 0.7s linear infinite;
    display: inline-block;
  }
`;

/* ─── SVG Illustrations ─── */
const MedCrossIllustration = () => (
  <svg
    width="110"
    height="110"
    viewBox="0 0 110 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="38"
      y="8"
      width="34"
      height="94"
      rx="10"
      fill="rgba(255,255,255,0.18)"
    />
    <rect
      x="8"
      y="38"
      width="94"
      height="34"
      rx="10"
      fill="rgba(255,255,255,0.18)"
    />
    <rect
      x="44"
      y="14"
      width="22"
      height="82"
      rx="7"
      fill="rgba(255,255,255,0.12)"
    />
    <rect
      x="14"
      y="44"
      width="82"
      height="22"
      rx="7"
      fill="rgba(255,255,255,0.12)"
    />
    <circle cx="55" cy="55" r="14" fill="rgba(255,255,255,0.15)" />
  </svg>
);

const PillIllustration = () => (
  <svg
    width="70"
    height="32"
    viewBox="0 0 70 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="1"
      y="1"
      width="68"
      height="30"
      rx="15"
      fill="rgba(255,255,255,0.15)"
      stroke="rgba(255,255,255,0.25)"
      strokeWidth="1.5"
    />
    <line
      x1="35"
      y1="1"
      x2="35"
      y2="31"
      stroke="rgba(255,255,255,0.25)"
      strokeWidth="1.5"
    />
    <rect
      x="1"
      y="1"
      width="34"
      height="30"
      rx="15"
      fill="rgba(255,255,255,0.1)"
    />
  </svg>
);

const HeartbeatIllustration = () => (
  <svg
    width="90"
    height="36"
    viewBox="0 0 90 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <polyline
      points="0,18 18,18 24,6 30,30 36,12 42,18 54,18 60,4 66,32 72,18 90,18"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/* ─── Main Component ─── */
const PatientSettingsPage = () => {
  const { user, fetchCurrentUser } = useAuthStore();

  const profileFields = [
    user?.fullName,
    user?.email,
    user?.phoneNumber,
    user?.gender,
    user?.dateOfBirth,
    user?.profilePicture,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100,
  );
  const isProfileIncomplete = !user?.gender || !user?.dateOfBirth;

  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    gender: '',
    phoneNumber: '',
    dateOfBirth: '',
    fullName: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth?.split('T')[0] || '',
        phoneNumber: user.phoneNumber || '',
        fullName: user.fullName || '',
      });
    }
  }, [user]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile({
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        ...(formData.phoneNumber && {
          phoneNumber: formData.phoneNumber,
          fullName: formData.fullName,
        }),
      });
      await fetchCurrentUser();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo first');
      return;
    }
    try {
      setPhotoLoading(true);
      const photoData = new FormData();
      photoData.append('profilePicture', selectedFile);
      await updateProfilePhoto(photoData);
      await fetchCurrentUser();
      toast.success('Profile photo updated!');
      setSelectedFile(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) setSelectedFile(file);
  };

  return (
    <DashboardLayout>
      {/* Inject global styles once */}
      <style>{GLOBAL_STYLE}</style>

      <div
        className="ps-root"
        style={{
          background: '#f0f4ff',
          minHeight: '100vh',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* ── HERO ── */}
        <div
          className="ps-hero-card"
          style={{
            background:
              'linear-gradient(135deg, #1d4ed8 0%, #2563eb 35%, #4f46e5 70%, #7c3aed 100%)',
            padding: '2.5rem 2rem 5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decorative circles */}
          <div
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            <div
              style={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -40,
                left: -40,
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '30%',
                right: '15%',
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
              }}
            />
          </div>

          {/* Floating illustrations */}
          <div
            className="ps-float-a"
            style={{ position: 'absolute', top: 20, right: 24, opacity: 0.5 }}
          >
            <MedCrossIllustration />
          </div>
          <div
            className="ps-float-b"
            style={{
              position: 'absolute',
              bottom: 40,
              right: 180,
              opacity: 0.4,
            }}
          >
            <PillIllustration />
          </div>
          <div
            className="ps-float-c"
            style={{
              position: 'absolute',
              bottom: 50,
              left: 24,
              opacity: 0.35,
            }}
          >
            <HeartbeatIllustration />
          </div>

          {/* Hero content */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                className="ps-ring-pulse"
                style={{
                  borderRadius: '50%',
                  padding: 4,
                  border: '3px solid rgba(255,255,255,0.4)',
                  display: 'inline-block',
                }}
              >
                <img
                  src={user?.profilePicture}
                  alt={user?.fullName}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block',
                    background: '#c7d2fe',
                  }}
                />
              </div>
              {/* Online/verified dot */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '3px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="2,6 5,9 10,3" className="ps-check-draw" />
                </svg>
              </div>
            </div>

            {/* Name & info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                {user?.fullName}
              </h1>
              <p
                style={{
                  color: 'rgba(255,255,255,0.72)',
                  fontSize: '0.875rem',
                  marginTop: 4,
                }}
              >
                {user?.email}
              </p>
              <p
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.82rem',
                  marginTop: 2,
                }}
              >
                {user?.phoneNumber}
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginTop: 12,
                }}
              >
                <span
                  className="ps-tag"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    color: 'white',
                  }}
                >
                  Patient
                </span>
                {user?.isVerified && (
                  <span
                    className="ps-tag"
                    style={{ background: '#22c55e', color: 'white' }}
                  >
                    ✓ Verified
                  </span>
                )}
                <span
                  className="ps-tag"
                  style={{
                    background: isProfileIncomplete ? '#f59e0b' : '#16a34a',
                    color: 'white',
                  }}
                >
                  {isProfileIncomplete
                    ? `⚠ ${profileCompletion}% Complete`
                    : '✓ Profile Complete'}
                </span>
              </div>
            </div>

            {/* Completion ring */}
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                aria-label={`Profile ${profileCompletion}% complete`}
              >
                <circle
                  cx="40"
                  cy="40"
                  r="33"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="33"
                  fill="none"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 33}`}
                  strokeDashoffset={`${2 * Math.PI * 33 * (1 - profileCompletion / 100)}`}
                  transform="rotate(-90 40 40)"
                  style={{
                    transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)',
                  }}
                />
                <text
                  x="40"
                  y="36"
                  textAnchor="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="800"
                  fontFamily="Sora, sans-serif"
                >
                  {profileCompletion}%
                </text>
                <text
                  x="40"
                  y="52"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.65)"
                  fontSize="9"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  complete
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          style={{
            display: 'block',
            marginTop: -2,
            background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)',
          }}
        >
          <path
            d="M0,30 Q300,60 600,30 T1200,30 L1200,60 L0,60 Z"
            fill="#f0f4ff"
          />
        </svg>

        {/* ── CONTENT ── */}
        <div
          style={{
            padding: '0 1.5rem 2rem',
            marginTop: '-1.5rem',
            maxWidth: 860,
            margin: '0 auto',
          }}
        >
          {/* Incomplete alert */}
          {isProfileIncomplete && (
            <div
              className="ps-prog-card"
              style={{
                marginBottom: '1rem',
                background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
                border: '1.5px solid #fde68a',
                borderRadius: 20,
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: '#fef3c7',
                  border: '1.5px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 20,
                }}
              >
                ⚠️
              </div>
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    color: '#92400e',
                    fontSize: '0.875rem',
                  }}
                >
                  Missing Information
                </p>
                <p
                  style={{ color: '#b45309', fontSize: '0.8rem', marginTop: 2 }}
                >
                  {[
                    !user?.gender && 'Gender',
                    !user?.dateOfBirth && 'Date of Birth',
                  ]
                    .filter(Boolean)
                    .join(' · ')}{' '}
                  — fill in the form below
                </p>
              </div>
            </div>
          )}

          {/* ── STATS ── */}
          <div
            className="ps-stats-row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: '0.875rem',
              marginBottom: '1rem',
            }}
          >
            {[
              {
                label: 'Role',
                value: user?.role || 'Patient',
                icon: '👤',
                bg: '#eff6ff',
                iconBg: '#dbeafe',
                color: '#1d4ed8',
              },
              {
                label: 'Account',
                value: user?.isVerified ? 'Verified' : 'Unverified',
                icon: '✓',
                bg: '#f0fdf4',
                iconBg: '#dcfce7',
                color: '#16a34a',
              },
              {
                label: 'Gender',
                value: user?.gender
                  ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                  : 'Not Set',
                icon: '⚕',
                bg: '#f5f3ff',
                iconBg: '#ede9fe',
                color: '#7c3aed',
              },
            ].map(({ label, value, icon, bg, iconBg, color }) => (
              <div
                key={label}
                style={{
                  background: 'white',
                  borderRadius: 18,
                  padding: '1rem',
                  boxShadow: '0 2px 14px rgba(37,99,235,0.07)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: iconBg,
                    margin: '0 auto 0.625rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}
                >
                  {icon}
                </div>
                <p
                  style={{
                    fontSize: '0.72rem',
                    color: '#64748b',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color,
                    marginTop: 3,
                    textTransform: 'capitalize',
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── PROFILE PHOTO ── */}
          <div
            className="ps-photo-card"
            style={{
              background: 'white',
              borderRadius: 24,
              padding: '1.75rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 24px rgba(37,99,235,0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                className="ps-section-icon"
                style={{
                  background: 'linear-gradient(135deg,#dbeafe,#e0e7ff)',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <div>
                <h2
                  style={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: '#0f172a',
                  }}
                >
                  Profile Photo
                </h2>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#64748b',
                    marginTop: 1,
                  }}
                >
                  Upload a clear headshot for your profile
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
              }}
            >
              {/* Current photo */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={user?.profilePicture}
                  alt=""
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #e0e7ff',
                    background: '#c7d2fe',
                    display: 'block',
                  }}
                />
                {selectedFile && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      background: 'rgba(37,99,235,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 24 }}>📷</span>
                  </div>
                )}
              </div>

              {/* Upload zone */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div
                  className="ps-upload-zone"
                  style={{
                    borderColor: dragOver ? '#2563eb' : undefined,
                    background: dragOver ? '#eff6ff' : undefined,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    style={{ margin: '0 auto 0.5rem', display: 'block' }}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p
                    style={{
                      fontWeight: 700,
                      color: '#2563eb',
                      fontSize: '0.85rem',
                    }}
                  >
                    {selectedFile
                      ? selectedFile.name
                      : 'Click or drag to upload'}
                  </p>
                  <p
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      marginTop: 3,
                    }}
                  >
                    PNG, JPG up to 5MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    className="ps-btn-primary"
                    onClick={handlePhotoUpload}
                    disabled={photoLoading}
                    style={{ flex: 1 }}
                  >
                    {photoLoading ? (
                      <>
                        <span className="ps-spinner" /> Uploading…
                      </>
                    ) : (
                      <>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Photo
                      </>
                    )}
                  </button>
                  {selectedFile && (
                    <button
                      className="ps-btn-upload"
                      onClick={() => setSelectedFile(null)}
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── PERSONAL INFO FORM ── */}
          <div
            className="ps-form-card"
            style={{
              background: 'white',
              borderRadius: 24,
              padding: '1.75rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 24px rgba(37,99,235,0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                className="ps-section-icon"
                style={{
                  background: 'linear-gradient(135deg,#dcfce7,#d1fae5)',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h2
                  style={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: '#0f172a',
                  }}
                >
                  Personal Information
                </h2>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#64748b',
                    marginTop: 1,
                  }}
                >
                  Update your profile details below
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
                  gap: '1rem',
                }}
              >
                {/* Locked fields */}
                {[
                  { label: 'Email Address', value: user?.email, icon: '✉' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="ps-field">
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#475569',
                        marginBottom: 6,
                      }}
                    >
                      {icon} {label}
                    </label>
                    <input value={value || ''} disabled readOnly />
                  </div>
                ))}
                <div className="ps-field">
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#475569',
                      marginBottom: 6,
                    }}
                  >
                    👤 Full Name
                  </label>
                  <input
                    type="tel"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={'Add your Full Name'}
                  />
                </div>

                <div className="ps-field">
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#475569',
                      marginBottom: 6,
                    }}
                  >
                    📞 phone
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder={
                      user?.phoneNumber?.startsWith('google_')
                        ? 'Add your phone number'
                        : 'Enter phone number'
                    }
                  />
                </div>

                <div className="ps-field">
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#475569',
                      marginBottom: 6,
                    }}
                  >
                    ⚕ Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required={isProfileIncomplete && !user?.gender}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date of birth */}
                <div className="ps-field">
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#475569',
                      marginBottom: 6,
                    }}
                  >
                    📅 Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Divider */}
              <div
                style={{ height: 1, background: '#f1f5f9', margin: '1.5rem 0' }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Name and email can only be changed by support.
                </p>
                <button
                  type="submit"
                  className="ps-btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="ps-spinner" /> Saving…
                    </>
                  ) : (
                    <>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── SECURITY ── */}
          <div
            className="ps-security-card"
            style={{
              background: 'white',
              borderRadius: 24,
              padding: '1.75rem',
              boxShadow: '0 4px 24px rgba(37,99,235,0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                className="ps-section-icon"
                style={{
                  background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h2
                  style={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: '#0f172a',
                  }}
                >
                  Security
                </h2>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#64748b',
                    marginTop: 1,
                  }}
                >
                  Keep your account safe
                </p>
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)',
                borderRadius: 16,
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                border: '1.5px solid #e2e8f0',
              }}
            >
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    color: '#1e293b',
                    fontSize: '0.9rem',
                  }}
                >
                  Password
                </p>
                <p
                  style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 3 }}
                >
                  Update your password regularly for better security.
                </p>
              </div>
              <Link
                to={ROUTES.CHANGE_PASSWORD}
                className="ps-btn-dark"
                style={{ textDecoration: 'none' }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Change Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientSettingsPage;
