import jwt from 'jsonwebtoken';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
};

export const setTokenCookie = (res, token) => {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // sameSite: 'none',
    maxAge: SEVEN_DAYS_MS,
  });
};

export const clearTokenCookie = (res) => {
  res.clearCookie('accessToken');
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
