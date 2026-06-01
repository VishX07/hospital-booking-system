import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPrescriptionsByAppointmentId } from '../../api/appointment.api';
import { downloadPrescription } from '../../api/prescription.api';
import DashboardLayout from '../../components/layout/DashboardLayout';
const PrescriptionDetailsPage = () => {
  const { id } = useParams();

  const [prescription, setPrescription] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchPrescription = async () => {
    try {
      const response = await getPrescriptionsByAppointmentId(id);

      setPrescription(response.data.prescription);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to load prescription',
      );
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = async () => {
    try {
      const response = await downloadPrescription(prescription._id);

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement('a');

      link.href = url;

      link.setAttribute('download', `prescription-${prescription._id}.pdf`);

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download prescription');
    }
  };

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading prescription...</div>;
  }

  if (!prescription) {
    return <div className="p-6">Prescription not found</div>;
  }
  return (
    <DashboardLayout>
      {' '}
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Hero */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Medical Prescription
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Prescription Details
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Created on{' '}
                {new Date(prescription.createdAt).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Download Prescription
            </button>
          </div>
        </div>

        {/* Doctor + Patient */}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Doctor Information</h2>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700">
                {prescription?.doctorId?.userId?.fullName?.charAt(0)}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Dr. {prescription?.doctorId?.userId?.fullName}
                </h3>

                <p className="text-slate-600">
                  {prescription?.doctorId?.specialization}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Patient Information</h2>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-xl font-bold text-green-700">
                {prescription?.patientId?.fullName?.charAt(0)}
              </div>

              <div>
                <h3 className="text-lg font-bold">
                  {prescription?.patientId?.fullName}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Diagnosis</h2>

          <div className="rounded-2xl bg-slate-50 p-4 text-slate-700">
            {prescription.diagnosis}
          </div>
        </div>

        {/* Medicines */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Medicines</h2>

          <div className="space-y-4">
            {prescription.medicines.map((medicine, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="mb-2 text-lg font-bold text-slate-900">
                  {medicine.name}
                </p>

                <p>Dosage: {medicine.dosage}</p>

                <p>Frequency: {medicine.frequency}</p>

                <p>Duration: {medicine.duration}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes + Follow Up */}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Notes</h2>

            <p className="text-slate-700">
              {prescription.notes || 'No notes available'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Follow Up</h2>

            <p className="text-slate-700">
              {new Date(prescription.followUpDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Metadata */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Prescription Information
          </h2>

          <p className="text-slate-700">
            Created: {new Date(prescription.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrescriptionDetailsPage;
