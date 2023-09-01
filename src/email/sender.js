const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
require('dotenv').config();

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
    path.join(__dirname, '../email/templates/forgotPassword.html.ejs'), // Adjust the path
    { resetLink: `http://yourapp.com/reset-password/${resetToken}` } // Adjust the URL structure
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

module.exports = sendForgotPasswordEmail;