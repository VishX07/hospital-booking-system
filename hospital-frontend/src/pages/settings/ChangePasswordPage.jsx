import { useState } from 'react';

import toast from 'react-hot-toast';

import { changePassword, changeNewPassword } from '../../api/auth.api.js';

const ChangePasswordPage = () => {
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const sendOtp = async () => {
    try {
      setLoading(true);

      await changePassword();

      toast.success('OTP sent');

      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setLoading(true);

      await changeNewPassword({
        otp: formData.otp,

        newPassword: formData.newPassword,
      });

      toast.success('Password updated');

      window.location.reload();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-5 text-center text-3xl font-bold">Change Password</h1>

        {step === 1 ? (
          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 text-white"
          >
            Send OTP
          </button>
        ) : (
          <form onSubmit={updatePassword}>
            <input
              type="text"
              name="otp"
              placeholder="OTP"
              value={formData.otp}
              onChange={handleChange}
              className="mb-3 w-full rounded-lg border p-3"
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              className="mb-3 w-full rounded-lg border p-3"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mb-5 w-full rounded-lg border p-3"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 p-3 text-white"
            >
              Change Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordPage;
