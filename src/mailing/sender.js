const nodemailer = require('nodemailer');
const Email = require('email-templates');
const path = require('path');
const ejs = require('ejs');
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
  }
});
console.log(path.resolve('../templates'));
console.log(process.cwd());

const subject = 'First Subject of the first email to be sent';

// Function to send a test email
async function sendTestEmail(to, username) {
  return baseEmail.send({
    template: 'test',
    message: { to },
    locals: { username, subject },
  });
}

// Function to send the order completion email
async function sendOrderCompletedEmail(to, username) {
  const html = await ejs.renderFile(
    path.join(__dirname, 'templates', 'orderCompleted', 'html.ejs'),
    { username: username } // Make sure username is defined
  );

  const subject = await ejs.renderFile(
    path.join(__dirname, 'templates', 'orderCompleted', 'subject.ejs'),
    { username: username } // Make sure username is defined
  );
  console.log('HTML Content:', html);
  console.log('Subject:', subject);

  return baseEmail.send({
    template: 'orderCompleted',
    message: { to },
    locals: { username, subject },

  });
}

module.exports = { sendOrderCompletedEmail, sendTestEmail };
