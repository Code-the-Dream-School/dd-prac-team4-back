require('dotenv').config();
const { createTestAccount } = require('nodemailer');

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

  // it('connects to Ethereal SMTP service', async () => {
  //   const transporter = nodemailer.createTransport({
  //     host: 'smtp.ethereal.email',
  //     port: 587,
  //     auth: {
  //       user: 'irma.cronin26@ethereal.email',
  //       pass: 'mDHwkxB1yhxaEn3yCk',
  //     },
  //   });

  //   const info = await transporter.verify();

  //   expect(info).toBeDefined();
  //   expect(info.accepted.length).toBeGreaterThan(0);
  // });

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
