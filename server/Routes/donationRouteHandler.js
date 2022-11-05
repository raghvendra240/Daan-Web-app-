const DONATION_MODAL = require("../modals").donationModal;
let getTokenData = require("../services/JwtToken").getTokenData;
module.exports.post = async (req, res) => {
  let imagesPath = req.files.map((file) => file.path);
  let cookieData = await getTokenData(req.cookies.token);
  let donation = new DONATION_MODAL({
    itemTitle: req.body.title,
    itemDescription: req.body.description,
    itemCategory: req.body.category,
    itemSubCategory: req.body.subcategory,
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
