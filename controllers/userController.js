const User = require("../schemas/UserSchema");
const Project = require("../schemas/ProjectSchema");
const { Product } = require("../schemas/ProductSchema");
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
    const projects = await Project.find({ author: id }).populate("products");
    for (let project of projects) {
      for (let product of project.products) {
        await Product.findByIdAndDelete(product._id);
      }
      await Project.findByIdAndDelete(project._id);
    }

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
