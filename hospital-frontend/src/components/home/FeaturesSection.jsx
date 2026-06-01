const FeaturesSection = () => {
  const features = [
    'Online Consultations',
    'Instant Booking',
    'Digital Prescriptions',
    'Notifications',
    'Appointment Tracking',
    'Secure Medical Records',
  ];

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-4xl font-bold">Platform Features</h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="text-4xl">✓</div>

              <h3 className="mt-4 text-xl font-bold">{feature}</h3>

              <p className="mt-2 text-slate-500">
                Designed to simplify healthcare management for patients and
                doctors.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
