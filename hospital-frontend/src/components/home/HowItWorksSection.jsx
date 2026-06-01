const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Find a Doctor',
      description: 'Search doctors by specialty and department.',
    },
    {
      number: '02',
      title: 'Book Appointment',
      description: 'Select date and time slot instantly.',
    },
    {
      number: '03',
      title: 'Meet Doctor',
      description: 'Attend online or offline consultation.',
    },
    {
      number: '04',
      title: 'Get Prescription',
      description: 'Access digital prescriptions anytime.',
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-4xl font-bold">How It Works</h2>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border p-6 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                {step.number}
              </div>

              <h3 className="mt-5 text-xl font-bold">{step.title}</h3>

              <p className="mt-3 text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
