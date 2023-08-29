const nodemailer = require('nodemailer');

async function sendForgotPasswordEmail(toEmail, resetToken) {
  const transporter = nodemailer.createTransport({
    // Configure your email service here
  });

  const mailOptions = {
    from: 'your@example.com',
    to: toEmail,
    subject: 'Password Reset Request',
    html: // Load and render the forgotPassword.html.ejs template here,
   };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}

module.exports = sendForgotPasswordEmail;
