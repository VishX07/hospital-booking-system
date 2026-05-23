import asyncHandler from '../../utils/asyncHandler.js';
import {
  createDepartmentService,
  deleteDepartmentService,
  getAllDepartmentsService,
  getDepartmentByIdService,
  restoreDepartmentService,
  updateDepartmentService,
} from './department.service.js';

export const createDepartment = asyncHandler(async (req, res) => {
  const response = await createDepartmentService(req.body);

  res.status(201).json({
    success: true,
    message: response.message,
    department: response.department,
  });
});

export const getAllDepartments = asyncHandler(async (req, res) => {
  const response = await getAllDepartmentsService();

  res.status(200).json({
    success: true,
    departments: response.departments,
  });
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  // 1. Get id
  const { id } = req.params;

  // 2. Call service
  const response = await getDepartmentByIdService(id);

  // 3. Return response
  res.status(200).json({
    success: true,
    department: response.department,
  });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  // 1. Get id
  const { id } = req.params;

  // 2. Call service
  const response = await updateDepartmentService(id, req.body);

  // 3. Return response
  res.status(200).json({
    success: true,
    message: response.message,
    department: response.department,
  });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  // 1. Get id
  const { id } = req.params;

  // 2. Call service
  const response = await deleteDepartmentService(id);

  // 3. Return response
  res.status(200).json({
    success: true,
    message: response.message,
  });
});

export const restoreDepartment = asyncHandler(async (req, res) => {
  // 1. Get id
  const { id } = req.params;

  // 2. Call service
  const response = await restoreDepartmentService(id);

  // 3. Return response
  res.status(200).json({
    success: true,
    message: response.message,
  });
});
