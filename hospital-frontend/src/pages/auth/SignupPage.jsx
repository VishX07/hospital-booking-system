import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { signup } from '../../api/auth.api.js';
import ROUTES from '../../constants/routes.js';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../../api/auth.api';
import useAuthStore from '../../store/auth.store.js';
const SignupPage = () => {
  const navigate = useNavigate();
  const { fetchCurrentUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'patient',
  });

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
      await signup(formData);

      toast.success('OTP sent successfully');

      navigate(ROUTES.VERIFY_OTP, {
        state: {
          email: formData.email,
          password: formData.password,
        },
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Signup failed');
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

  const isDoctor = formData.role === 'doctor';

  return (
    <main className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#073b7a] px-12 py-12 text-white lg:flex lg:items-center lg:justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(59,180,180,0.35),transparent_30%),radial-gradient(circle_at_82%_72%,rgba(255,255,255,0.15),transparent_28%)]" />
          <div className="relative z-10 w-full max-w-[520px]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
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
            </div>

            <div className="mt-16">
              <p className="mb-4 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100">
                Start your healthcare journey
              </p>
              <h1 className="max-w-md text-5xl font-bold leading-tight">
                Create one account for every care need.
              </h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-blue-100">
                Book visits, manage health records, and stay connected with
                doctors through a secure MedCare profile.
              </p>
            </div>

            <div className="mt-14 grid gap-3 text-sm text-blue-100">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                Verified doctors and patient-first support.
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                Secure OTP verification after signup.
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-6 sm:px-8 lg:px-14 xl:px-20">
          <div className="flex w-full max-w-[620px] items-center rounded-3xl bg-white px-10 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 sm:px-14 sm:py-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1560bd]">
                  Create account
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-black">
                  Sign up for MedCare
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to={ROUTES.LOGIN}
                    className="font-semibold text-black hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="text-sm font-semibold text-gray-900"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-transparent pl-3 pr-4 text-sm text-slate-950 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-900"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-transparent pl-3 pr-4 text-sm text-slate-950 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="text-sm font-semibold text-gray-900"
                  >
                    Phone number
                  </label>
                  <input
                    id="phoneNumber"
                    type="text"
                    name="phoneNumber"
                    placeholder="9876543210"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-transparent pl-3 pr-4 text-sm text-slate-950 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-900"
                  >
                    Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      className="h-12 w-full rounded-xl border border-gray-300 bg-transparent pl-3 pr-4 text-sm text-slate-950 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
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
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3l18 18M10.477 10.477A3 3 0 0013.523 13.5M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228A10.523 10.523 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          aria-hidden="true"
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

                <div>
                  <label
                    htmlFor="role"
                    className="text-sm font-semibold text-gray-900"
                  >
                    I am signing up as
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white pl-3 pr-4 text-sm text-slate-950 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Creating...' : 'Create account'}
                  </button>

                  {/* ── Google signup — patients only ── */}
                  {isDoctor ? (
                    // Greyed-out hint when doctor role is selected
                    <div className="flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400 select-none">
                      <svg
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="mr-2 h-4 w-4 text-gray-300"
                        aria-hidden="true"
                      >
                        <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 01-5.279-5.28 5.27 5.27 0 015.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 00-8.934 8.934 8.907 8.907 0 008.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
                      </svg>
                      Google sign-up is not available for doctors
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => toast.error('Google login failed')}
                      />
                      <p className="text-xs text-gray-400">
                        Patients &amp; doctors can sign in with Google
                      </p>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SignupPage;
