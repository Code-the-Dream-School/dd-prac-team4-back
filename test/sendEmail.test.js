require('dotenv').config();
const { createTestAccount } = require('nodemailer');
const sender = require('../src/mailing/sender');

let originalEmailService;
let originalEmailUsername;
let originalEmailPassword;
let testAccount;

beforeAll(async () => {
  originalEmailService = process.env.EMAIL_SERVICE;
  originalEmailUsername = process.env.EMAIL_USERNAME;
  originalEmailPassword = process.env.EMAIL_PASSWORD;

  testAccount = await createTestAccount();
  process.env.EMAIL_SERVICE = 'Ethereal';
  process.env.EMAIL_USERNAME = testAccount.user;
  process.env.EMAIL_PASSWORD = testAccount.pass;
});

afterAll(() => {
  process.env.EMAIL_SERVICE = originalEmailService;
  process.env.EMAIL_USERNAME = originalEmailUsername;
  process.env.EMAIL_PASSWORD = originalEmailPassword;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('sendTestEmail function', () => {
  it('sends a test email with expected content', async () => {
    // create a test sender account using nodemailers 'etheral SMTP' service
    let testAccount = await createTestAccount();
    // reset environment variables
    process.env.EMAIL_SERVICE = 'Ethereal';
    process.env.EMAIL_USERNAME = testAccount.user;
    process.env.EMAIL_PASSWORD = testAccount.pass;

    const { sendTestEmail } = require('../src/mailing/sender.js');

    // Define the recipient's email address
    const recipientEmail =
      'codethedream.practicum.team4+testrecipient@outlook.com';

    // Send the test email
    const result = await sendTestEmail(recipientEmail);

    // Verify the content of the sent email
    expect(result.envelope.from).toEqual(process.env.EMAIL_USERNAME);
    expect(result.envelope.to).toEqual([recipientEmail]);
  });

  it('sends a welcome email with expected content', async () => {
    const { sendWelcomeEmail } = require('../src/mailing/sender.js');

    const recipientEmail =
      'codethedream.practicum.team4+testrecipient@outlook.com';
    const mockUser = {
      name: 'Test User',
    };

    const result = await sendWelcomeEmail(recipientEmail, mockUser);

    expect(result.envelope.from).toEqual(process.env.EMAIL_USERNAME);
    expect(result.envelope.to).toEqual([recipientEmail]);
    expect(result.message.text).toContain(mockUser.name);
  });
});
