var jwt = require('jsonwebtoken');

module.exports.createToken = async (_id) => {
    const token = await jwt.sign({
      _id: _id,
      isAuthenticated: true,
    }, process.env.COOKIE_KEY);
    return token;
}

module.exports.getTokenData = async (token) => {
  try {
    let decoded = await jwt.verify(token, process.env.COOKIE_KEY);
    return decoded;
  }catch{
    return null;
  }
}