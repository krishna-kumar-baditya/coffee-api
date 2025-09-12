// helper/cloudinaryUploader.js

const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Multer storage: Keep files in memory (no disk)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${allowedTypes.join(", ")} allowed.`), false);
    }
  },
});

// Upload buffer to Cloudinary and return Promise
const uploadToCloudinary = (fileBuffer, folderName = "uploads") => {
  return new Promise((resolve, reject) => {
    // Optional: Validate buffer size (Cloudinary allows up to 100MB, but 5MB is safe)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      return reject(new Error("File too large. Max 5MB allowed."));
    }

    // Use the correctly configured cloudinary instance
    cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "image",
        transformation: [
          { width: 800, height: 800, crop: "fill" }, // optional optimization
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result);
      }
    ).end(fileBuffer); // 👈 IMPORTANT: Call .end() with the buffer
  });
};

module.exports = {
  upload,
  uploadToCloudinary,
};