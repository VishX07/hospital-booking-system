import asyncHandler from '../../utils/asyncHandler.js';
import { getPublicStatsService } from './stats.service.js';

export const getPublicStats = asyncHandler(async (req, res) => {
  const response = await getPublicStatsService();

  res.status(200).json(response);
});
