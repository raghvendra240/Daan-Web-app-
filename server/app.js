//.Env
require("dotenv").config();

//PORT
const PORT = process.env.PORT || 3000;

//EXPRESS
const express = require("express");
var bodyParser = require("body-parser");
let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(bodyParser);

// CORS
let cors = require("cors");
app.use(cors());

//MONGOOSE
const mongoose = require("mongoose");
const { response } = require("express");
const MONGO_URL = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_USER_PASSWORD}@cluster0.1kdst.mongodb.net/daanDb?retryWrites=true&w=majority`;
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
});

//Unique string
const { v4: uuidv4 } = require("uuid");

//Modals
const modals = require("./modals");
//User modal
const USER_MODAL = modals.userModal;
//Verification modal
const USER_VERIFICATION_MODAL = modals.userVerificationModal;

//Bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;

//Email sent function
let sendMail = require("./services/emailService");

//ROUTES
app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.get("/user/verify/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;
  USER_VERIFICATION_MODAL.find({ userId })
    .then((result) => {
      if (result.length) {
        const { expiresAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;
        if (expiresAt < Date.now()) {
          //record expired
          USER_VERIFICATION_MODAL.deleteOne({ userId })
            .then(() => {
              //Delete the user record also
              USER_MODAL.deleteOne({ _id: userId })
                .then(() => {
                  let msg =
                    "The verification link is expired, Please Register again";
                })
                .catch(() => {
                  let msg =
                    "An error occurred while deleting expired user Information record";
                });
            })
            .catch(() => {
              let msg =
                "An error occurred while deleting expired user verification record";
            });
        } else {
          //Valid Verification record exists
          //First compare the unique string
          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                //Matched
                USER_MODAL.updateOne({ _id: userId }, { isVerified: true })
                  .then(() => {
                    USER_VERIFICATION_MODAL.deleteOne({ userId })
                      .then(() => {})
                      .catch((err) => {
                        console.log(err);
                        let msg =
                          "An error occurred while deleting verified user verification data";
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    let msg =
                      "An error occurred while updating verification status of User";
                  });
              } else {
                //Record exists but wrong unique string
                let msg =
                  "Invalid verification detail passed. Check you inbox again.";
              }
            })
            .catch(() => {
              let msg = "An error occurred while comparing  unique string";
            });
        }
      } else {
        let msg =
          "Account record doesn't exist or has been verified already.Please sign up or log in. ";
      }
    })
    .catch((error) => {
      console.log(error);
      let msg =
        "An error occurred while verifying the email.Please try again...";
    });
});

app.get("/users", (req, res) => {
  USER_MODAL.find({}, (err, users) => {
    res.send(users);
  });
});

app.get("/user/:email", (req, res) => {
  USER_MODAL.find({ email: req.params.email }, (err, user) => {
    if (!err) res.send(user);
    else res.send("No records found..");
  });
});

app.get("/topdonor", (req, res) => {
  USER_MODAL.find({}, (err, users) => {
    users.sort((donorA, donorB) => {
      if (donorA.daan > donorB.daan) return 1;
      else return -1;
    });
    res.send(users.slice(-9).reverse());
  });
});

app.post("/signup", (req, res) => {
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
                sendMail(result, res);
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
});

app.post("/login", (req, res) => {
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
        bcrypt.compare(password, hashedPassword, function (err, result) {
          if (result) {
            res.json({
              status: "Success",
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
});

app.post("/verify/otp", (req, res) => {
  console.log("Body", req.body);
  let { OTP, email } = req.body;
  USER_MODAL.find({ email })
    .then((result) => {
      let { _id } = result[0];
      USER_VERIFICATION_MODAL.find({ userId: _id })
        .then((result) => {
          console.log("User verifcation", result);
          if (result.length) {
            let { expiresAt, OTP } = result[0];
            if (expiresAt < Date.now()) {
              // delete user record
              USER_MODAL.deleteOne({ _id })
                .then(() => {
                  res.json({
                    status: "Failed",
                    message: "OTP Expired. Please Register again",
                  });
                })
                .catch(() => {
                  res.json({
                    status: "Failed",
                    message: "Failed to delete tangling user detail",
                  });
                });
            } else {
              //User verified
              if (result[0].OTP != OTP) {
                res.json({
                  status: "Failed",
                  message: "Wrong OTP",
                });
              }
              USER_VERIFICATION_MODAL.deleteOne({ userId: _id });
              USER_MODAL.updateOne(
                { _id: _id },
                { isVerified: true },
                (err, docs) => {
                  if (err) {
                    res.json({
                      err,
                    });
                  } else {
                    res.json({
                      docs,
                    });
                  }
                }
              );
              res.json({
                status: "Success",
                message: "OTP verified now login",
              });
            }
          } else {
            res.json({
              status: "Failed",
              message: "Register Again",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          res.json({
            status: "Failed",
            message: "An error ocurred while fetching verification record",
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "Failed",
        message: "An error ocurred while fetching verification record (email)",
      });
    });
});
//SERVER
app.listen(PORT, () => {
  console.log(`Server succesfully started at port: ${PORT}`);
});
