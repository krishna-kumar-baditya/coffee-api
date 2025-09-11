const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
// Define the User Schema
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Firstname is required"],
      trim: true,
      minlength: [2, "Firstname must be at least 2 characters"],
      maxlength: [10, "Firstname cannot exceed 10 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Lastname is required"],
      trim: true,
      minlength: [2, "Lastname must be at least 2 characters"],
      maxlength: [10, "Lastname cannot exceed 10 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    age: {
      type: Number,
      min: [0, "Age must be a positive number"],
      max: [150, "That age seems unrealistic"],
    },
    profilePic: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "user"],
        message: "{VALUE} is not a valid role",
      },
      default: "user",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdminDeleted :{
        type : Boolean,
        default : false
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
UserSchema.methods.generateHash = async(password)=>{
    return bcrypt.hashSync(password,bcrypt.genSaltSync(8,null))
}
UserSchema.methods.validPassword = async(inputPassword,storedHashPassword)=>{
    return bcrypt.compareSync(inputPassword,storedHashPassword)

}
// Optional: Indexing
// UserSchema.index({ email: 1 });
UserSchema.plugin(aggregatePaginate)
const UserModel = new mongoose.model("user", UserSchema);
module.exports = UserModel;
