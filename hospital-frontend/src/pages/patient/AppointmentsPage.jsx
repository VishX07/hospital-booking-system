import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import {
  getMyAppointments,
  cancelAppointment,
} from '../../api/appointment.api.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all',
  );
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const [cancelReason, setCancelReason] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const response = await getMyAppointments();

      setAppointments(response.data.appointments || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to load appointments',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const status = searchParams.get('status');

    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);
  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'all') return appointments;

    return appointments.filter(
      (appointment) => appointment.status === statusFilter,
    );
  }, [appointments, statusFilter]);

  const openCancelModal = (id) => {
    setSelectedAppointmentId(id);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please enter cancel reason');
      return;
    }

    try {
      await cancelAppointment(selectedAppointmentId, {
        cancelReason,
      });

      toast.success('Appointment cancelled');

      setCancelModalOpen(false);

      fetchAppointments();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to cancel appointment',
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';

      case 'confirmed':
        return 'bg-green-100 text-green-700';

      case 'completed':
        return 'bg-blue-100 text-blue-700';

      case 'cancelled':
        return 'bg-red-100 text-red-700';

      case 'rejected':
        return 'bg-gray-200 text-gray-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-200 bg-yellow-50/40';

      case 'confirmed':
        return 'border-green-200 bg-green-50/40';

      case 'completed':
        return 'border-blue-200 bg-blue-50/40';

      case 'cancelled':
        return 'border-red-200 bg-red-50/40';

      case 'rejected':
        return 'border-gray-200 bg-gray-50/60';

      default:
        return 'border-slate-200 bg-white';
    }
  };

  const filters = [
    'all',
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'rejected',
    'upcoming',
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f5f8fb] p-6">
        <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-sm font-semibold text-slate-600">
              Loading appointments...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f5f8fb] p-4 text-slate-900 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-6 py-7 shadow-sm sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-3 w-fit rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
                  Appointments
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  My Appointments
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Track upcoming visits, review consultation details, and manage
                  appointment requests from one place.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <div className="rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {appointments.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Showing
                  </p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {filteredAppointments.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {filters.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-bold capitalize transition ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                      : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </section>

          {/* Empty State */}
          {filteredAppointments.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z"
                  />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-slate-950">
                No appointments found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You do not have any appointments for this status yet. Find a
                doctor and book your next consultation.
              </p>

              <Link
                to="/doctors"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-700"
              >
                Find Doctors
              </Link>
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className={`rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(37,99,235,0.12)] ${getStatusBorder(
                    appointment.status,
                  )}`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <img
                        src={appointment?.doctorId?.userId?.profilePicture}
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-2xl bg-slate-100 object-cover ring-1 ring-slate-200"
                      />

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-slate-950">
                          Dr. {appointment?.doctorId?.userId?.fullName}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-blue-700">
                          {appointment?.doctorId?.department?.name}
                        </p>

                        <span
                          className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusColor(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/80 px-4 py-3 text-left shadow-sm ring-1 ring-slate-200 sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Fee
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-950">
                        ₹{appointment.amount}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Date
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {new Date(
                          appointment.appointmentDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Time
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {appointment.timeSlot}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Type
                      </p>
                      <p className="mt-1 text-sm font-bold capitalize text-slate-900">
                        {appointment.consultationType}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/patient/appointments/${appointment._id}`}
                      className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-blue-600 bg-white px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                    >
                      View Details
                    </Link>

                    {(appointment.status === 'pending' ||
                      appointment.status === 'confirmed') && (
                      <button
                        onClick={() => openCancelModal(appointment._id)}
                        className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-red-600 px-4 text-sm font-bold text-white shadow-lg shadow-red-900/10 transition hover:bg-red-700"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Cancel Modal */}
          {cancelModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
              <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
                <div className="bg-red-50 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM10.29 3.86L1.82 18a1.875 1.875 0 001.61 2.85h17.14A1.875 1.875 0 0022.18 18L13.71 3.86a1.875 1.875 0 00-3.42 0z"
                        />
                      </svg>
                    </span>

                    <div>
                      <h2 className="text-lg font-bold text-slate-950">
                        Cancel Appointment
                      </h2>
                      <p className="text-sm text-slate-600">
                        Please tell us why you want to cancel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <label className="mb-2 block text-sm font-bold text-slate-900">
                    Cancellation reason
                  </label>

                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter reason..."
                    rows="4"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                  />

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      onClick={() => setCancelModalOpen(false)}
                      className="flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Close
                    </button>

                    <button
                      onClick={handleCancelAppointment}
                      className="flex h-11 items-center justify-center rounded-2xl bg-red-600 px-5 text-sm font-bold text-white shadow-lg shadow-red-900/10 transition hover:bg-red-700"
                    >
                      Confirm Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentsPage;
