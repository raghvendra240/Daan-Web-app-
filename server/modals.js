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
    country: { type: String},
    state: { type: String},
    city: { type: String},
    streetAddress: { type: String,},
    zipcode: { type: String,}
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

let groupChatSchema = new mongoose.Schema({
  senderUserId: {type: 'ObjectId', ref: "User"},
  message: { type: String, required: true},
  date: { type: String, required: true},

})

let conversationSchema = new mongoose.Schema({
  members: {type: Array},
  lastUpdated: { type: String},
});
let messageSchema = new mongoose.Schema({
  conversationId: {type: String, required: true},
  senderUserId: {type: String, required: true},
  text: { type: String, required: true},
  time: {type: String}
});

module.exports.userModal = mongoose.model("User", userSchema);
module.exports.userVerificationModal = mongoose.model("UserVerification", userVerificationSchema);
module.exports.donationModal = mongoose.model("Donation", donationSchema);
module.exports.groupChatModal = mongoose.model("GroupChat", groupChatSchema);
module.exports.conversationModal = mongoose.model("Conversation", conversationSchema);
module.exports.messageModal = mongoose.model("Message", messageSchema);




/*  
Private Chat Modal --------------------------------

const Conversation Schema=new mongoose.Schema(
 {
   members:{
);
   },
      type:Array,
 },
 {timestamps:true}
)}


const MessageSchema =new mongoose.Schema({
    conversationId:{
      type:String,
    },
    sender:{
      type:String,
    },
    text:{
      type:String,
   },
                    
      
 },
  {timestamps:true}

});
*/