const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
require('dotenv').config();

// transport using Nodemailer
const transport = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME, // Your Outlook email address
    pass: process.env.EMAIL_PASSWORD, // Your Outlook password
  },
});

// Function to send a test email (promisified)
async function sendTestEmail(recipient) {
  return new Promise((resolve, reject) => {
    transport.sendMail(
      {
        from: process.env.EMAIL_USERNAME,
        to: recipient,
        subject: 'Test Email',
        text: 'Hello, this is a test email!',
        html: '<p>Hello, this is a test email!</p>',
      },
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
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
