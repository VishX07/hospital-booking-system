import { useState } from 'react';

const FaqSection = () => {
  const [active, setActive] = useState(null);

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer:
        'Select a doctor, choose a date and available slot, then confirm your booking.',
    },
    {
      question: 'Can I cancel an appointment?',
      answer: 'Yes, appointments can be cancelled from the appointments page.',
    },
    {
      question: 'Where can I see prescriptions?',
      answer: 'All prescriptions are available inside My Prescriptions.',
    },
    {
      question: 'Do you support online consultations?',
      answer:
        'Yes, doctors can provide online consultations through meeting links.',
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-4xl font-bold">
          Frequently Asked Questions
        </h2>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-2xl border">
              <button
                onClick={() => setActive(active === index ? null : index)}
                className="flex w-full items-center justify-between p-5 text-left font-semibold"
              >
                {faq.question}

                <span>{active === index ? '-' : '+'}</span>
              </button>

              {active === index && (
                <div className="border-t p-5 text-slate-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
