import { Router } from 'express';
import protect from '../../middleware/auth.middleware.js';
import upload from '../../middleware/upload.middleware.js';
import { updateProfile, updateProfilePhoto } from './user.controller.js';
import { updateProfileSchema } from './user.validation.js';
import validate from '../../middleware/validate.middleware.js';

const router = Router();

router.patch(
  '/profile-photo',
  protect,
  upload.single('profilePicture'),
  updateProfilePhoto,
);

router.patch(
  '/update-profile',

  protect,

  validate(updateProfileSchema),

  updateProfile,
);

export default router;
