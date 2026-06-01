import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

import {
  getMyPrescriptions,
  downloadPrescription,
} from '../../api/prescription.api.js';

const PatientPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const fetchPrescriptions = async () => {
    try {
      const response = await getMyPrescriptions();

      setPrescriptions(response.data.prescriptions || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to load prescriptions',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleDownload = async (prescriptionId) => {
    try {
      const response = await downloadPrescription(prescriptionId);

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement('a');

      link.href = url;

      link.setAttribute('download', `prescription-${prescriptionId}.pdf`);

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download prescription');
    }
  };

  const filtered = prescriptions.filter((prescription) => {
    const doctor = prescription?.doctorId?.userId?.fullName || '';

    const diagnosis = prescription?.diagnosis || '';

    const q = search.toLowerCase();

    return (
      doctor.toLowerCase().includes(q) || diagnosis.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}

          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-bold">My Prescriptions</h1>

            <p className="mt-2 text-blue-100">
              View and download all your prescriptions.
            </p>
          </div>

          {/* Search */}

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <input
              type="text"
              placeholder="Search by doctor or diagnosis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          {/* Loading */}

          {loading && (
            <div className="text-center">Loading prescriptions...</div>
          )}

          {/* Empty */}

          {!loading && filtered.length === 0 && (
            <div className="rounded-3xl border bg-white p-12 text-center">
              <h3 className="text-xl font-bold">No Prescriptions Found</h3>

              <p className="mt-2 text-slate-500">
                You don't have any prescriptions yet.
              </p>

              <Link
                to="/doctors"
                className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-white"
              >
                Find Doctors
              </Link>
            </div>
          )}

          {/* Cards */}

          {!loading && (
            <div className="grid gap-6 lg:grid-cols-2">
              {filtered.map((prescription) => (
                <div
                  key={prescription._id}
                  className="rounded-3xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={prescription?.doctorId?.userId?.profilePicture}
                      alt=""
                      className="h-16 w-16 rounded-full object-cover"
                    />

                    <div>
                      <h3 className="font-bold">
                        Dr. {prescription?.doctorId?.userId?.fullName}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {prescription?.doctorId?.department?.name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <p>
                      <strong>Diagnosis:</strong> {prescription.diagnosis}
                    </p>

                    <p>
                      <strong>Medicines:</strong>{' '}
                      {prescription.medicines.length}
                    </p>

                    <p>
                      <strong>Appointment:</strong>{' '}
                      {new Date(
                        prescription.appointmentId.appointmentDate,
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>Follow Up:</strong>{' '}
                      {new Date(prescription.followUpDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Link
                      to={`/patient/prescriptions/${prescription.appointmentId._id}`}
                      className="flex-1 rounded-xl border px-4 py-2 text-center"
                    >
                      View
                    </Link>

                    <button
                      onClick={() => handleDownload(prescription._id)}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-white"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientPrescriptionsPage;
