const router = require('express').Router()
const AuthController = require('../controllers/auth.controller')
const FileUploader = require('../helper/fileUpload')
const fileUploader = new FileUploader({
    folderName : "uploads/profile",
        supportedFiles : ["image/png", "image/jpg", "image/jpeg"],
        fileSize : 1024 * 1024 * 2, // renamed from fieldSize
})


router.post('/signup',fileUploader.upload().single("profilePic"),AuthController.signup)
router.post('/signin',AuthController.signin)
router.post('/forget-password',AuthController.forgetPassword)

module.exports = router