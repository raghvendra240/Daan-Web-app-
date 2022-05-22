const mongoose = require("mongoose");
let userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:{type: String},
  email: { type: String, required: true },
  password: {type: String},
  gender: {type: String},
  daan: {type: Number, default: 1},
  isVerified: {type: Boolean, default: false}
});


let userVerificationSchema = new mongoose.Schema({
  userId: { type: String},
  uniqueString:{type: String},
  createdAt: { type: Date},
  expiresAt:{type: Date},
  verified: {type: Boolean}
});

module.exports.userModal = mongoose.model("User", userSchema);
module.exports.userVerificationModal = mongoose.model("UserVerification", userVerificationSchema);