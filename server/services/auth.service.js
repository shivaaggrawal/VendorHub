const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const { generateToken, sendTokenCookie } = require("../utils/generateToken");

/**
 * Registers a new user.
 * @param {{ name, email, password, role }} data
 * @returns {{ user, token }}
 */
const registerUser = async ({ name, email, password, role = "buyer" }) => {
  // Check duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken({ userId: user._id, role: user.role });

  // Return safe user object (no password)
  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, token };
};

/**
 * Logs in a user.
 * @param {{ email, password }} data
 * @returns {{ user, token }}
 */
const loginUser = async ({ email, password }) => {
  // Explicitly select password (it's select:false in schema)
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

/**
 * Returns the current authenticated user's profile.
 * @param {string} userId
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate("wishlist", "title price images averageRating")
    .lean();
  if (!user) throw new ApiError(404, "User not found.");
  return user;
};

/**
 * Updates profile fields (name, storeName, vendorLocation, etc.)
 * @param {string} userId
 * @param {object} updates
 */
const updateProfile = async (userId, updates) => {
  // Prevent role/password change via this route
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
