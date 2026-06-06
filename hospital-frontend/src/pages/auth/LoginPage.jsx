import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { login } from '../../api/auth.api.js';
import useAuthStore from '../../store/auth.store.js';
import ROUTES from '../../constants/routes.js';

import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../../api/auth.api';

const benefits = [
  {
    title: 'Verified specialists',
    description: 'Connect with trusted doctors across departments.',
  },
  {
    title: 'Quick appointments',
    description: 'Book, reschedule, and track visits without phone calls.',
  },
  {
    title: 'Private records',
    description: 'Your health information stays protected and easy to access.',
  },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { fetchCurrentUser } = useAuthStore();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(formData);
      await fetchCurrentUser();
      const { user: currentUser, doctorProfile } = useAuthStore.getState();
      toast.success('Login successful');

      if (currentUser?.role === 'patient') {
        navigate(ROUTES.PATIENT_DASHBOARD);
      } else if (currentUser?.role === 'doctor') {
        if (doctorProfile?.approvalStatus === 'approved') {
          navigate(ROUTES.DOCTOR_DASHBOARD);
        } else {
          toast.error(
            'Please complete your doctor profile to access the dashboard',
          );
          navigate(ROUTES.CREATE_PROFILE);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Fixed Google Login Handler ───────────────────────────────────────────
  // Previously, checking `doctorProfile === null` first caused ALL doctors
  // (even approved ones) to get redirected to CREATE_PROFILE. Now we check
  // role first, then approval status — same pattern as handleSubmit.
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      await googleLogin({ credential: credentialResponse.credential });
      await fetchCurrentUser();
      const { user: currentUser, doctorProfile } = useAuthStore.getState();

      toast.success('Login successful');

      if (currentUser?.role === 'patient') {
        navigate(ROUTES.PATIENT_DASHBOARD);
      } else if (currentUser?.role === 'doctor') {
        if (doctorProfile?.approvalStatus === 'approved') {
          navigate(ROUTES.DOCTOR_DASHBOARD);
        } else {
          toast.error(
            'Please complete your doctor profile to access the dashboard',
          );
          navigate(ROUTES.CREATE_PROFILE);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[minmax(420px,0.95fr)_1.05fr]">
        {/* ── LEFT PANEL ── */}
        <section className="relative hidden overflow-hidden bg-[#073b7a] px-10 py-10 text-white lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(59,180,180,0.38),transparent_30%),radial-gradient(circle_at_80%_72%,rgba(255,255,255,0.18),transparent_28%)]" />
          <div className="absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute bottom-14 right-12 h-32 w-32 rounded-full border border-white/10" />

          <div className="relative z-10 flex h-full w-full flex-col">
            <Link
              to={ROUTES.HOME || '/'}
              className="flex w-fit items-center gap-3"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 shadow-lg shadow-black/10 ring-1 ring-white/20">
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                </svg>
              </span>
              <span className="text-xl font-bold tracking-wide">MedCare</span>
            </Link>

            <div className="flex flex-1 flex-col justify-center">
              <div className="mb-8 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-cyan-50 shadow-lg shadow-black/10 backdrop-blur">
                Secure healthcare portal
              </div>

              <h1 className="max-w-md text-5xl font-bold leading-[1.05] tracking-tight">
                Care that stays close, even online.
              </h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-blue-100">
                Manage appointments, consultations, and health records from a
                calm, protected workspace built for patients and doctors.
              </p>

              <div className="mt-10 grid gap-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="flex gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg shadow-black/10 backdrop-blur"
                  >
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-[#073b7a]">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        {benefit.title}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-blue-100">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-blue-100/70">
              Copyright 2026 MedCare. All rights reserved.
            </p>
          </div>
        </section>

        {/* ── RIGHT PANEL ── */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-14 xl:px-20">
          <div className="w-full max-w-[560px]">
            {/* card */}
            <div className="mx-auto flex w-full min-h-[600px] max-w-lg flex-col items-center justify-center rounded-2xl bg-white px-10 py-16">
              <div className="w-full max-w-sm">
                {/* heading */}
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1560bd]">
                    Welcome back
                  </p>
                  <h1 className="mt-3 text-3xl font-bold leading-tight text-black">
                    Sign in to your account
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link
                      to={ROUTES.SIGNUP}
                      className="font-semibold text-black hover:underline"
                    >
                      Create a free account
                    </Link>
                  </p>
                </div>

                {/* form */}
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-10 flex flex-col gap-6"
                >
                  {/* identifier */}
                  <div>
                    <label
                      htmlFor="identifier"
                      className="text-sm font-semibold text-gray-900"
                    >
                      Email or phone number
                    </label>

                    <div className="mt-2">
                      <input
                        id="identifier"
                        type="text"
                        name="identifier"
                        placeholder="you@email.com or 9876543210"
                        value={formData.identifier}
                        onChange={handleChange}
                        required
                        autoComplete="username"
                        className="h-12 w-full rounded-xl border border-gray-300 bg-transparent px-3 text-sm text-slate-950 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* password */}
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <label
                        htmlFor="password"
                        className="text-sm font-semibold text-gray-900"
                      >
                        Password
                      </label>

                      <Link
                        to={ROUTES.FORGOT_PASSWORD}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative mt-2">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        className="h-12 w-full rounded-xl border border-gray-300 bg-transparent px-3 pr-12 text-sm text-slate-950 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-gray-100 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M3 3l18 18"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* submit + google */}
                  <div className="mt-3 flex flex-col gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        'Sign in'
                      )}
                    </button>

                    {/* ── Google Login — available to everyone on login ── */}
                    <div className="flex flex-col items-center gap-2">
                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => toast.error('Google login failed')}
                      />
                      <p className="text-xs text-gray-400">
                        Patients &amp; doctors can sign in with Google
                      </p>
                    </div>
                  </div>
                </form>

                {/* trust strip */}
                <div className="mt-8 rounded-md bg-slate-50 px-4 py-3 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium leading-5 text-slate-500">
                    <svg
                      className="h-4 w-4 text-emerald-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V8H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 7V5.5a3 3 0 10-6 0V8h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Encrypted access for patients and doctors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
