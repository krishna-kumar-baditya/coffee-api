const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { upload, uploadToCloudinary } = require("../helper/cloudinaryUploader");

// Handle profile pic upload during signup
router.post("/signup", upload.single("profilePic"), async (req, res, next) => {
    try {
        // ✅ FIXED: Check if file exists (not .length)
        if (req.file) {
            try {
                const result = await uploadToCloudinary(
                    req.file.buffer,
                    "profile-pics"
                );
                console.log("Cloudinary upload result:", result);

                req.body.profilePic = result.secure_url; // Save URL to body
            } catch (error) {
                console.error("Cloudinary upload failed:", error.message);
                return res.status(500).json({ 
                    message: "Profile picture upload failed. Please try again." 
                });
            }
        }

        await AuthController.signup(req, res);
    } catch (err) {
        console.error("Unexpected error in signup route:", err.message);
        return res.status(500).json({ 
            message: "Internal server error during signup." 
        });
    }
});

router.post("/signin", AuthController.signin);
router.post("/forget-password", AuthController.forgetPassword);

module.exports = router;