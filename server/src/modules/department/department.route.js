import { Router } from 'express';
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  restoreDepartment,
  updateDepartment,
} from './department.controller.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from './department.validation.js';
import validate from '../../middleware/validate.middleware.js';
import protect from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/role.middleware.js';
import ROLES from '../../constants/roles.js';
import { get } from 'mongoose';

const router = Router();

router.post(
  '/',
  validate(createDepartmentSchema),
  protect,
  authorize(ROLES.ADMIN),
  createDepartment,
);
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.patch(
  '/:id',
  validate(updateDepartmentSchema),
  protect,
  authorize(ROLES.ADMIN),
  updateDepartment,
);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteDepartment);
router.patch(
  '/:id/restore',
  protect,
  authorize(ROLES.ADMIN),
  restoreDepartment,
);
export default router;
