const DepartmentsSection = ({ departments }) => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-4xl font-bold">Medical Departments</h2>

        <p className="mt-3 text-center text-slate-500">
          Explore our specialties
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <div
              key={department._id}
              className="rounded-3xl border p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 text-4xl">🏥</div>

              <h3 className="text-xl font-bold">{department.name}</h3>

              <p className="mt-3 text-slate-500">{department.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DepartmentsSection;
