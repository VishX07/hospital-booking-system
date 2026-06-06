import Doctor from '../../models/Doctor.model.js';
import User from '../../models/User.model.js';
import Department from '../../models/Department.model.js';
import ApiError from '../../utils/ApiError.js';
import uploadToCloudinary from '../../utils/uploadToCloudinary.js';
import { createNotification } from '../notification/notification.service.js';
import Appointment from '../../models/Appointment.model.js';
export const createDoctorProfileService = async (userId, doctorData, file) => {
  // 1. Check user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // 2. Check role
  if (user.role !== 'doctor') {
    throw new ApiError(403, 'Only doctors can create a doctor profile');
  }

  // 3. Check if doctor profile already exists
  const existingProfile = await Doctor.findOne({ userId });
  if (existingProfile) {
    throw new ApiError(409, 'Doctor profile already exists');
  }

  // 4. Check department exists
  const department = await Department.findById(doctorData.department);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  // 5. License document required
  if (!file) {
    throw new ApiError(400, 'Medical license is required');
  }

  // 6. Upload to cloudinary
  const uploadedFile = await uploadToCloudinary(file.buffer, 'doctor-licenses');

  // 5. Create doctor profile
  const doctorProfile = await Doctor.create({
    ...doctorData,
    userId,

    licenseDocument: uploadedFile.secure_url,
  });

  // 6. Return response
  return {
    message: 'Doctor profile created successfully. Waiting for admin approval.',
    doctorProfile,
  };
};

export const updateDoctorApprovalService = async (
  doctorId,
  approvalStatus,
  rejectionReason,
) => {
  // 1. Find doctor
  const doctor = await Doctor.findById(doctorId);

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  // 3. Update status
  doctor.approvalStatus = approvalStatus;

  if (approvalStatus === 'rejected') {
    doctor.rejectionReason = rejectionReason;
  } else {
    doctor.rejectionReason = '';
  }
  await doctor.save();

  // 3. Create notification
  if (approvalStatus === 'approved') {
    await createNotification({
      userId: doctor.userId,

      title: 'Doctor Profile Approved',

      message: 'Your doctor profile has been approved.',

      type: 'approval',
    });
  }
  if (approvalStatus === 'rejected') {
    await createNotification({
      userId: doctor.userId,

      title: 'Doctor Profile Rejected',

      message: `Your profile was rejected.

   Reason:
   ${rejectionReason}`,

      type: 'approval',
    });
  }
  // 4. Return response
  return {
    message: `Doctor ${approvalStatus} successfully.`,
    doctor,
  };
};

// export const getAllDoctorsService = async () => {
//   // 1. Find approved
//   // active doctors
//   const doctors = await Doctor.find({
//     approvalStatus: 'approved',
//     isActive: true,
//   })
//     .populate('userId', 'fullName profilePicture phoneNumber email')
//     .populate('department', 'name');

//   // 2. Return response
//   return {
//     doctors,
//   };
// };

// ─── getAllDoctorsService ─────────────────────────────────────────────────────
// Used by GET /doctors
// BUG FIX: was (search = '', department, ...) — positional args.
// Controller passes an object so we destructure it here instead.
export const getAllDoctorsService = async ({
  search = '',
  department,
  consultationMode,
  page = 1,
  limit = 10,
} = {}) => {
  // 1. Base filter
  const filter = {
    approvalStatus: 'approved',
    isActive: true,
  };

  // 2. Consultation mode filter
  if (consultationMode) {
    filter.consultationMode = consultationMode;
  }

  // 3. Explicit department filter (from query param, not from search text)
  if (department) {
    filter.department = department;
  }
  if (department) {
    const departmentDoc = await Department.findOne({
      name: {
        $regex: `^${department}$`,
        $options: 'i',
      },
    });

    if (departmentDoc) {
      filter.department = departmentDoc._id;
    }
  }
  // 4. Search logic — runs when user types anything in the search box
  //    We don't know if it's a doctor name, department, or specialization
  //    so we search all three and $or them together
  if (search?.trim()) {
    const regex = new RegExp(search.trim(), 'i');

    // Find departments whose name matches
    const matchingDepartments = await Department.find({
      name: regex,
      isActive: true,
    }).select('_id');

    const departmentIds = matchingDepartments.map((d) => d._id);

    // Find users (doctors) whose fullName matches
    const matchingUsers = await User.find({
      fullName: regex,
    }).select('_id');

    const userIds = matchingUsers.map((u) => u._id);

    // Build $or conditions — at least specialization is always checked
    const searchConditions = [];

    if (userIds.length > 0) {
      searchConditions.push({ userId: { $in: userIds } });
    }

    if (departmentIds.length > 0) {
      searchConditions.push({ department: { $in: departmentIds } });
    }

    // Always include specialization match
    searchConditions.push({ specialization: regex });

    filter.$and = [{ $or: searchConditions }];
  }

  // 5. Pagination
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // 6. Count + fetch
  const total = await Doctor.countDocuments(filter);

  const doctors = await Doctor.find(filter)
    .populate('userId', 'fullName profilePicture phoneNumber email')
    .populate('department', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  return {
    doctors,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

// ─── getDoctorSuggestionsService ─────────────────────────────────────────────
// Used by GET /doctors/suggestions
// Runs while user is typing — lightweight, parallel queries, no pagination.
// Returns suggestion chips: { type, label, value, meta }
export const getDoctorSuggestionsService = async (query) => {
  const regex = new RegExp(query, 'i');

  // 1. Find matching departments
  const matchingDepartments = await Department.find({
    name: regex,
    isActive: true,
  }).select('_id name');

  const departmentIds = matchingDepartments.map((d) => d._id);

  // 2. Find doctors matching by department OR specialization,
  //    then populate userId to get name + profilePicture
  const matchingDoctors = await Doctor.find({
    approvalStatus: 'approved',
    isActive: true,
    $or: [
      ...(departmentIds.length > 0
        ? [{ department: { $in: departmentIds } }]
        : []),
      { specialization: regex },
    ],
  })
    .populate('userId', 'fullName profilePicture') // ← adjust 'fullName' to your actual field
    .populate('department', 'name')
    .limit(10);

  // 3. Also find doctors by name directly
  //    We query Doctor and populate, then filter by name match
  const matchingByName = await Doctor.find({
    approvalStatus: 'approved',
    isActive: true,
  })
    .populate({
      path: 'userId',
      match: { fullName: regex }, // ← adjust 'fullName' to your actual field
      select: 'fullName profilePicture',
    })
    .populate('department', 'name')
    .limit(10);

  // populate with match returns doc but userId = null if name didn't match — filter those out
  const matchingByNameFiltered = matchingByName.filter(
    (d) => d.userId !== null,
  );

  // 4. Merge both doctor lists, deduplicate by doctor _id
  const allDoctors = [...matchingDoctors, ...matchingByNameFiltered];
  const seenDoctorIds = new Set();
  const uniqueDoctors = allDoctors.filter((d) => {
    const id = d._id.toString();
    if (seenDoctorIds.has(id)) return false;
    seenDoctorIds.add(id);
    return true;
  });

  // 5. Build suggestions
  const suggestions = [];

  // Doctor suggestions
  uniqueDoctors.forEach((doc) => {
    suggestions.push({
      type: 'doctor',
      label: doc.userId?.fullName || 'Unknown', // ← adjust 'fullName'
      value: doc.userId?.fullName || 'Unknown',
      meta: {
        doctorId: doc._id,
        userId: doc.userId?._id,
        profilePicture: doc.userId?.profilePicture,
        department: doc.department?.name,
        specialization: doc.specialization,
      },
    });
  });

  // Department suggestions (separate chips)
  matchingDepartments.forEach((dept) => {
    suggestions.push({
      type: 'department',
      label: dept.name,
      value: dept.name,
      meta: {
        departmentId: dept._id,
      },
    });
  });

  return suggestions;
};

export const getDoctorByIdService = async (doctorId) => {
  // 1. Find doctor
  const doctor = await Doctor.findOne({
    _id: doctorId,
    approvalStatus: 'approved',
    isActive: true,
  })
    .populate('userId', 'fullName profilePicture phoneNumber email')
    .populate('department', 'name description');

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  // 3. Return response
  return {
    doctor,
  };
};

export const updateDoctorProfileService = async (userId, updateData) => {
  // 1. Find doctor
  const doctor = await Doctor.findOne({
    userId,
  });

  // 2. Not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 3. Must be active
  if (!doctor.isActive) {
    throw new ApiError(403, 'Doctor profile is inactive');
  }

  // 4. Allowed fields only
  const allowedFields = [
    'specialization',
    'qualification',
    'experience',
    'bio',
    'consultationMode',
    'consultationFee',
  ];

  const updates = {};

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      updates[key] = updateData[key];
    }
  }

  // 5. Update
  const updatedDoctor = await Doctor.findByIdAndUpdate(
    doctor._id,

    {
      $set: updates,
    },

    {
      new: true,
      runValidators: true,
    },
  )
    .populate('department', 'name')
    .populate(
      'userId',
      `
     fullName
     email
     phoneNumber
     profilePicture
     gender
     dateOfBirth
     `,
    );

  // 6. Return
  return {
    message: 'Doctor profile updated successfully.',

    doctor: updatedDoctor,
  };
};

export const getPendingDoctorsService = async () => {
  // 1. Find pending doctors
  const doctors = await Doctor.find({
    approvalStatus: 'pending',
  })
    .populate('userId', 'fullName email profilePicture phoneNumber')
    .populate('department', 'name');

  // 2. Return response
  return {
    doctors,
  };
};

export const getMyPatientsService = async (userId) => {
  // 1. Find doctor
  const doctor = await Doctor.findOne({ userId });

  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 2. Get all appointments
  const appointments = await Appointment.find({
    doctorId: doctor._id,
  })
    .populate(
      'patientId',
      'fullName email phoneNumber profilePicture gender dateOfBirth',
    )
    .sort({
      createdAt: -1,
    });

  // 3. Remove duplicates
  const patientMap = new Map();

  appointments.forEach((appointment) => {
    const patient = appointment.patientId;

    if (!patient) return;

    const key = patient._id.toString();

    if (!patientMap.has(key)) {
      patientMap.set(key, {
        ...patient.toObject(),
        totalAppointments: 1,
        lastVisit: appointment.appointmentDate,
      });
    } else {
      const existing = patientMap.get(key);

      existing.totalAppointments += 1;

      if (
        new Date(appointment.appointmentDate) > new Date(existing.lastVisit)
      ) {
        existing.lastVisit = appointment.appointmentDate;
      }
    }
  });

  // 4. Return patients
  return {
    patients: Array.from(patientMap.values()),
  };
};

export const getPatientDetailsService = async (userId, patientId) => {
  const doctor = await Doctor.findOne({
    userId,
  });

  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  const patient = await User.findById(patientId).select(
    'fullName email phoneNumber profilePicture gender dateOfBirth',
  );

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const appointments = await Appointment.find({
    doctorId: doctor._id,
    patientId,
  }).sort({
    appointmentDate: -1,
  });

  return {
    patient,
    stats: {
      totalAppointments: appointments.length,
      lastVisit: appointments[0]?.appointmentDate || null,
    },
  };
};
