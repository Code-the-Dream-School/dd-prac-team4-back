require('dotenv').config();
const { createTestAccount } = require('nodemailer');
//const sendTestEmail = require('../src/mailing/sender.js');

describe('sendTestEmail function', () => {
  it('sends a test email with expected content', async () => {
    // create a test sender account using nodemailers 'etheral SMTP' service
    let testAccount = await createTestAccount();
    // reset environment variables
    process.env.EMAIL_SERVICE = 'Ethereal';
    process.env.EMAIL_USERNAME = testAccount.user;
    process.env.EMAIL_PASSWORD = testAccount.pass;
    // Import the sendTestEmail function from the sender.js file; this will now use the above env varas
    //const sendTestEmail = require('../src/mailing/sender.js');
  });
});
