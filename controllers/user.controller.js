const UserRepository = require("../repositories/user.repositories");
const { updateUserSchema } = require("../validators/user.validator");
const UserModel = require("../models/user.model");
class UserController {
    async profileDetails(req, res) {
        try {
            const user = req.user;
            const userWithoutSensitiveData = await UserRepository.findById(
                user._id
            );

            return res.status(200).send({
                status: 200,
                data: userWithoutSensitiveData,
                message: "User profile details fetched successfully!",
            });
        } catch (error) {
            console.log(
                `error in profileDetails of usercontroller due to : ${error.message} `
            );
            return res.status(500).send({
                status: 500,
                data: {},
                message: error.message || error,
            });
        }
    }
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 5 } = req.query;
            const allUsersData = await UserRepository.getAllUsers(page, limit);
            console.log("allUsersData ", allUsersData);
            if (allUsersData) {
                return res.status(200).send({
                    status: 200,
                    data: allUsersData,
                    message: "All users data fetched successfully",
                });
            }
        } catch (error) {
            console.log(
                `error in getAllUsers of usercontroller due to : ${error.message} `
            );
            return res.status(500).send({
                status: 500,
                data: {},
                message: error.message || error,
            });
        }
    }
    // async getSpecificUser(req, res) {
    //     try {
    //         const user = req.user;
    //         console.log("user ", user);
    //         const data = await UserRepository.findById(user._id);
    //         if (data) {
    //             return res.status(200).send({
    //                 status: 200,
    //                 data: data,
    //                 message: "User data fetch successfully",
    //             });
    //         }
    //     } catch (error) {
    //         console.log(
    //             `error in getSpecificUser of usercontroller due to : ${error.message} `
    //         );
    //         return res.status(500).send({
    //             status: 500,
    //             message: error.message || error,
    //         });
    //     }
    // }
    async getSpecificUser(req, res) {
        try {
            const user = req.user;

            console.log(user._id);
            const data = await UserRepository.findById(user._id);
            if (data) {
                return res.status(200).send({
                    status: 200,
                    data: data,
                    message: "Specific User data fetch successfully",
                });
            }
        } catch (error) {
            console.log(
                `error in getSpecificUser of usercontroller due to : ${error.message} `
            );
            return res.status(500).send({
                status: 500,
                message: error.message || error,
            });
        }
    }
    async updateUserData(req, res) {
        try {
            const user = req.user;
            const { error, value } = updateUserSchema.validate(req.body, {
                abortEarly: false,
            });
            if (error) {
                const message = error.details.map((detail) => detail.message);
                return res.status(400).send({
                    status: 400,
                    data: {},
                    message: message,
                });
            }

            const { email, password, firstName, lastName, age, role } =
                value ?? {};
            const hashedPassword = await new UserModel().generateHash(password);
            const profilePic = req.body.profilePic;

            // Fetch current user to get old profilePic
            const currentUser = await UserRepository.findById(user._id);
            if (!currentUser) {
                return res.status(404).send({
                    status: 404,
                    message: "User not found",
                });
            }

            // Check if email exists (excluding current user)
            const isEmailExists = await UserRepository.emailExists(
                email,
                user._id
            );
            if (isEmailExists) {
                return res.status(400).send({
                    status: 400,
                    data: {},
                    message: "Email is already taken",
                });
            }

            // Delete old profile pic from Cloudinary if new one is provided
            if (profilePic && currentUser.profilePic) {
                try {
                    const publicId = currentUser.profilePic
                        .split("/image/upload/")
                        .pop()
                        .split(".")[0];

                    await cloudinary.uploader.destroy(publicId);
                    console.log("✅ Deleted old profile pic:", publicId);
                } catch (err) {
                    console.warn("⚠️ Failed to delete old image:", err.message);
                }
            }

            const userObj = {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                age,
                role,
                profilePic,
            };

            const updatedData = await UserRepository.updateUserData(
                user._id,
                userObj
            );

            return res.status(200).send({
                status: 200,
                data: updatedData,
                message: "Update successful",
            });
        } catch (error) {
            console.error(`Error in updateUserData: ${error.message}`);
            return res.status(500).send({
                status: 500,
                message: "Internal server error",
            });
        }
    }
    async deleteUser(req, res) {
        try {
            const user = req.user;

            console.log(user._id);

            const data = await UserRepository.deleteUser(user._id);
            console.log("deleted data ", data);

            if (data) {
                return res.status(200).send({
                    status: 200,
                    data: user._id,
                    message: "data deleted successfully",
                });
            }
        } catch (error) {
            console.log(
                `error in deleteUser of usercontroller due to : ${error.message} `
            );
            return res.status(500).send({
                status: 500,
                message: error.message || error,
            });
        }
    }
}
module.exports = new UserController();
