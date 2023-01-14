  //Google API
const { google } = require("googleapis");

//Nodemailer
const nodeMailer = require("nodemailer");

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

OAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

module.exports = async function () {
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
    return transport;
  } catch (error) {
    return undefined;
  }
}