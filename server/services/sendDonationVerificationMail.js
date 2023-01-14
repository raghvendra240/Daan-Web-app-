//Send Email service
const sendEmail = require("./sendEmailService");

module.exports =  function ({toEmail, uniqueKey}) {
    const verificationLink = `https://localhost/?verification=${uniqueKey}`
    const emailDetails = {
        toEmail: toEmail,
        subject: `Received Item verification`,
        body: `<p>Please verity that you received item</p>
          <a target="_blank" href="${verificationLink}">click here to verify</a>`
      }
      return sendEmail(emailDetails);
}