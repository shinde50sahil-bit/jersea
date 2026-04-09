const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { ApiError } = require("../utils/apiError");

const uploadRootDir = path.resolve(__dirname, "..", "..", "uploads");
const productUploadDir = path.join(uploadRootDir, "products");

fs.mkdirSync(productUploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif"
]);

const storage = multer.diskStorage({
  destination(req, file, callback) {
    void req;
    void file;
    callback(null, productUploadDir);
  },
  filename(req, file, callback) {
    void req;

    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = extension || ".jpg";
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    callback(null, `${uniqueSuffix}${safeExtension}`);
  }
});

const uploadProductImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter(req, file, callback) {
    void req;

    if (allowedMimeTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(
      new ApiError(400, "Only JPG, PNG, WEBP, GIF, and AVIF images are allowed")
    );
  }
});

module.exports = {
  uploadProductImage,
  uploadRootDir
};
