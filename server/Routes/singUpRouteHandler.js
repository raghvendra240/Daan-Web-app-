//Modals
const modals = require("../modals");
//User modal
const USER_MODAL = modals.userModal;
//Bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;
// send OTP service
let sendOTP = require("../services/sendOTPService");

module.exports = (req, res) => {
    let { firstName, lastName, email, password } = req.body;
    password = password.toString();
    //check duplicate email
    USER_MODAL.find({ email })
      .then((result) => {
        if (result.length) {
          res.json({
            status: "Failed",
            message: "User with same email already exists",
          });
        } else {
          /* Register */
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new USER_MODAL({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                daan: 1,
              });
              newUser
                .save()
                .then((result) => {
                  //send OTP
                  sendOTP(result, res);
                })
                .catch((err) => {
                  res.json({
                    status: "Failed",
                    message: "An error ocurred while creating user",
                  });
                });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: "Failed",
                message: "An error ocurred while generating hashed password",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "Failed",
          message: "An error ocurred while fetching email info",
        });
      });
  }