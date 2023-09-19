const nodemailer = require('nodemailer');
const Email = require('email-templates');
const path = require('path');
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
  send:
    process.env.ACTUALLY_SEND_EMAIL || process.env.NODE_ENV === 'production',
  preview: process.env.NODE_ENV === 'development', // only open a preview window in development
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
  try {
    await baseEmail.send({
      template: 'forgot_password',
      message: { to: toEmail },
      locals: {
        resetLink: `${process.env.BACKEND_BASE_URL}/reset_password?token=${resetToken}`,
      },
    });
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}

module.exports = { sendTestEmail, sendForgotPasswordEmail };
