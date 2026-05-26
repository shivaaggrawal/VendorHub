const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");


const isCloudinaryDummy = () =>
  !process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME === "dummycloud" ||
  !process.env.CLOUDINARY_API_KEY ||
  process.env.CLOUDINARY_API_KEY === "123456789";







const uploadToCloudinary = (fileBuffer, folder = "marketplace") => {
  if (isCloudinaryDummy()) {
    return Promise.reject(
      new ApiError(
        503,
        "Image uploads are not configured. Please set real CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables."
      )
    );
  }
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







const uploadMultipleToCloudinary = async (files, folder = "marketplace/products") => {
  const uploads = files.map((file) => uploadToCloudinary(file.buffer, folder));
  return Promise.all(uploads);
};





const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {

    console.error(`Failed to delete Cloudinary asset ${publicId}:`, error.message);
  }
};

module.exports = { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary };
