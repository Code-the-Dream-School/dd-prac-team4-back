const { sendTestEmail } = require('./sender');
const TEST_RECIPIENT_EMAIL = process.env.TEST_RECIPIENT_EMAIL;

async function main() {
  try {
    const response = await sendTestEmail(TEST_RECIPIENT_EMAIL);
    console.log('Test email sent successfully:', response);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

main();
