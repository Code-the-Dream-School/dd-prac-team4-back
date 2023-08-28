const nodemailer = require('nodemailer');
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
        to: recipient, // Вместо process.env.RECIPIENT_EMAIL используйте аргумент recipient
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

module.exports = sendTestEmail;
