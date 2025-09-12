// const router = require('express').Router()
// const UserController = require('../controllers/user.controller')
// const FileUploader = require('../helper/fileUpload')
// const fileUploader = new FileUploader({
//     folderName : "uploads/profile",
//         supportedFiles : ["image/png", "image/jpg", "image/jpeg"],
//         fileSize : 1024 * 1024 * 2, // renamed from fieldSize
// })
// const authCheck = require('../middlewares/auth.middleware')()
// const roleCheck = require('../middlewares/role.middleware')

// // router.get('/profile-details',authCheck.authenticateAPI,UserController.profileDetails)
// // router.get('/users',authCheck.authenticateAPI,roleCheck('admin'),UserController.getAllUsers)
// // router.get('/edit',authCheck.authenticateAPI,UserController.getSpecificUser)
// // router.get('/delete/:id',authCheck.authenticateAPI,UserController.deleteUser)
// // 
// router.get('/profile-details',authCheck.authenticateAPI,UserController.profileDetails)
// router.get('/users',authCheck.authenticateAPI,UserController.getAllUsers)
// router.get('/edit',authCheck.authenticateAPI,UserController.getSpecificUser)
// router.post('/update',fileUploader.upload().single("profilePic"),authCheck.authenticateAPI,UserController.updateUserData)
// router.get('/delete',authCheck.authenticateAPI,UserController.deleteUser)

// module.exports = router

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { upload, uploadToCloudinary } = require('../helper/cloudinaryUploader');
const authCheck = require('../middlewares/auth.middleware')();

router.get('/profile-details', authCheck.authenticateAPI, UserController.profileDetails);
router.get('/users', authCheck.authenticateAPI, UserController.getAllUsers);
router.get('/edit', authCheck.authenticateAPI, UserController.getSpecificUser);

router.post('/update', upload.single('profilePic'), authCheck.authenticateAPI, async (req, res, next) => {
  try {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'profile-pics');
      console.log("result ",result);
      
      req.body.profilePic = result.secure_url;
    }
    await UserController.updateUserData(req, res);
  } catch (err) {
    return res.status(500).json({ message: 'Upload failed' });
  }
});

router.get('/delete', authCheck.authenticateAPI, UserController.deleteUser);

module.exports = router;