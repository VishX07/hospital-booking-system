// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   family: 4, // ← force IPv4, blocks IPv6 routing
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   connectionTimeout: 10000,
//   greetingTimeout: 10000,
//   socketTimeout: 15000,
// });

// // ← add this right here
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('SMTP connection failed:', error.message);
//   } else {
//     console.log('SMTP connection OK ✓');
//   }
// });

// export default transporter;

// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async ({ to, subject, html }) => {
//   const { data, error } = await resend.emails.send({
//     from: '<onboarding@resend.dev>', // use this until you add your domain
//     to,
//     subject,
//     html,
//   });

//   if (error) throw new Error(error.message);
//   return data;
// };

export const sendEmail = async ({ to, subject, html }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: 'Alpha Hospital',
        email: 'alphahospital.app@gmail.com', // verified sender
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};
