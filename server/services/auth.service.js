const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const { generateToken, sendTokenCookie } = require("../utils/generateToken");






const registerUser = async ({ name, email, password, role = "buyer" }) => {

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken({ userId: user._id, role: user.role });


  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, token };
};






const loginUser = async ({ email, password }) => {

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }
  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Contact support.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = generateToken({ userId: user._id, role: user.role });

  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, token };
};





const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate("wishlist", "title price images averageRating")
    .lean();
  if (!user) throw new ApiError(404, "User not found.");
  return user;
};






const updateProfile = async (userId, updates) => {

  const forbidden = ["role", "password", "isVendorApproved", "isActive"];
  forbidden.forEach((f) => delete updates[f]);

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, "User not found.");
  return user;
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };
