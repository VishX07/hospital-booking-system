import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { forgotPassword, updatePassword } from '../../api/auth.api.js';
import ROUTES from '../../constants/routes.js';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const sendOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await forgotPassword({
        email: formData.email,
      });

      toast.success('OTP sent');
      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setLoading(true);

      await updatePassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      toast.success('Password updated');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Password reset failed');
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
                Account recovery
              </p>
              <h1 className="max-w-md text-5xl font-bold leading-tight">
                Reset your password securely.
              </h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-blue-100">
                We will send a one-time code to your registered email so you can
                safely create a new password.
              </p>
            </div>

            <div className="mt-14 grid gap-3 text-sm text-blue-100">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                OTP-based reset keeps your account protected.
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                You can sign in immediately after updating your password.
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
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-[#1560bd]">
                  {step === 1 ? 'Forgot password' : 'Reset password'}
                </p>
                <h1 className="mt-3 text-3xl font-bold leading-tight text-black">
                  {step === 1 ? 'Recover your account' : 'Create new password'}
                </h1>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {step === 1
                    ? 'Enter your registered email and we will send an OTP.'
                    : 'Enter the OTP and choose a new secure password.'}
                </p>
              </div>

              <form
                onSubmit={step === 1 ? sendOtp : resetPassword}
                className="mt-10 space-y-5"
              >
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
                    disabled={step === 2}
                    className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-transparent pl-3 pr-4 text-sm text-slate-950 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                {step === 2 && (
                  <>
                    <div>
                      <label
                        htmlFor="otp"
                        className="text-sm font-semibold text-gray-900"
                      >
                        OTP
                      </label>
                      <input
                        id="otp"
                        type="text"
                        name="otp"
                        placeholder="Enter OTP"
                        value={formData.otp}
                        onChange={handleChange}
                        className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-transparent pl-8 pr-4 text-sm text-slate-950 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newPassword"
                        className="text-sm font-semibold text-gray-900"
                      >
                        New password
                      </label>
                      <div className="relative mt-2">
                        <input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          placeholder="New password"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="h-12 w-full rounded-xl border border-gray-300 bg-transparent pl-3 pr-14 text-sm text-slate-950 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword((current) => !current)
                          }
                          aria-label={
                            showNewPassword ? 'Hide password' : 'Show password'
                          }
                          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-gray-100 hover:text-slate-700"
                        >
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
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-semibold text-gray-900"
                      >
                        Confirm password
                      </label>
                      <div className="relative mt-2">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="h-12 w-full rounded-xl border border-gray-300 bg-transparent pl-8 pr-14 text-sm text-slate-950 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((current) => !current)
                          }
                          aria-label={
                            showConfirmPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-gray-100 hover:text-slate-700"
                        >
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
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? 'Please wait...'
                      : step === 1
                        ? 'Send OTP'
                        : 'Reset Password'}
                  </button>

                  <Link
                    to={ROUTES.LOGIN}
                    className="flex h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Back to sign in
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
