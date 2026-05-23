import Department from '../../models/Department.model.js';
import ApiError from '../../utils/ApiError.js';

export const createDepartmentService = async (departmentData) => {
  const { name, description } = departmentData;

  // 1. Check if department name already exists (case insensitive)
  const existing = await Department.findOne({
    name: { $regex: `^${name}$`, $options: 'i' },
  });
  if (existing) {
    throw new ApiError(409, 'Department with this name already exists');
  }

  // 2. Create department
  const department = await Department.create({ name, description });

  // 3. Return response
  return {
    message: 'Department created successfully.',
    department,
  };
};

export const getAllDepartmentsService = async () => {
  const departments = await Department.find({ isActive: true }).sort({
    name: 1,
  });
  return { departments };
};

export const getDepartmentByIdService = async (id) => {
  // 1. Find department by id
  const department = await Department.findById(id);

  // 2. Department not found
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  // 3. Return response
  return {
    department,
  };
};

export const updateDepartmentService = async (id, updateData) => {
  const { name, description } = updateData;

  // 1. Find department
  const department = await Department.findById(id);

  // 2. Department not found
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  // 3. Check duplicate name
  if (name) {
    const existing = await Department.findOne({
      _id: {
        $ne: id,
      },
      name: {
        $regex: `^${name}$`,
        $options: 'i',
      },
    });

    if (existing) {
      throw new ApiError(409, 'Department with this name already exists');
    }

    department.name = name.trim();
  }

  // 4. Update description
  if (description !== undefined) {
    department.description = description;
  }

  // 5. Save
  await department.save();

  // 6. Return response
  return {
    message: 'Department updated successfully.',
    department,
  };
};

export const deleteDepartmentService = async (id) => {
  // 1. Find department
  const department = await Department.findById(id);

  // 2. Department not found
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  // 3. Already inactive
  if (!department.isActive) {
    throw new ApiError(400, 'Department already deleted');
  }

  // 4. Soft delete
  department.isActive = false;

  await department.save();

  // 5. Return response
  return {
    message: 'Department deleted successfully.',
  };
};

export const restoreDepartmentService = async (id) => {
  // 1. Find department
  const department = await Department.findById(id);

  // 2. Department not found
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  // 3. Already active
  if (department.isActive) {
    throw new ApiError(400, 'Department already restored');
  }

  // 4. Soft delete
  department.isActive = true;

  await department.save();

  // 5. Return response
  return {
    message: 'Department restored successfully.',
  };
};
