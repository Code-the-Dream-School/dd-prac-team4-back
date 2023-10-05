require('dotenv').config();
const { createTestAccount } = require('nodemailer');
const { sendWelcomeEmail } = require('../src/mailing/sender.js');

describe('sendTestEmail function', () => {
  it('sends a test email with expected content', async () => {
    // create a test sender account using nodemailers 'etheral SMTP' service
    let testAccount = await createTestAccount();
    // reset environment variables
    process.env.EMAIL_SERVICE = 'Ethereal';
    process.env.EMAIL_USERNAME = testAccount.user;
    process.env.EMAIL_PASSWORD = testAccount.pass;
    // Import the sendTestEmail function from the sender.js file; this will now use the above env varas
    const { sendTestEmail } = require('../src/mailing/sender.js');

    // Define the recipient's email address
    const recipientEmail =
      'codethedream.practicum.team4+testrecipient@outlook.com';

    // Send the test email
    const result = await sendTestEmail(recipientEmail);

    // Verify the content of the sent email
    expect(result.envelope.from).toEqual(process.env.EMAIL_USERNAME); // Verify the 'from' address
    expect(result.envelope.to).toEqual([recipientEmail]); // Verify the 'to' address
  });
  it('sends a welcome email with expected content', async () => {
    // create a test sender account using nodemailer's 'ethereal SMTP' service
    let testAccount = await createTestAccount();

    // reset environment variables
    process.env.EMAIL_SERVICE = 'Ethereal';
    process.env.EMAIL_USERNAME = testAccount.user;
    process.env.EMAIL_PASSWORD = testAccount.pass;

    // Define the recipient's email address for the welcome email
    const recipientEmail = 'example@example.com'; // Replace with the actual recipient's email address

    // Send the welcome email
    const result = await sendWelcomeEmail(recipientEmail);

    // Verify the content of the sent welcome email
    expect(result.envelope.from).toEqual(process.env.EMAIL_USERNAME); // Verify the 'from' address
    expect(result.envelope.to).toEqual([recipientEmail]); // Verify the 'to' address
    // You can add more assertions to check the content of the email if needed
  });
});
