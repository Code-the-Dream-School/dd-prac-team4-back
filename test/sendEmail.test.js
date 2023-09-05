const sendTestEmail = require('/mailing/sender.js');
describe('sendTestEmail function', () => {
  it('sends an email with expected content', async () => {
    const result = await sendTestEmail();
    expect(result.originalMessage.from).toEqual('expectedFromValue');
    expect(result.originalMessage.to).toEqual('expectedToValue');
  });
});
