const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/profile")
  .get(authController.isAuthenticatedUser, userController.getProfileById);

router
  .route("/profile/update")
  .patch(authController.isAuthenticatedUser, userController.updateProfile);

router
  .route("/profile/delete")
  .get(authController.isAuthenticatedUser, userController.deleteProfile);

module.exports = router;
