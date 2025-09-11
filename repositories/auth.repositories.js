const UserModel = require("../models/user.model");
class AuthRepository {
    // create user
    async createuser(userdata) {
        try {
            return await UserModel.create(userdata);
        } catch (error) {
            console.log(
                `error in signup of authrepo due to :${error.message} `
            );
        }
    }
    // email exists or not
    async emailExists(email) {
        try {
            return await UserModel.findOne({
                email,
                isDeleted: false,
            });
        } catch (error) {
            console.log(
                `error in emailexists of authrepo due to :${error.message} `
            );
        }
    }
    // find user by id
    async findById(userID) {
        try {
            return await UserModel.findById(userID).select(
                "-password -_id -isDeleted -createdAt -updatedAt"
            );
        } catch (error) {
            throw error;
        }
    }
    // find user by email
    async findOne(email) {
        try {
            return await UserModel.findOne({ email, isDeleted: false }).select(
                "+password"
            );
        } catch (error) {
            throw error;
        }
    }
    // update password
    async updatePassword(email, hashedPassword) {
        try {
            return await UserModel.updateOne(
                {
                    email: email,
                },
                { $set: { password: hashedPassword } }
            );
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new AuthRepository();
