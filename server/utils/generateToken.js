const jwt = require("jsonwebtoken");






const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};






const sendTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",


    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES || "7", 10) * 24 * 60 * 60 * 1000,
  };
  res.cookie("token", token, cookieOptions);
};

module.exports = { generateToken, sendTokenCookie };
