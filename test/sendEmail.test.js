const sendTestEmail = require('../path/to/sendTestEmail'); // Replace with the actual path
describe('sendTestEmail function', () => {
  it('sends an email with expected content', async () => {
    const result = await sendTestEmail(); // Replace with your actual inputs
    expect(result.originalMessage.from).toEqual('expectedFromValue');
    expect(result.originalMessage.to).toEqual('expectedToValue');
  });
});
