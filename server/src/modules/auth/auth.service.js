import User from '../../models/User.model.js';
import OTP from '../../models/OTP.model.js';
import ApiError from '../../utils/ApiError.js';
import generateOTP from '../../utils/generateOTP.js';
import { sendOTPEmail } from '../../services/email.service.js';
import { generateToken } from '../../services/token.service.js';
import bcrypt from 'bcryptjs';

export const signupService = async (userData) => {
  const { fullName, email, phoneNumber, password, role } = userData;

  // 1. Check if email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    if (existingEmail.isVerified) {
      throw new ApiError(409, 'Email is already registered');
    }
    existingEmail.fullName = fullName;
    existingEmail.phoneNumber = phoneNumber;
    existingEmail.password = password;
    existingEmail.role = role;
    await existingEmail.save();
  } else {
    // 2. Check if phone number already exists
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      if (existingPhone.isVerified) {
        throw new ApiError(409, 'Phone number is already registered');
      }
      existingPhone.fullName = fullName;
      existingPhone.email = email;
      existingPhone.password = password;
      existingPhone.role = role;
      await existingPhone.save();
    } else {
      // 3. Create new user
      await User.create({
        fullName,
        email,
        phoneNumber,
        password,
        role,
        isVerified: false,
      });
    }
  }

  // 4. Generate OTP
  const otp = generateOTP();

  // 5. Delete old signup OTP for same email
  await OTP.deleteMany({ email, type: 'signup' });

  // 6. Create new OTP document
  await OTP.create({
    email,
    otp,
    type: 'signup',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // 7. Send OTP email
  await sendOTPEmail(email, otp);

  // 8. Return success message
  return { message: 'OTP sent to your email. Please verify your account.' };
};

export const verifyOTPService = async (email, otp) => {
  // 1. Find OTP document
  const otpDoc = await OTP.findOne({ email, type: 'signup' });

  // 2. OTP not found
  if (!otpDoc) {
    throw new ApiError(404, 'OTP not found. Please request a new one.');
  }

  // 3. Check expiry
  if (new Date() > otpDoc.expiresAt) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  // 4. Verify OTP match
  if (otpDoc.otp !== otp) {
    throw new ApiError(400, 'Invalid OTP. Please try again.');
  }

  // 5. Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // 6. Mark user verified
  user.isVerified = true;
  await user.save();

  // 7. Delete signup OTP
  await OTP.deleteMany({ email, type: 'signup' });

  // 8. Generate JWT token
  const token = generateToken(user);

  // 9. Return response
  return {
    message: 'Email verified successfully.',
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    token,
  };
};

export const loginService = async (identifier, password) => {
  // 1. Find user by email or phoneNumber
  const user = await User.findOne({
    $or: [{ email: identifier }, { phoneNumber: identifier }],
  }).select('+password');

  // 2. User not found
  if (!user) {
    throw new ApiError(
      404,
      'No account found with this email or phone number.',
    );
  }

  // 3. Account not verified
  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your email before logging in.');
  }

  // 4. Google account — cannot login with password
  if (user.loginProvider === 'google') {
    throw new ApiError(400, 'Please login using Google.');
  }

  // 5. Compare password
  const isMatch = await user.comparePassword(password);

  // 6. Wrong password
  if (!isMatch) {
    throw new ApiError(401, 'Incorrect password. Please try again.');
  }

  // 7. Generate JWT token
  const token = generateToken(user);

  // 8. Return response
  return {
    message: 'Login successful.',
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

export const sendPasswordResetOtpService = async (email) => {
  // 1. Find user
  const user = await User.findOne({
    email,
  });

  // 2. User not found
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // 3. Generate OTP
  const otp = generateOTP();

  // 4. Delete old reset OTP
  await OTP.deleteMany({
    email,

    type: 'password_reset',
  });

  // 5. Save OTP
  await OTP.create({
    email,

    otp,

    type: 'password_reset',

    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // 6. Send email
  await sendOTPEmail(email, otp);

  // 7. Return response
  return {
    message: 'Password reset OTP sent successfully.',
  };
};

export const verifyPasswordResetOtpService = async (email, otp) => {
  // 1. Find OTP
  const otpRecord = await OTP.findOne({
    email,

    otp,

    type: 'password_reset',
  });

  // 2. OTP not found
  if (!otpRecord) {
    throw new ApiError(400, 'Invalid OTP');
  }

  // 3. OTP expired
  if (otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, 'OTP expired');
  }

  // 4. Return success
  return {
    message: 'OTP verified successfully.',
  };
};

export const updatePasswordService = async (email, otp, newPassword) => {
  // 1. Find user
  const user = await User.findOne({
    email,
  });

  // 2. User not found
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // 3. Find OTP
  const otpRecord = await OTP.findOne({
    email,

    otp,

    type: 'password_reset',
  });

  // 4. OTP invalid
  if (!otpRecord) {
    throw new ApiError(400, 'Invalid OTP');
  }

  // 5. OTP expired
  if (otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, 'OTP expired');
  }

  // 6. Hash password
  // const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 7. Update password
  user.password = newPassword;

  await user.save();

  // 8. Delete OTP
  await OTP.deleteMany({
    email,

    type: 'password_reset',
  });

  // 9. Return
  return {
    message: 'Password updated successfully.',
  };
};
