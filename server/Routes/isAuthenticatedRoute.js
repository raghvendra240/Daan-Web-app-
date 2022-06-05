let getTokenData = require("../services/JwtToken").getTokenData;
const modals = require("../modals");
const USER_MODAL = modals.userModal;

module.exports = async (req,res) => {
    let tokenData = await getTokenData(req.cookies.token);
    let isAuthenticated  = false;
    if(tokenData && tokenData.isAuthenticated) isAuthenticated = true;
    if(isAuthenticated == false){
        res.json({
            status: "Failed",
            isAuthenticated: isAuthenticated,
        });
        return;
    }
    let _id = tokenData._id;
    let userData = await  USER_MODAL.find({ _id: _id});
    res.status(200).json({
        status: "Success",
        isAuthenticated: isAuthenticated,
        data: userData[0]
    })
}