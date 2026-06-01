import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { verifyOTP, login } from '../../api/auth.api.js';
import useAuthStore from '../../store/auth.store.js';
import ROUTES from '../../constants/routes.js';

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';
  const password = location.state?.password || '';

  const { fetchCurrentUser } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await verifyOTP({
        email,
        otp,
      });

      await login({
        identifier: email,
        password,
      });

      await fetchCurrentUser();

      const user = useAuthStore.getState().user;

      toast.success('Signup successful');

      if (user?.role === 'patient') {
        navigate(ROUTES.PATIENT_DASHBOARD);
      } else if (user?.role === 'doctor') {
        navigate(ROUTES.DOCTOR_DASHBOARD);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

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
                Secure OTP verification
              </p>
              <h1 className="max-w-md text-5xl font-bold leading-tight">
                One final step to protect your account.
              </h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-blue-100">
                Enter the code sent to your email so we can confirm your
                identity and take you safely into MedCare.
              </p>
            </div>

            <div className="mt-14 grid gap-3 text-sm text-blue-100">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                OTP verification keeps new accounts secure.
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                You will be signed in automatically after verification.
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-6 sm:px-8 lg:px-14 xl:px-20">
          <div className="flex w-full max-w-[560px] items-center rounded-3xl bg-white px-10 py-12 shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 sm:px-14 sm:py-14">
            <div className="mx-auto w-full max-w-sm">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/20">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-[#1560bd]">
                  Verify account
                </p>
                <h1 className="mt-3 text-3xl font-bold leading-tight text-black">
                  Enter your OTP
                </h1>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  We sent a one-time code to{' '}
                  <span className="font-semibold text-slate-900">
                    {email || 'your email'}
                  </span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-10 space-y-7">
                <div>
                  <label
                    htmlFor="otp"
                    className="text-sm font-semibold text-gray-900"
                  >
                    One-time passcode
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-3 h-14 w-full rounded-xl border border-gray-300 bg-transparent pl-8 pr-4 text-center text-lg font-semibold tracking-[0.35em] text-slate-950 placeholder:text-center placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>

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
                        aria-hidden="true"
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
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-slate-500">
                Didn&apos;t receive a code?{' '}
                <button
                  type="button"
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Resend OTP
                </button>
              </p>

              <div className="mt-8 rounded-md bg-slate-50 px-4 py-3 text-center">
                <p className="text-xs font-medium text-slate-500">
                  MedCare secure patient portal
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default VerifyOtpPage;
