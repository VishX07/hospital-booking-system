import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../services/token.service.js';
import User from '../models/User.model.js';

const protect = asyncHandler(async (req, res, next) => {
  // 1. Read accessToken from cookies
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  // 2. Token missing
  if (!token) {
    throw new ApiError(401, 'Unauthorized access');
  }

  // 3. Verify token
  const decoded = verifyToken(token);

  // 4. Find user
  const user = await User.findById(decoded.userId);

  // 5. User not found
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // 6. Attach user to request
  req.user = user;

  next();
});

export default protect;
