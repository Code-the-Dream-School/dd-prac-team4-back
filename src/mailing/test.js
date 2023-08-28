const sendTestEmail = require('./sender');
const recipient = process.env.RECIPIENT_EMAIL;

async function main() {
  try {
    const response = await sendTestEmail(recipient);
    console.log('Test email sent successfully:', response);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

main();