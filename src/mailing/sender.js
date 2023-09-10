const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
require('dotenv').config();

// Create a nodemailer transport
const transport = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME, // Your Outlook email address
    pass: process.env.EMAIL_PASSWORD, // Your Outlook password
  },
  debug: true, // Enable debugging
});

const baseEmail = new Email({
  message: {
    from: process.env.EMAIL_USERNAME,
  },
  transport: transport, // Use the transport you created
  subjectPrefix: process.env.NODE_ENV === 'production' ? '' : '(TEST) ',
  views: {
    root: path.resolve('src/mailing/templates'), // this tells email-templates to look for templates starting from this path
    options: {
      extension: 'ejs', // this tells email-templates that the file will end tith *.ejs
    },
  },
  send: false,
  preview: true,
  juice: true,
  juiceResources: {
    webResources: { relativeTo: path.resolve('src/mailing/templates') },
  },
});

const subject = 'First Subject of the first email to be sent';

// Function to send a test email
async function sendTestEmail(to, username) {
  return baseEmail.send({
    template: 'test',
    message: { to },
    locals: { username, subject },
  });
}

async function sendForgotPasswordEmail(toEmail, resetToken) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Load and render the HTML template
  const htmlTemplate = await ejs.renderFile(
    path.join(__dirname, './templates/forgot_password/html.ejs'),
    { resetLink: `http://localhost:8000/api/v1/reset-password/${resetToken}` }
  );

  const mailOptions = {
    from: 'your@example.com',
    to: toEmail,
    subject: 'Password Reset Request',
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}

module.exports = { sendTestEmail, sendForgotPasswordEmail };
