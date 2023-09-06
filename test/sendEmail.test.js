require('dotenv').config();
const sendTestEmail = require('../src/mailing/sender.js');

describe('sendTestEmail function', () => {
  it('sends a test email with expected content', async () => {
    // Define the recipient's email address
    const recipientEmail =
      'codethedream.practicum.team4+testrecipient@outlook.com';

    // Send the test email
    const result = await sendTestEmail(recipientEmail);

    // Verify the content of the sent email
    expect(result.envelope.from).toEqual(process.env.EMAIL_USERNAME); // Verify the 'from' address
    expect(result.envelope.to).toEqual(recipientEmail); // Verify the 'to' address
  });
});
