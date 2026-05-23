//*********ADMIN SERVICES*********//
import Appointment from '../../models/Appointment.model.js';
import Doctor from '../../models/Doctor.model.js';
import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';

//*********ADMIN GET ALL DOCTORS SERVICE*********//
export const getAllDoctorsAdminService = async (filters) => {
  const { status, search, page = 1, limit = 10 } = filters;

  // 1. Base query
  const query = {};

  // 2. Status filter
  if (status) {
    if (status === 'inactive') {
      query.isActive = false;
    } else {
      query.approvalStatus = status;
    }
  }

  // 3. Pagination
  const skip = (page - 1) * limit;

  // 4. Get doctors
  let doctorsQuery = Doctor.find(query)
    .populate(
      'userId',
      'fullName email phoneNumber gender dateOfBirth profilePicture',
    )
    .populate('department', 'name')
    .sort({
      createdAt: -1,
    });

  // 5. Execute query
  let doctors = await doctorsQuery;

  // 6. Search filter
  if (search) {
    doctors = doctors.filter(
      (doctor) =>
        doctor.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.userId?.email?.toLowerCase().includes(search.toLowerCase()),
    );
  }

  // 7. Total count
  const totalRecords = doctors.length;

  // 8. Paginate
  doctors = doctors.slice(skip, skip + Number(limit));

  // 9. Total pages
  const totalPages = Math.ceil(totalRecords / limit);

  // 10. Return response
  return {
    doctors,

    pagination: {
      currentPage: Number(page),

      totalPages,

      totalRecords,

      limit: Number(limit),
    },
  };
};

//*********ADMIN TOGGLE DOCTOR STATUS SERVICE*********//
export const toggleDoctorStatusService = async (doctorId) => {
  // 1. Find doctor
  const doctor = await Doctor.findById(doctorId);

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  // 3. Toggle status
  doctor.isActive = !doctor.isActive;

  await doctor.save();
  //**********create notification for doctor about account status change
  // 4. Create notification
  await createNotification({
    userId: doctor.userId,

    title: doctor.isActive
      ? 'Doctor Profile Enabled'
      : 'Doctor Profile Disabled',

    message: doctor.isActive
      ? 'Your doctor profile has been enabled by admin.'
      : 'Your doctor profile has been disabled by admin.',

    type: 'approval',
  });
  // 4. Return response
  return {
    message: `Doctor ${doctor.isActive ? 'enabled' : 'disabled'} successfully.`,
    doctor,
  };
};

//********ADMIN GET ALL PATIENTS SERVICE********//
export const getAllPatientsAdminService = async (filters) => {
  const { doctorId, department, search, page = 1, limit = 10 } = filters;

  // 1. Base appointment query
  const appointmentQuery = {};

  // 2. Doctor filter
  if (doctorId) {
    appointmentQuery.doctorId = doctorId;
  }

  // 3. Department filter
  if (department) {
    const doctors = await Doctor.find({
      department,
    }).select('_id');

    appointmentQuery.doctorId = {
      $in: doctors.map((doctor) => doctor._id),
    };
  }

  // 4. Get appointments
  const appointments = await Appointment.find(appointmentQuery).populate({
    path: 'doctorId',

    populate: [
      {
        path: 'department',

        select: 'name',
      },

      {
        path: 'userId',

        select: 'fullName profilePicture gender dateOfBirth email phoneNumber',
      },
    ],
  });

  // 5. Unique patient ids
  const patientIds = [
    ...new Set(
      appointments.map((appointment) => appointment.patientId.toString()),
    ),
  ];

  // 6. Patient query
  const patientQuery = {
    _id: {
      $in: patientIds,
    },

    role: 'patient',
  };

  // 7. Search filter
  if (search) {
    patientQuery.$or = [
      {
        fullName: {
          $regex: search,

          $options: 'i',
        },
      },

      {
        email: {
          $regex: search,

          $options: 'i',
        },
      },

      {
        phoneNumber: {
          $regex: search,

          $options: 'i',
        },
      },
    ];
  }

  // 8. Get patients
  const patients = await User.find(patientQuery).sort({
    createdAt: -1,
  });

  // 9. Enrich patient data
  let enrichedPatients = await Promise.all(
    patients.map(async (patient) => {
      const patientAppointments = appointments.filter(
        (appointment) =>
          appointment.patientId.toString() === patient._id.toString(),
      );

      const departments = [
        ...new Set(
          patientAppointments
            .map((appointment) => appointment.doctorId?.department?.name)
            .filter(Boolean),
        ),
      ];

      const uniqueDoctors = [
        ...new Map(
          patientAppointments
            .filter((appointment) => appointment.doctorId)
            .map((appointment) => [
              appointment.doctorId._id.toString(),
              {
                _id: appointment.doctorId._id,

                fullName:
                  appointment.doctorId.userId?.fullName || 'Unknown Doctor',
              },
            ]),
        ).values(),
      ];

      return {
        ...patient.toObject(),

        totalAppointments: patientAppointments.length,

        lastVisit:
          patientAppointments.sort(
            (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate),
          )[0]?.appointmentDate || null,

        departments,

        doctorsVisited: uniqueDoctors.length,

        doctors: uniqueDoctors,
      };
    }),
  );

  // 10. Pagination
  const totalRecords = enrichedPatients.length;

  const totalPages = Math.ceil(totalRecords / limit);

  const skip = (page - 1) * limit;

  enrichedPatients = enrichedPatients.slice(skip, skip + Number(limit));

  // 11. Return response
  return {
    patients: enrichedPatients,

    pagination: {
      currentPage: Number(page),

      totalPages,

      totalRecords,

      limit: Number(limit),
    },
  };
};

//********ADMIN GET ALL APPOINTMENTS SERVICE********//
export const getAllAppointmentsAdminService = async (filters) => {
  const { status, doctorId, department, type, page = 1, limit = 10 } = filters;

  // 1. Base query
  const query = {};

  // 2. Status filter
  if (status) {
    query.status = status;
  }

  // 3. Doctor filter
  if (doctorId) {
    query.doctorId = doctorId;
  }

  // 4. Department filter
  if (department) {
    const doctors = await Doctor.find({
      department,
    }).select('_id');

    query.doctorId = {
      $in: doctors.map((doctor) => doctor._id),
    };
  }

  // 5. Today date
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  // 6. Type filter
  if (type === 'today') {
    const endOfDay = new Date();

    endOfDay.setHours(23, 59, 59, 999);

    query.appointmentDate = {
      $gte: today,

      $lte: endOfDay,
    };
  }

  if (type === 'history') {
    query.appointmentDate = {
      $lt: today,
    };
  }

  if (type === 'upcoming') {
    query.appointmentDate = {
      $gte: today,
    };
  }

  // 7. Pagination
  const skip = (page - 1) * limit;

  // 8. Total count
  const totalRecords = await Appointment.countDocuments(query);

  const totalPages = Math.ceil(totalRecords / limit);

  // 9. Get appointments
  const appointments = await Appointment.find(query)
    .populate(
      'patientId',
      'fullName email phoneNumber profilePicture gender dateOfBirth ',
    )
    .populate({
      path: 'doctorId',

      populate: [
        {
          path: 'userId',

          select:
            'fullName profilePicture email phoneNumber gender dateOfBirth',
        },

        {
          path: 'department',

          select: 'name',
        },
      ],
    })
    .sort({
      appointmentDate: -1,

      timeSlot: 1,
    })
    .skip(skip)
    .limit(Number(limit));

  // 10. Return response
  return {
    appointments,

    pagination: {
      currentPage: Number(page),

      totalPages,

      totalRecords,

      limit: Number(limit),
    },
  };
};
