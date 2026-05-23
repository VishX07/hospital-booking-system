import asyncHandler from '../../utils/asyncHandler.js';
import {
  updateProfilePhotoService,
  updateProfileService,
} from './user.service.js';

export const updateProfilePhoto = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Update profile photo
  const response = await updateProfilePhotoService(userId, req.file);

  // 3. Return response
  res.status(200).json({
    success: true,
    message: response.message,
    profilePicture: response.profilePicture,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const response = await updateProfileService(
    req.user._id,

    req.body,
  );

  res.status(200).json(response);
});
