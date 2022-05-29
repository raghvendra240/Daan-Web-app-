let createToken = require("../services/JwtToken").createToken;
const modals = require("../modals");
const USER_MODAL = modals.userModal;
const USER_VERIFICATION_MODAL = modals.userVerificationModal;
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = async (req, res) => {
    console.log(req.session);
    let { email, password } = req.body;
    USER_MODAL.find({ email }, (err, docs) => {
      if (err) {
        console.log(err);
        res.json({
          status: "Failed",
          message: "Something went wrong. Please try again..",
        });
      } else {
        if (!docs.length) {
          res.json({
            status: "Failed",
            message: "email not registered",
          });
        } else {
          password = password.toString();
          let hashedPassword = docs[0].password;
          bcrypt.compare(password, hashedPassword, async function (err, result) {
            if (result) {
              let token = await createToken(email);
              res.cookie("token", token,{
                secure: true,
               httpOnly: true,
               sameSite: 'none'
                });
              res.json({
                status: "Success",
                message: "logged in successfully"
              });
            } else {
              res.json({
                status: "Failed",
                message: "Wrong Password",
              });
            }
          });
        }
      }
    });
  }