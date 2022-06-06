let getTokenData = require("../services/JwtToken").getTokenData;
const USER_MODAL = require("../modals").userModal;
module.exports = async (req, res) => {
    console.log(req.body);
    let avatarPath = req.file?.path
    let { _id} = await getTokenData(req.cookies.token);
    let { acknowledged} = await USER_MODAL.updateOne({_id: _id},{
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        avatarPath: avatarPath,
        address: {
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            streetAddress: req.body.address,
            zipcode: req.body.zipcode
        }

    });
    if(acknowledged){
        res.status(200).json({
            status: 'success'
        })
    }else{
        res.state(500).json({
            status: 'Failed',
            message: 'Something went wrong while updating profile. Please try again ...'
        })
    }
}