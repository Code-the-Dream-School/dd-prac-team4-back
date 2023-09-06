const sendTestEmail = require('../src/mailing/sender.js');

describe('sendTestEmail function', () => {
  it('sends a test email with expected content', async () => {
    // Define the recipient's email address
    const recipientEmail = 'recipient@example.com';

    // Send the test email
    const result = await sendTestEmail(recipientEmail);

    // Verify the content of the sent email
    expect(result.from).toEqual(process.env.EMAIL_USERNAME); // Verify the 'from' address
    expect(result.to).toEqual(recipientEmail); // Verify the 'to' address
    expect(result.subject).toEqual('Test Email'); // Verify the subject
    expect(result.text).toEqual('Hello, this is a test email!'); // Verify the plain text content
    expect(result.html).toEqual('<p>Hello, this is a test email!</p>'); // Verify the HTML content
  });
});
