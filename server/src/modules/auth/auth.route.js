import { Router } from 'express';
import {
  signup,
  login,
  verifyOTP,
  logout,
  getCurrentUser,
  sendPasswordResetOtp,
  updatePassword,
  sendChangePasswordOtp,
  changePassword,
} from './auth.controller.js';
import validate from '../../middleware/validate.middleware.js';
import protect from '../../middleware/auth.middleware.js';
import {
  loginSchema,
  sendPasswordResetOtpSchema,
  signupSchema,
  updatePasswordSchema,
  verifyOTPSchema,
} from './auth.validation.js';
import authorize from '../../middleware/role.middleware.js';
const router = Router();

// *********ROUTES STARTS FROM HERE*********

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/verify-otp', validate(verifyOTPSchema), verifyOTP);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);
router.get('/admin-test', protect, authorize('admin'), (req, res) => {
  res.json({
    message: 'Admin route works',
  });
});

// Password reset and change routes
// forgot password
router.post(
  '/send-password-reset-otp',
  validate(sendPasswordResetOtpSchema),
  sendPasswordResetOtp,
);

router.patch(
  '/update-password',
  validate(updatePasswordSchema),
  updatePassword,
);

// change password
router.post('/send-change-password-otp', protect, sendChangePasswordOtp);

router.patch(
  '/change-password',
  protect,
  validate(updatePasswordSchema),
  changePassword,
);

export default router;
