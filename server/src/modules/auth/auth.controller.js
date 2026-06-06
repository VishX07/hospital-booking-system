import asyncHandler from '../../utils/asyncHandler.js';
import {
  googleLoginService,
  loginService,
  sendPasswordResetOtpService,
  signupService,
  updatePasswordService,
  verifyPasswordResetOtpService,
} from './auth.service.js';
import {
  setTokenCookie,
  clearTokenCookie,
} from '../../services/token.service.js';
import { verifyOTPService } from './auth.service.js';
import Doctor from '../../models/Doctor.model.js';
import User from '../../models/User.model.js';
export const signup = asyncHandler(async (req, res) => {
  const response = await signupService(req.body);

  res.status(201).json({
    success: true,
    message: response.message,
  });
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const response = await verifyOTPService(email, otp);

  setTokenCookie(res, response.token);

  res.status(200).json({
    success: true,
    message: response.message,
    user: response.user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const response = await loginService(identifier, password);

  setTokenCookie(res, response.token);

  res.status(200).json({
    success: true,
    message: response.message,
    user: response.user,
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const {
    _id,
    fullName,
    email,
    phoneNumber,
    role,
    isVerified,
    profilePicture,
    gender,
    dateOfBirth,
  } = req.user;

  let doctorProfile = null;

  // if doctor then fetch doctor profile
  if (role === 'doctor') {
    doctorProfile = await Doctor.findOne({
      userId: _id,
    }).populate('department', 'name');
  }

  res.status(200).json({
    success: true,

    user: {
      _id,
      fullName,
      email,
      phoneNumber,
      role,
      isVerified,
      profilePicture,
      gender,
      dateOfBirth,
    },

    doctorProfile,
  });
});

export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential, role } = req.body;

  const response = await googleLoginService(credential, role);

  setTokenCookie(res, response.token);

  res.status(200).json({
    success: true,
    message: 'Google login successful',
    user: response.user,
  });
});

export const googleLoginWithAccessToken = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;

  // Verify with Google and get user profile
  const googleRes = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!googleRes.ok) {
    throw new ApiError(401, 'Invalid Google access token');
  }

  const profile = await googleRes.json();
  const { sub, email, name, picture } = profile;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      fullName: name,
      email,
      role: 'patient',
      profilePicture: picture,
      googleId: sub,
      loginProvider: 'google',
      isVerified: true,
    });
  } else {
    if (!user.googleId) {
      user.googleId = sub;
      await user.save();
    }
  }

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.status(200).json({
    success: true,
    message: 'Google login successful',
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

export const sendPasswordResetOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const response = await sendPasswordResetOtpService(email);

  res.status(200).json(response);
});
export const sendChangePasswordOtp = asyncHandler(async (req, res) => {
  const email = req.user.email;

  const response = await sendPasswordResetOtpService(email);

  res.status(200).json(response);
});

export const changePassword = asyncHandler(async (req, res) => {
  const email = req.user.email;

  const { otp, newPassword } = req.body;

  const response = await updatePasswordService(email, otp, newPassword);

  res.status(200).json(response);
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const response = await updatePasswordService(email, otp, newPassword);

  res.status(200).json(response);
});
