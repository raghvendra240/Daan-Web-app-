//.Env
require("dotenv").config();

//PORT
const PORT = process.env.PORT || 3000;

//
require("events").EventEmitter.defaultMaxListeners = 0;

//EXPRESS
const express = require("express");
var bodyParser = require("body-parser");
let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
let path = require("path");
app.use(
  "/uploads/donation",
  express.static(path.join(__dirname, "./uploads/donation"))
);

//Cookies management
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//Routes Handlers
const loginHandler = require("./Routes/loginRoute");
const isAuthenticatedRoute = require("./Routes/isAuthenticatedRoute");
const donationRouteHandler = require("./Routes/donationRouteHandler");
const updateProfileRouteHandler = require("./Routes/updateProfileRouteHandler");

// CORS
let cors = require("cors");
const whitelist = [
  "http://localhost:5500",
  "https://localhost",
  "http://127.0.0.1:5500",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

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
//Donation modal
const DONATION_MODAL = modals.donationModal;
//GroupChat modal
const GROUP_CHAT_MODAL = modals.groupChatModal;
const CONVERSATION_MODAL = modals.conversationModal;
const MESSAGE_MODAL = modals.messageModal;
//Bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;

//Email sent function
let sendMail = require("./services/emailService");

//Multer
const multer = require("multer");
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/donation");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});
const upload = multer({ storage: fileStorageEngine });

//Authentication check middleware
let getTokenData = require("./services/JwtToken").getTokenData;
function checkUserAuthentication(req, res, next) {
  getTokenData(req.cookies.token).then((response) => {
    if (response.isAuthenticated) {
      next();
    } else {
      res.status(403).json({
        status: "Failed",
        message: "Please login first",
      });
    }
  });
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

app.get("/user/:userIdentifier", (req, res) => {
  let type = "_id";
  if(req.params.userIdentifier.includes('@')){
    type= "email"
  }
  USER_MODAL.find({ [type]: req.params.userIdentifier }, (err, user) => {
    if (!err) res.send(user);
    else res.send("No records found..");
  });
});

app.get("/topdonor", async (req, res) => {
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

app.post("/login", loginHandler);

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
              USER_MODAL.updateOne({ _id: _id }, { isVerified: true });
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

app.get("/isAuthenticated", isAuthenticatedRoute);
app.get("/logout", (req, res) => {
  res.clearCookie("token", {
    secure: true,
    httpOnly: true,
    sameSite: "none",
  });
  res.json({
    status: "Success",
    message: "Logged out successfully",
  });
});

app.post("/donation", upload.array("images", 5), donationRouteHandler.post);

app.patch(
  "/updateProfile",
  checkUserAuthentication,
  upload.single("dp"),
  updateProfileRouteHandler
);

app.get("/donation", donationRouteHandler.get);

app.get("/groupchat", async (req, res) => {
  let data = await GROUP_CHAT_MODAL.find().populate("senderUserId");
  res.status(200).json({
    status: "OK",
    data: data,
  });
});

app.post("/conversation", async (req, res) => {
  if (!req.body.senderUserId || !req.body.receiverUserId) {
    res.status(404).json({
      message: "Please check your senderUserID and receiverUserId",
    });
  }

  const newConversation = new CONVERSATION_MODAL({
    members: [req.body.senderUserId, req.body.receiverUserId],
  });

  try {
    let savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/conversation/:userId", async (req, res) => {
  try {
    console.log(req.params.userId);
     const conversation = await CONVERSATION_MODAL.find({
      members: { $in: [String(req.params.userId)] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

/*  
Creates a new messages
req.body format :
                      
                  conversationId:"62c0103208aa2b3443fa4f0a"
                  senderUserId:"789"
                  text:"Hey"

*/

app.post("/messages", async (req, res) => {
  const newMessage = new MESSAGE_MODAL(req.body);
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/messages/:conversationId", async (req, res) => {
  try {
    const messages = await MESSAGE_MODAL.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

//SERVER
const server = app.listen(PORT, () => {
  console.log(`Server succesfully started at port: ${PORT}`);
});

//Initialize groupChat socket
const io = require("socket.io")(server, {
  cors: {
    origin: "https://localhost",
  },
});
io.on("connection", (socket) => {
  socket.on("sendMsg", function (msgObj) {
    let newMsg = new GROUP_CHAT_MODAL({
      senderUserId: msgObj.userId,
      message: msgObj.msg,
      date: msgObj.date,
    });
    newMsg.save();
    USER_MODAL.find({ _id: msgObj.userId }, function (err, data) {
      if (data.length > 0) {
        socket.broadcast.emit("receivedMsg", {
          userName: data[0].firstName,
          msg: msgObj.msg,
          date: msgObj.date,
        });
      }
    });
  });
});
