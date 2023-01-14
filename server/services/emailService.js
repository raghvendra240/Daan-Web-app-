//Nodemailer
const nodeMailer = require("nodemailer");

//Unique string
const { v4: uuidv4 } = require("uuid");

//Bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;

//OTP service
let generateOTP = require("./otpService");

//User verification modal
const USER_VERIFICATION_MODAL = require("../modals").userVerificationModal;

//get Access Token
const getEmailTransporter = require('./getEmailTransporter');

//Send Email service
const sendEmail = require("./sendEmailService");

module.exports = async function sendMail({ _id, email }, res) {
  const OTP = generateOTP();
  try {
    const emailDetails = {
      toEmail: email,
      subject: `Verify Your Email`,
      body: `<p>Verify you email address to complete the registration process.</p>
        <p>Your OTP is:</p>
        <h2>${OTP}</h2>`,
    }
    const sendEmailResponse = await sendEmail(emailDetails);
    const newVerificationModal = new USER_VERIFICATION_MODAL({
      userId: _id,
      OTP: OTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1800000,
      verified: false,
    });
    const saveNewVerificationResponse = await newVerificationModal.save();
    res.json({
      status: "Pending",
      message: "Registration completed...Please verify your email",
      data: email,
    });
    // transport
    //   .sendMail(mailOptions)
    //   .then((result) => {
    //     //Crete verification object
    //     const newVerificationModal = new USER_VERIFICATION_MODAL({
    //       userId: _id,
    //       OTP: OTP,
    //       createdAt: Date.now(),
    //       expiresAt: Date.now() + 1800000,
    //       verified: false,
    //     });
    //     newVerificationModal
    //       .save()
    //       .then((result) => {
    //         res.json({
    //           status: "Pending",
    //           message: "Registration completed...Please verify your email",
    //           data: email,
    //         });
    //       })
    //       .catch((err) => {
    //         console.log(err);
    //         res.json({
    //           status: "Failed",
    //           message: "Registration Failed. Please try again...",
    //         });
    //       });
    //   })
    //   .catch((err) => {
    //     res.json({
    //       status: "Failed",
    //       message: "An error ocurred while sending Mail",
    //     });
    //   });
  } catch (error) {
    console.log(error);
    res.json({
      Status: "Failed",
      Message: "An error occurred while sending mail block",
    });
  }
};
