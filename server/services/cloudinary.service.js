const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");

/**
 * Uploads a buffer (from Multer memory storage) to Cloudinary.
 * @param {Buffer} fileBuffer - File buffer from req.file.buffer
 * @param {string} folder     - Cloudinary folder name
 * @returns {Promise<{public_id: string, url: string}>}
 */
const uploadToCloudinary = (fileBuffer, folder = "marketplace") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(500, `Cloudinary upload failed: ${error.message}`));
        } else {
          resolve({ public_id: result.public_id, url: result.secure_url });
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Uploads multiple buffers concurrently.
 * @param {Express.Multer.File[]} files  - Array of Multer file objects
 * @param {string}                folder - Cloudinary folder
 * @returns {Promise<Array<{public_id, url}>>}
 */
const uploadMultipleToCloudinary = async (files, folder = "marketplace/products") => {
  const uploads = files.map((file) => uploadToCloudinary(file.buffer, folder));
  return Promise.all(uploads);
};

/**
 * Deletes an image from Cloudinary by public_id.
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Non-fatal: log but don't throw
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, error.message);
  }
};

module.exports = { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary };
