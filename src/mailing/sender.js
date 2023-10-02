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

// Function to send a test email
async function sendTestEmail(to, username) {
  return baseEmail.send({
    template: 'test',
    message: { to },
    locals: { username },
  });
}

// Function to send the order completion email
async function sendOrderCompletedEmail(to, username, orderItems, total) {
  return baseEmail.send({
    template: 'orderCompleted',
    message: { to },
    locals: { username, orderItems, total },
  });
}

// Function to send the welcome email
async function sendWelcomeEmail(recipient, user) {
  const template = 'welcome';
  const subject = 'Welcome to Our Website';
  const locals = { user };
  await baseEmail
    .send({
      template,
      message: {
        to: recipient,
        subject,
      },
      locals,
    })
    .then(() => {
      console.log('Welcome email sent successfully.');
    })
    .catch((error) => {
      console.error('Error sending welcome email:', error);
      throw error;
    });
}

async function sendForgotPasswordEmail(toEmail, resetToken) {
  try {
    await baseEmail.send({
      template: 'forgot_password',
      message: { to: toEmail },
      locals: {
        resetLink: `${process.env.BACKEND_BASE_URL}/resetPassword?token=${resetToken}`,
      },
    });
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}

module.exports = {
  sendTestEmail,
  sendForgotPasswordEmail,
  sendOrderCompletedEmail,
  sendWelcomeEmail,
};
