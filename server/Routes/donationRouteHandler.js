
const DONATION_MODAL = require("../modals").donationModal;
let getTokenData = require("../services/JwtToken").getTokenData;
module.exports = async (req, res) =>{
    let imagesPath = req.files.map(file => file.path);
    let cookieData = await getTokenData(req.cookies.token);
    let donation = new DONATION_MODAL({
      itemTitle: req.body.title,
      itemDescription: req.body.description,
      itemCategory: req.body.category,
      itemSubCategory: req.body.subcategory,
      images: imagesPath,
      contactInfo: cookieData._id
    });
    donation.save();
    res.json({"Status": "Success", "Message": "Successfully Uploaded"});
  
  };