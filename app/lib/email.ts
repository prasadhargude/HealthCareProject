import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface AppointmentDetails {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  meetingLink: string;
}

export async function sendAppointmentConfirmation({ to, appointmentDetails }: { to: string, appointmentDetails: AppointmentDetails }) {
  const { id, doctorName, specialty, date, time, meetingLink } = appointmentDetails;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Your HealthConnect Video Consultation Appointment',
    html: `
      <h1>Appointment Confirmation</h1>
      <p>Your video consultation has been scheduled with ${doctorName} (${specialty}).</p>
      <p>Date: ${date}</p>
      <p>Time: ${time}</p>
      <p>Your meeting link: <a href="${meetingLink}">${meetingLink}</a></p>
      <p>This link will become active 5 minutes before your scheduled appointment time.</p>
      <p>Appointment ID: ${id}</p>
      <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}