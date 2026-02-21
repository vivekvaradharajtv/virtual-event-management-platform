const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (config.nodeEnv === 'test') {
    transporter = { sendMail: () => Promise.resolve({ messageId: 'test' }) };
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: false,
    ignoreTLS: true,
  });
  return transporter;
}

async function sendRegistrationEmail(toEmail, event) {
  const transport = getTransporter();
  const mailOptions = {
    from: process.env.MAIL_FROM || 'noreply@events.local',
    to: toEmail,
    subject: `You are registered for: ${event.title}`,
    text: `You have successfully registered for "${event.title}" on ${event.date} at ${event.time}. ${event.description ? `\n\n${event.description}` : ''}`,
  };
  await transport.sendMail(mailOptions);
  if (config.nodeEnv === 'development' && !process.env.SMTP_HOST) {
    console.log('[Email]', mailOptions.subject, '->', toEmail);
  }
}

module.exports = {
  sendRegistrationEmail,
};
