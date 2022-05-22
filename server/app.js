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

//Nodemailer
const nodeMailer = require("nodemailer");

//Google API
const { google } = require("googleapis");

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

async function sendMail({ _id, email }, res) {
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
  try {
    // Generate the accessToken on the fly
    const accessToken = await OAuth2Client.getAccessToken();

    const currentUrl = "http://localhost:3000/";

    const uniqueString = uuidv4() + _id;

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
    // ('email': user's email and 'name': is the e-book the user wants to receive)
    const mailOptions = {
      from: CLIENT_EMAIL,
      to: email,
      subject: `Verify Your Email`,
      html: `<p>Verify you email address to complete  the registration process.</p>
      <p>The link expires in 6 hours.</p>
      <p><a href=${
        currentUrl + "/user/verify/" + _id + "/" + uniqueString
      } >Click here to verify</a></p>`,
    };

    //hash the unique string
    bcrypt
      .hash(uniqueString, saltRounds)
      .then((hashedUniqueString) => {
        const newVerification = new USER_VERIFICATION_MODAL({
          userId: _id,
          uniqueString: hashedUniqueString,
          createdAt: Date.now(),
          expiresAt: Date.now() + 21600000,
        });
        newVerification
          .save()
          .then((result) => {
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
          })
          .catch((err) => {
            res.json({
              status: "Failed",
              message:
                "An error ocurred while creating nre verification record",
            });
          });
      })
      .catch((err) => {
        res.json({
          Status: "Failed",
          Message: "An error occurred while hashing the unique string",
        });
      });
  } catch (error) {
    console.log(error);
    res.json({
      Status: "Failed",
      Message: "An error occurred while sending mail block",
    });
  }
}

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
        const hashedUniqueString  = result[0].uniqueString;
        if (expiresAt < Date.now()) {
          //record expired
          USER_VERIFICATION_MODAL.deleteOne({ userId })
            .then(() => {
              //Delete the user record also
              USER_MODAL.deleteOne({_id: userId}).then(() => {
                let msg =
                  "The verification link is expired, Please Register again";
              }).catch(() => {
                let msg =
                  "An error occurred while deleting expired user Information record";
              });;
            })
            .catch(() => {
              let msg =
                "An error occurred while deleting expired user verification record";
            });
        }else{
          //Valid Verification record exists
          //First compare the unique string
          bcrypt.compare(uniqueString, hashedUniqueString).then((result) => {
            if(result){
              //Matched
              USER_MODAL.updateOne({_id: userId}, {isVerified: true}).then(() =>{
                USER_VERIFICATION_MODAL.deleteOne({userId}).then(() => {
                  
                }).catch((err) => {
                  console.log(err);
                  let msg = "An error occurred while deleting verified user verification data"
                });

              }).catch((err) =>{
                console.log(err);
                let msg = "An error occurred while updating verification status of User"
              });
            }else{
              //Record exists but wrong unique string
              let msg = "Invalid verification detail passed. Check you inbox again."
            }

          }).catch(() =>{
            let msg =
            "An error occurred while comparing  unique string";
          })
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
              password,
              daan: 1,
            });
            newUser
              .save()
              .then((result) => {
                // res.json({
                //   status: "Success",
                //   message: "User Registered",
                //   result: result,
                // });

                //Handle email verification
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

//SERVER
app.listen(PORT, () => {
  console.log(`Server succesfully started at port: ${PORT}`);
});
