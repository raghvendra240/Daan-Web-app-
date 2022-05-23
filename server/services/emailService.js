//Nodemailer
const nodeMailer = require("nodemailer");

//Google API
const { google } = require("googleapis");

//Unique string
const { v4: uuidv4 } = require("uuid");

//Bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;

//OTP service
let generateOTP = require("./otpService");

module.exports = async function sendMail({ _id, email }, res) {
  const CLIENT_EMAIL = process.env.EMAIL;
  const CLIENT_ID = process.env.EMAIL_CLIENT_ID;
  const CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
  const REDIRECT_URI = process.env.EMAIL_CLIENT_REDIRECT_URI;
  const REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;
  const OAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  let OTP = generateOTP();
  console.log("OTP", OTP);
  OAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  try {
    // Generate the accessToken on the fly
    const accessToken = await OAuth2Client.getAccessToken();
    // Create the email envelope (transport)
    const transport = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: CLIENT_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    // Create the email options and body
    const mailOptions = {
      from: CLIENT_EMAIL,
      to: email,
      subject: `Verify Your Email`,
      html: `<p>Verify you email address to complete  the registration process.</p>
        <p>Your OTP is</p>
        <h2>${OTP}</h2>`,
    };
    transport
      .sendMail(mailOptions)
      .then((result) => {
        res.json({
          status: "Pending",
          message: "Registration completed...Please verify your email",
        });
      })
      .catch((err) => {
        res.json({
          status: "Failed",
          message: "An error ocurred while sending Mail",
        });
      });
  } catch (error) {
    console.log(error);
    res.json({
      Status: "Failed",
      Message: "An error occurred while sending mail block",
    });
  }
};
