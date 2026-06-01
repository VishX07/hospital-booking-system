const StatsSection = ({ stats }) => {
  const items = [
    {
      label: 'Patients',
      value: stats?.patients || 0,
    },
    {
      label: 'Doctors',
      value: stats?.doctors || 0,
    },
    {
      label: 'Appointments',
      value: stats?.appointments || 0,
    },
    {
      label: 'Departments',
      value: stats?.departments || 0,
    },
  ];

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl bg-white p-8 text-center shadow-sm"
            >
              <h3 className="text-4xl font-bold text-blue-600">{item.value}</h3>

              <p className="mt-2 text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
