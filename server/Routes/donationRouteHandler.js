const modals = require("../modals");
const DONATION_MODAL = modals.donationModal;
let getTokenData = require("../services/JwtToken").getTokenData;
const { v4: uuidv4 } = require("uuid");
const USER_MODAL = modals.userModal;
const sendVerificationMail = require("../services/sendDonationVerificationMail");
module.exports.post = async (req, res) => {
  let imagesPath = req.files.map((file) => file.path);
  let cookieData = await getTokenData(req.cookies.token);
  let donation = new DONATION_MODAL({
    itemTitle: req.body.title,
    itemDescription: req.body.description,
    itemCategory: req.body.category,
    itemSubCategory: req.body.subcategory,
    daanCoins: req.body.daanCoins,
    images: imagesPath,
    createdAt: Date.now(),
    contactInfo: cookieData._id,
  });
  donation.save();
  res.json({ Status: "Success", Message: "Successfully Uploaded" });
};

module.exports.get = async function (req, res) {
  let data = [];
  if (req.params.userId) {
    data = await DONATION_MODAL.find({
      contactInfo: req.params.userId,
    }).populate("contactInfo");
  } else if (req.params.donationId) {
    data = await DONATION_MODAL.find({
      _id: req.params.donationId,
    }).populate("contactInfo");
  } else {
    data = await DONATION_MODAL.find().populate("contactInfo");
  }
  res.status(200).json({
    status: "OK",
    data: data,
  });
};

module.exports.delete = async function (req, res) {
  // let response = await DONATION_MODAL.deleteOne({_id: req.params.donationId});
  // if(response.acknowledged){
  //   res.status(200).json({
  //     message: "Deleted Successfully"
  //   });
  // }else{
  //   res.status(500).json({
  //     message: "Please Try Again"
  //   });
  // }
  res.status(200).json({
    message: "Deleted Successfully",
  });
};

module.exports.sendDonationCompletedMail = async function (req, res) {
  const uniqueKey = uuidv4();
  const {receiverEmailId, donarId, donationId} = req.body;
  try {
    console.log(req.body);
    const user = await USER_MODAL.find({ email: receiverEmailId });
    if (user.length == 0) {
      throw new Error("User not found");
    }
    const receiverId = user[0]._id;
    await DONATION_MODAL.updateOne({_id : donationId}, { $set : {
      receiverId : receiverId,
      donationStatus: "pending",
      uniqueKey: uniqueKey
    }})
    await sendVerificationMail({
      toEmail: receiverEmailId,
      uniqueKey: uniqueKey,

    })
    res.status(200).send("success");
  } catch (error) {
      res.status(404).send("Got error while setting donation status: " + error.message)
  }

}

module.exports.verifyDonation = async function (req, res) {
  const { receiverId, uniqueKey} = req.body;
  try {
    const item = await DONATION_MODAL.find({
      uniqueKey : uniqueKey,
      })
    if (!item || item.length === 0 || item.receiverId !== receiverId) {
        throw new Error('Unable to verify donation')
    }
    res.status(200).send("success");
  } catch (error) {
    res.status(401).send(error.message);
  }
} ;

