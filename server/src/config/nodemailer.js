import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL from the start, not STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000, // 10s — fail fast instead of infinite hang
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// ← add this right here
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection failed:', error.message);
  } else {
    console.log('SMTP connection OK ✓');
  }
});

export default transporter;
