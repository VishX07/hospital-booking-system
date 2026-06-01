import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/auth.store.js';

import { updateProfile, updateProfilePhoto } from '../../api/auth.api.js';

import ROUTES from '../../constants/routes.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

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

  const [formData, setFormData] = useState({
    gender: '',
    dateOfBirth: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth?.split('T')[0] || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await updateProfile({
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      });

      await fetchCurrentUser();

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      toast.error('Select a photo first');
      return;
    }

    try {
      setPhotoLoading(true);

      const photoData = new FormData();

      photoData.append('profilePicture', selectedFile);

      await updateProfilePhoto(photoData);

      await fetchCurrentUser();

      toast.success('Profile photo updated');

      setSelectedFile(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Hero */}

        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <img
              src={user?.profilePicture}
              alt={user?.fullName}
              className="h-28 w-28 rounded-full border-4 border-white object-cover"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{user?.fullName}</h1>

                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  Patient
                </span>

                {user?.isVerified && (
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold">
                    Verified
                  </span>
                )}
                {isProfileIncomplete ? (
                  <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                    Profile Incomplete
                  </span>
                ) : (
                  <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                    Profile Complete
                  </span>
                )}
              </div>

              <p className="mt-3 text-blue-100">{user?.email}</p>

              <p className="text-blue-100">{user?.phoneNumber}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Profile Completion</h2>

              <p className="text-sm text-slate-500">
                Complete your profile for better healthcare services
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {profileCompletion}%
              </p>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${profileCompletion}%`,
              }}
            />
          </div>

          {isProfileIncomplete && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-800">
                Missing Information
              </h3>

              <ul className="mt-2 list-inside list-disc text-sm text-amber-700">
                {!user?.gender && <li>Gender</li>}

                {!user?.dateOfBirth && <li>Date of Birth</li>}
              </ul>
            </div>
          )}
        </div>

        {/* Stats */}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Role</p>

            <h3 className="mt-2 text-lg font-bold capitalize">{user?.role}</h3>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Account Status</p>

            <h3 className="mt-2 text-lg font-bold text-green-600">
              {user?.isVerified ? 'Verified' : 'Unverified'}
            </h3>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Gender</p>

            <h3 className="mt-2 text-lg font-bold capitalize">
              {user?.gender || 'Not Set'}
            </h3>
          </div>
        </div>

        {/* Profile Photo */}

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold">Profile Photo</h2>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <img
              src={user?.profilePicture}
              alt=""
              className="h-24 w-24 rounded-full object-cover"
            />

            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

              <button
                onClick={handlePhotoUpload}
                disabled={photoLoading}
                className="rounded-xl bg-blue-600 px-5 py-2 text-white"
              >
                {photoLoading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Form */}

        <form
          onSubmit={handleUpdateProfile}
          className="rounded-3xl border bg-white p-6 shadow-sm"
        >
          <h2 className="mb-6 text-xl font-bold">Personal Information</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <input
                value={user?.fullName || ''}
                disabled
                className="w-full rounded-xl border bg-slate-100 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>

              <input
                value={user?.email || ''}
                disabled
                className="w-full rounded-xl border bg-slate-100 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone Number
              </label>

              <input
                value={user?.phoneNumber || ''}
                disabled
                className="w-full rounded-xl border bg-slate-100 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-xl border p-3"
              >
                <option value="">Select Gender</option>

                <option value="male">Male</option>

                <option value="female">Female</option>

                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Date Of Birth
              </label>

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full rounded-xl border p-3"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-white"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Security */}

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-bold">Security</h2>

          <p className="mb-5 text-slate-500">
            Update your account password regularly for better security.
          </p>

          <Link
            to={ROUTES.CHANGE_PASSWORD}
            className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-white"
          >
            Change Password
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientSettingsPage;
