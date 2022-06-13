
const DONATION_MODAL = require("../modals").donationModal;
let getTokenData = require("../services/JwtToken").getTokenData;
module.exports.post = async (req, res) =>{
    let imagesPath = req.files.map(file => file.path);
    let cookieData = await getTokenData(req.cookies.token);
    let donation = new DONATION_MODAL({
      itemTitle: req.body.title,
      itemDescription: req.body.description,
      itemCategory: req.body.category,
      itemSubCategory: req.body.subcategory,
      images: imagesPath,
      createdAt: Date.now(),
      contactInfo: cookieData._id
    });
    donation.save();
    res.json({"Status": "Success", "Message": "Successfully Uploaded"});
  
  };

  module.exports.get = async function(req, res) {
    let data = await DONATION_MODAL.find().populate('contactInfo');
    // data.address = data.contactInfo.address;
    // delete data.contactInfo;
    res.status(200).json({
      status: "OK",
      data: data
    });
  }