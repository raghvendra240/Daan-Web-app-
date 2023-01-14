//get Email Transporter
const getEmailTransporter = require('./getEmailTransporter');

module.exports = async function ({toEmail, subject, body}) {
    const transport = await getEmailTransporter();

    // Create the email options and body
    const mailOptions = {
      from: process.env.EMAIL,
      to: toEmail,
      subject: subject,
      html: body,
    };
    
    return  transport.sendMail(mailOptions)
}