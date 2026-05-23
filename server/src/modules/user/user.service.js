import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';
import uploadToCloudinary from '../../utils/uploadToCloudinary.js';

export const updateProfilePhotoService = async (userId, file) => {
  // 1. File required
  if (!file) {
    throw new ApiError(400, 'Profile photo is required');
  }

  // 2. Find user
  const user = await User.findById(userId);

  // 3. User not found
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // 4. Upload image
  const uploadedFile = await uploadToCloudinary(file.buffer, 'profile-photos');

  // 5. Update photo
  user.profilePicture = uploadedFile.secure_url;

  await user.save();

  // 6. Return response
  return {
    message: 'Profile photo updated successfully.',
    profilePhoto: user.profilePicture,
  };
};

export const updateProfileService = async (userId, updateData) => {
  const allowedFields = ['fullName', 'phone', 'gender', 'dateOfBirth'];

  const updates = {};

  // Allow only selected fields
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      updates[key] = updateData[key];
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,

    updates,

    {
      new: true,
      runValidators: true,
    },
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return {
    message: 'Profile updated successfully.',

    user,
  };
};
