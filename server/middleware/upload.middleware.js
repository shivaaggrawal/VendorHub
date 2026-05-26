const multer = require("multer");
const path = require("path");
const ApiError = require("../utils/ApiError");


const storage = multer.memoryStorage();


const fileFilter = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new ApiError(400, "Only image files are allowed (jpeg, jpg, png, webp, gif)."));
};


const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});





const uploadSingle = upload.single("image");





const uploadMultiple = upload.array("images", 5);

module.exports = { uploadSingle, uploadMultiple, upload };
