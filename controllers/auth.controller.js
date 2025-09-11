const AuthRepository = require("../repositories/auth.repositories");
const { signupSchema, signinSchema } = require("../validators/auth.validator");
const UserModel = require("../models/user.model");
const Mailer = require("../helper/mailer");
const FileDeleter = require("../helper/deletefile");
const fileDeleter = new FileDeleter("uploads/profile");

const jwt = require("jsonwebtoken");
class AuthController {
    async signup(req, res) {
        try {
            const { error, value } = signupSchema.validate(req.body, {
                abortEarly: false,
            });
            if (error) {
                const messages = error.details.map((detail) => detail.message);
                fileDeleter.deleteSingle(req.file.filename);

                return res.status(400).send({
                    staus: 400,
                    data: {},
                    message: messages,
                });
            }
            const { email, password, firstName, lastName, age, role } = value;
            const hashedPassword = await new UserModel().generateHash(password);
            const profilePic = req.file ? req.file.filename : null;
            // Check if email exists
            const isEmailExists = await AuthRepository.emailExists(email);
            if (isEmailExists) {
                fileDeleter.deleteSingle(profilePic);
                return res.status(400).send({
                    status: 400,
                    data: {},
                    message: "Email is already taken",
                });
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

            const newUser = await AuthRepository.createuser(userObj);
            if (newUser) {
                fileDeleter.deleteSingle(profilePic);

                const mailer = new Mailer(
                    "Gmail",
                    process.env.APP_EMAIL,
                    process.env.APP_PASSWORD
                );
                const mailObj = {
                    to: email,
                    subject: "Registration Confirmation",
                    text: `You have successfully registered with us with ${email} email id. Thank You!!!`,
                };
                await mailer.sendMail(mailObj);
                const userWithoutSensitiveData = await AuthRepository.findById(
                    newUser._id
                );
                return res.status(200).send({
                    status: 200,
                    data: userWithoutSensitiveData,
                    message: "Registration successfully completed!",
                });
            } else {
                fileDeleter.deleteSingle(profilePic);

                return res.status(400).send({
                    status: 400,
                    data: {},
                    message: "Something went wrong during registration",
                });
            }
        } catch (error) {
            console.log(
                `error in signup of authcontroller due to :${error.message} `
            );
            fileDeleter.deleteSingle(req.file.filename);

            return res.status(500).send({
                status: 500,
                data: {},
                message: err.message || err,
            });
        }
    }
    async signin(req, res) {
        try {
            const { error, value } = signinSchema.validate(req.body, {
                abortEarly: false,
            });
            if (error) {
                const messages = error.details.map((detail) => detail.message);
                return res.status(400).send({
                    staus: 400,
                    data: {},
                    message: messages,
                });
            }
            const { email, password } = value;
            const user = await AuthRepository.findOne(email);
            if (!user) {
                return res.status(401).send({
                    status: 401,
                    data: {},
                    message: "Authentication failed. Invalid credentials.",
                });
            }
            const isPasswordValid = await UserModel().validPassword(
                password,
                user.password
            );
            if (!isPasswordValid) {
                return res.status(401).send({
                    status: 401,
                    data: {},
                    message: "Authentication failed. Invalid credentials.",
                });
            }
            const payload = { id: user._id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "1H",
            });
            const userWithoutSensitiveData = await AuthRepository.findById(
                user._id
            );

            return res.status(200).send({
                status: 200,
                data: userWithoutSensitiveData,
                token,
                message: "Signin successfully completed!",
            });
        } catch (error) {
            console.log(
                `error in signin of authcontroller due to : ${error.message} `
            );
            return res.status(500).send({
                status: 500,
                data: {},
                message: error.message || error,
            });
        }
    }
    async forgetPassword(req, res) {
        try {
            const { error, value } = signinSchema.validate(req.body, {
                abortEarly: false,
            });
            if (error) {
                const messages = error.details.map((detail) => detail.message);
                return res.status(400).send({
                    staus: 400,
                    data: {},
                    message: messages,
                });
            }
            const { email, password } = value;
            const isUserExists = await AuthRepository.findOne(email);
            if (!isUserExists) {
                return res.status(400).send({
                    status: 200,
                    message: "User is not exists",
                });
            }
            const hashedPassword = await new UserModel().generateHash(password);
            // update user password in database
            const data = await AuthRepository.updatePassword(
                email,
                hashedPassword
            );
            const mailer = new Mailer(
                "Gmail",
                process.env.APP_EMAIL,
                process.env.APP_PASSWORD
            );
            const mailObj = {
                to: email,
                subject: "Password chnaged",
                text: `Your password updated successfully`,
            };
            await mailer.sendMail(mailObj);
            if (data) {
                return res.status(200).send({
                    status: 200,
                    message: "User password is updated",
                });
            }
        } catch (error) {
            console.log(
                `error in forgetPassword of authcontroller due to : ${error.message} `
            );
            return res.status(500).send({
                status: 500,
                data: {},
                message: error.message || error,
            });
        }
    }
}
module.exports = new AuthController();
