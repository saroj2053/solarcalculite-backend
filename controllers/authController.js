const User = require("../schemas/UserSchema");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/jwtToken");
const { promisify } = require("util");

exports.signup = async (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Please provide a valid email" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password should be atleast 8 characters long" });
  }

  if (!confirmPassword) {
    return res.status(400).json({ message: "Confirm Password is required" });
  }

  const isMatch = password === confirmPassword;

  if (!isMatch) {
    return res.status(400).json({ message: "Passwords doesn't match" });
  }

  const checkIfUserAlreadyExists = await User.findOne({ email: email });
  console.log(checkIfUserAlreadyExists);
  if (checkIfUserAlreadyExists) {
    return res.status(400).json({
      message: "User already exists. Please login or create new account",
    });
  }

  const user = {
    name,
    username,
    email,
    password,
    confirmPassword,
  };

  try {
    const newUser = await User.create(user);

    sendToken(res, 201, newUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Please provide a valid email" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password should be atleast 8 characters long" });
  }

  try {
    const user = await User.findOne({ email: email }).select("+password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user exists with that email id.",
      });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // user.password = undefined;

    // if (user && isPasswordMatched) {
    //   return res.status(200).json({
    //     status: "success",
    //     message: "You are successfully logged in.",
    //     user,
    //     auth: true,
    //   });
    // }

    return sendToken(res, 200, user);
  } catch (err) {
    console.log(err);
  }
};

exports.signout = async (req, res, next) => {
  console.log(req.cookies);
  try {
    res.cookie("jwt", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in! Please login to continue",
      });
    }

    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );

    const user = await User.findById(decoded.id);

    req.user = user;

    console.log(req.user);

    next();
  } catch (err) {
    console.log(err);
  }
};
