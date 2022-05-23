const otpGenerator = require("otp-generator");
const OTP_LENGTH = 6;
let OTP_CONFIG = {
  lowerCaseAlphabets: false,
  upperCaseAlphabets: false,
  specialChars: false,
};
module.exports = () => {
//   const OTP = otpGenerator.generate(OTP_LENGTH, OTP_CONFIG);
//   return OTP;
 return otpGenerator.generate(OTP_LENGTH, OTP_CONFIG);
};
