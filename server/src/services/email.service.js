import { sendEmail } from '../config/nodemailer.js';

export const sendOTPEmail = async (email, otp) => {
  await sendEmail({
    from: `"Alpha Hospital" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: 'Your Verification OTP',

    html: `
<div style="
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
">

  <div style="
    text-align:center;
    margin-bottom:20px;
  ">
    <h2 style="
      color:#2563eb;
      margin:0;
    ">
      Alpha Hospital
    </h2>

    <p style="
      color:#6b7280;
      margin-top:8px;
      font-size:14px;
    ">
      Secure Account Verification
    </p>
  </div>

  <h2 style="
    color:#111827;
    margin-top:0;
  ">
    Verify Your Account
  </h2>

  <p>
    Hello,
  </p>

  <p>
    Use the following
    One-Time Password (OTP)
    to verify your account.
  </p>

  <div style="
    text-align:center;
    margin:30px 0;
  ">
    <span style="
      display:inline-block;
      background:#eff6ff;
      border:2px dashed #2563eb;
      color:#2563eb;
      padding:18px 32px;
      border-radius:12px;
      font-size:32px;
      font-weight:bold;
      letter-spacing:8px;
    ">
      ${otp}
    </span>
  </div>

  <p>
    This OTP is valid for
    <strong>10 minutes</strong>.
  </p>

  <p style="
    color:#dc2626;
    font-size:14px;
  ">
    Do not share this OTP
    with anyone for security reasons.
  </p>

  <div style="
    height:1px;
    background:#e5e7eb;
    margin:25px 0;
  "></div>

  <p style="
    color:#6b7280;
    font-size:13px;
  ">
    If you did not request this,
    you can safely ignore
    this email.
  </p>

  <p style="
    margin-top:30px;
  ">
    Thank you,
  </p>

  <p>
    <strong>
      Alpha Hospital
    </strong>
  </p>

</div>
`,
  });
};

export const sendAppointmentConfirmedEmail = async ({
  email,
  patientName,
  doctorName,
  appointmentDate,
  timeSlot,
  consultationType,
  meetingLink,
}) => {
  //meeting link section
  const meetingSection =
    consultationType === 'online'
      ? `
      <p style="
        margin-top:20px;
        margin-bottom:16px;
      ">
        Please join the meeting at your scheduled time.
      </p>

      <table
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tr>
          <td
            align="center"
            bgcolor="#2563eb"
            style="
              border-radius:8px;
            "
          >
            <a
              href="${meetingLink}"
              target="_blank"
              style="
                background:#2563eb;
                border:1px solid #2563eb;
                border-radius:8px;
                color:#ffffff;
                display:inline-block;
                font-family:Arial,sans-serif;
                font-size:16px;
                font-weight:bold;
                line-height:20px;
                padding:12px 20px;
                text-align:center;
                text-decoration:none;
              "
            >
              Join Meeting
            </a>
          </td>
        </tr>
      </table>
    `
      : `
      <p style="margin-top:20px;">
        Please visit Alpha Hospital at your scheduled time.
      </p>
    `;
  //end meeting link section

  await sendEmail({
    from: `"Alpha Hospital"<${process.env.EMAIL_USER}>`,

    to: email,

    subject: 'Appointment Confirmed',

    html: `
<div style="
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
">

  <h2 style="
    margin-top: 0;
    color: #2563eb;
  ">
    Appointment Confirmed
  </h2>

  <p>
    Hello
    <strong>${patientName}</strong>,
  </p>

  <p>
    Your appointment has been confirmed.
  </p>

  <div style="
    height:1px;
    background:#e5e7eb;
    margin:20px 0;
  "></div>

  <p>
    <strong>Doctor:</strong>
    Dr. ${doctorName}
  </p>

  <p>
    <strong>Date:</strong>
    ${new Date(appointmentDate).toDateString()}
  </p>

  <p>
    <strong>Time:</strong>
    ${timeSlot}
  </p>

  <p>
    <strong>Mode:</strong>
    ${consultationType.charAt(0).toUpperCase() + consultationType.slice(1)}
  </p>

 ${meetingSection}
  <p style="
    margin-top:30px;
  ">
    Thank you,
  </p>

  <p>
    <strong>
      Alpha Hospital
    </strong>
  </p>

</div>
`,
  });
};

//cancel appointment email

export const sendAppointmentCancelledEmail = async ({
  email,
  receiverName,
  cancelledBy,
  cancellerName,
  appointmentDate,
  timeSlot,
  cancelReason,
}) => {
  const isDoctorCancelled = cancelledBy === 'doctor';

  await sendEmail({
    from: `"Alpha Hospital" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: isDoctorCancelled
      ? 'Appointment Cancelled by Doctor'
      : 'Appointment Cancelled by Patient',

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 20px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
      ">

        <h2 style="
          color: #dc2626;
        ">
          Appointment Cancelled
        </h2>

        <p>
          Hello
          <strong>${receiverName}</strong>,
        </p>

        <p>
          ${
            isDoctorCancelled
              ? `
                Dr.
                <strong>${cancellerName}</strong>
                has cancelled your appointment.
              `
              : `
                Patient
                <strong>${cancellerName}</strong>
                has cancelled the appointment.
              `
          }
        </p>

        <hr style="
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 20px 0;
        "/>

        <p>
          <strong>Date:</strong>
          ${new Date(appointmentDate).toDateString()}
        </p>

        <p>
          <strong>Time:</strong>
          ${timeSlot}
        </p>

        ${
          cancelReason
            ? `
              <p>
                <strong>Reason:</strong>
                ${cancelReason}
              </p>
            `
            : ''
        }

        ${
          isDoctorCancelled
            ? `
              <br/>

              <p>
                You can book another appointment anytime.
              </p>

              <a
                href="${process.env.FRONTEND_URL}/doctors"
                target="_blank"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#2563eb;
                  color:white;
                  text-decoration:none;
                  border-radius:8px;
                  font-weight:bold;
                "
              >
                Book Another Appointment
              </a>
            `
            : ''
        }

        <br/>
        <br/>

        <p>
          Thank you,
        </p>

        <p>
          <strong>
            Alpha Hospital
          </strong>
        </p>
      </div>
    `,
  });
};

export const sendAppointmentRejectedEmail = async ({
  email,
  patientName,
  doctorName,
  rejectionReason,
}) => {
  await sendEmail({
    from: `"Alpha Hospital" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: 'Appointment Rejected',

    html: `
<div style="
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
">

  <h2 style="
    color:#dc2626;
    margin-top:0;
  ">
    Appointment Rejected
  </h2>

  <p>
    Hello
    <strong>${patientName}</strong>,
  </p>

  <p>
    Unfortunately,
    Dr.
    <strong>${doctorName}</strong>
    has rejected your
    appointment request.
  </p>

  ${
    rejectionReason
      ? `
      <p>
        <strong>
          Reason:
        </strong>
        ${rejectionReason}
      </p>
    `
      : ''
  }

  <p style="
    margin-top:20px;
  ">
    You can book
    another appointment.
  </p>

  <table
    role="presentation"
    cellspacing="0"
    cellpadding="0"
    border="0"
  >
    <tr>
      <td
        align="center"
        bgcolor="#2563eb"
        style="
          border-radius:8px;
        "
      >
        <a
          href="${process.env.FRONTEND_URL}/doctors"
          target="_blank"
          style="
            background:#2563eb;
            border:1px solid #2563eb;
            border-radius:8px;
            color:#ffffff;
            display:inline-block;
            font-family:Arial,sans-serif;
            font-size:16px;
            font-weight:bold;
            line-height:20px;
            padding:12px 24px;
            text-align:center;
            text-decoration:none;
          "
        >
          Book Another Appointment
        </a>
      </td>
    </tr>
  </table>

  <p style="
    margin-top:30px;
  ">
    Thank you,
  </p>

  <p>
    <strong>
      Alpha Hospital
    </strong>
  </p>

</div>
`,
  });
};

export const sendPrescriptionEmail = async ({
  email,
  patientName,
  doctorName,
  pdfBuffer,
  prescriptionId,
}) => {
  await sendEmail({
    from: `"Alpha Hospital" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: 'Your Prescription is Ready',

    html: `
<div style="
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
">

  <h2 style="
    color:#16a34a;
    margin-top:0;
  ">
    Prescription Ready
  </h2>

  <p>
    Hello
    <strong>${patientName}</strong>,
  </p>

  <p>
    Your consultation with
    <strong>
      Dr. ${doctorName}
    </strong>
    has been completed.
  </p>

  <p>
    Your prescription PDF
    is attached with this email.
  </p>

  <p>
    Please follow the prescribed medicines
    and instructions carefully.
  </p>

  <p style="
    margin-top:30px;
  ">
    Thank you,
  </p>

  <p>
    <strong>
      Alpha Hospital
    </strong>
  </p>

</div>
`,

    attachments: [
      {
        filename: `prescription-${prescriptionId}.pdf`,

        content: pdfBuffer,

        contentType: 'application/pdf',
      },
    ],
  });
};

export const sendAppointmentReminderEmail = async ({
  email,
  patientName,
  doctorName,
  appointmentDate,
  timeSlot,
  consultationType,
  meetingLink,
}) => {
  const meetingSection =
    consultationType === 'online'
      ? `
        <p style="
          margin-top:20px;
        ">
          Your online consultation
          starts in about
          <strong>1 hour</strong>.
        </p>

        <table
          role="presentation"
          cellspacing="0"
          cellpadding="0"
          border="0"
        >
          <tr>
            <td
              align="center"
              bgcolor="#2563eb"
              style="
                border-radius:8px;
              "
            >
              <a
                href="${meetingLink}"
                target="_blank"
                style="
                  background:#2563eb;
                  border:1px solid #2563eb;
                  border-radius:8px;
                  color:#ffffff;
                  display:inline-block;
                  font-family:Arial,sans-serif;
                  font-size:16px;
                  font-weight:bold;
                  line-height:20px;
                  padding:12px 24px;
                  text-align:center;
                  text-decoration:none;
                "
              >
                Join Meeting
              </a>
            </td>
          </tr>
        </table>
      `
      : `
        <p style="
          margin-top:20px;
        ">
          Please visit
          Alpha Hospital
          at your scheduled time.
        </p>
      `;

  await sendEmail({
    from: `"Alpha Hospital" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: 'Appointment Reminder',

    html: `
<div style="
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
">

  <h2 style="
    color:#2563eb;
    margin-top:0;
  ">
    Appointment Reminder
  </h2>

  <p>
    Hello
    <strong>${patientName}</strong>,
  </p>

  <p>
    This is a reminder
    that your appointment
    with
    <strong>
      Dr. ${doctorName}
    </strong>
    starts in about
    <strong>
      1 hour
    </strong>.
  </p>

  <div style="
    height:1px;
    background:#e5e7eb;
    margin:20px 0;
  "></div>

  <p>
    <strong>Date:</strong>
    ${new Date(appointmentDate).toDateString()}
  </p>

  <p>
    <strong>Time:</strong>
    ${timeSlot}
  </p>

  <p>
    <strong>Mode:</strong>
    ${consultationType.charAt(0).toUpperCase() + consultationType.slice(1)}
  </p>

  ${meetingSection}

  <p style="
    margin-top:30px;
  ">
    Thank you,
  </p>

  <p>
    <strong>
      Alpha Hospital
    </strong>
  </p>

</div>
`,
  });
};
