const { validationResult } = require("express-validator");
const authService = require("../services/auth.service");
const { sendTokenCookie } = require("../utils/generateToken");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");




const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, "Validation failed", errors.array());
  }
};


const register = asyncHandler(async (req, res) => {
  validate(req);
  const { name, email, password, role } = req.body;
  const { user, token } = await authService.registerUser({ name, email, password, role });

  sendTokenCookie(res, token);
  return new ApiResponse(201, "Account created successfully.", { user, token }).send(res);
});


const login = asyncHandler(async (req, res) => {
  validate(req);
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });

  sendTokenCookie(res, token);
  return new ApiResponse(200, "Login successful.", { user, token }).send(res);
});


const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  return new ApiResponse(200, "Logged out successfully.").send(res);
});


const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  return new ApiResponse(200, "Profile fetched.", user).send(res);
});


const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  return new ApiResponse(200, "Profile updated.", user).send(res);
});


const toggleWishlist = asyncHandler(async (req, res) => {
  const User = require("../models/User.model");
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  const idx = user.wishlist.findIndex((id) => id.toString() === productId);
  let message;
  if (idx === -1) {
    user.wishlist.push(productId);
    message = "Added to wishlist.";
  } else {
    user.wishlist.splice(idx, 1);
    message = "Removed from wishlist.";
  }
  await user.save();
  return new ApiResponse(200, message, { wishlist: user.wishlist }).send(res);
});

module.exports = { register, login, logout, getMe, updateMe, toggleWishlist };
