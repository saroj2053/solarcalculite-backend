const User = require("../schemas/UserSchema");
const Project = require("../schemas/ProjectSchema");
const sendToken = require("../utils/jwtToken");
const validator = require("validator");

exports.getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, username, email } = req.body;
  const id = req.user.id;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  if (username.length < 6) {
    return res
      .status(400)
      .json({ message: "Username length should be atleast 6 characters." });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Please provide valid email" });
  }

  try {
    const updatedProfile = await User.findByIdAndUpdate(
      id,
      {
        name,
        username,
        email,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    res.status(200).json({
      status: "success",
      message: "Profile Updated Successfully",
      user: updatedProfile,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteProfile = async (req, res) => {
  const id = req.user.id;
  try {
    const projects = await Project.find({ author: id });

    await User.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Profile Deleted Successfully",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "You should login first",
    });
  }

  const isPasswordMatched = await user.comparePassword(
    req.body.oldPassword,
    user.password
  );

  if (!isPasswordMatched) {
    return res.status(400).json({
      status: "fail",
      message: "Old password is incorrect",
    });
  }
  if (!req.body.newPassword) {
    return res.status(400).json({ message: "New Password is required" });
  }
  if (!req.body.confirmPassword) {
    return res.status(400).json({ message: "Confirm Password is required" });
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return res.status(400).json({
      message: "Passwords doesn't match",
    });
  }

  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();

  sendToken(res, 200, user);
};
