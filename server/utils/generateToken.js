const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT token for a user.
 * @param {object} payload - Data to embed (userId, role)
 * @returns {string} Signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Attaches JWT as an HTTP-only cookie to the response.
 * @param {import("express").Response} res
 * @param {string} token - Signed JWT
 */
const sendTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES || "7", 10) * 24 * 60 * 60 * 1000,
  };
  res.cookie("token", token, cookieOptions);
};

module.exports = { generateToken, sendTokenCookie };
