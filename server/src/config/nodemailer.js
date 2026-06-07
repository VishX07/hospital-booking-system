export const sendEmail = async ({ to, subject, html, attachment = [] }) => {
  const payload = {
    sender: {
      name: 'Alpha Hospital',
      email: 'alphahospital.app@gmail.com',
    },

    to: [
      {
        email: to,
      },
    ],

    subject,

    htmlContent: html,
  };

  if (attachment.length > 0) {
    payload.attachment = attachment;
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  console.log('Brevo Response:', data);

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};
