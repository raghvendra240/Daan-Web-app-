let getTokenData = require("../services/JwtToken").getTokenData;

module.exports = async (req,res) => {
    let tokenData = await getTokenData(req.cookies.token);
    let isAuthenticated  =false;
    if(tokenData && tokenData.isAuthenticated) isAuthenticated = true;
    res.status(200).send(isAuthenticated)
}