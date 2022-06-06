const mongoose = require("mongoose");
let userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:{type: String},
  email: { type: String, required: true },
  password: {type: String},
  gender: {type: String},
  daan: {type: Number, default: 1},
  isVerified: {type: Boolean, default: false},
  phone: {type: String},
  avatarPath: {type: String},
  address: {
    country: { type: String, required: true},
    state: { type: String},
    city: { type: String, required: true},
    streetAddress: { type: String, required: true},
    zipcode: { type: String, required: true}
  }
});


let userVerificationSchema = new mongoose.Schema({
  userId: { type: String},
  OTP:{type: String},
  createdAt: { type: Date},
  expiresAt:{type: Date},
  verified: {type: Boolean}
});

let donationSchema = new mongoose.Schema({
  itemTitle: { type: String, required: true},
  itemCategory: { type: String, required: true},
  itemSubCategory: { type: String},
  itemDescription: { type: String, required: true},
  images: [{ type: String}],
  createdAt: { type: Date, required: true},
  contactInfo: {  type: 'ObjectId', ref: "User" }

})

module.exports.userModal = mongoose.model("User", userSchema);
module.exports.userVerificationModal = mongoose.model("UserVerification", userVerificationSchema);
module.exports.donationModal = mongoose.model("Donation", donationSchema);