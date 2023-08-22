const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authController = require("../controllers/authController");
const { storage } = require("../cloudinary/index");
const multer = require("multer");
const upload = multer({ storage });

router
  .route("/")
  .get(authController.isAuthenticatedUser, projectController.getAllProjects)
  .post(
    authController.isAuthenticatedUser,
    upload.array("files"),
    projectController.createProject
  );

router
  .route("/:id")
  .get(authController.isAuthenticatedUser, projectController.showProject)
  .patch(authController.isAuthenticatedUser, projectController.updateProject)
  .delete(authController.isAuthenticatedUser, projectController.deleteProject);

router.get(
  "/:id/generateReport",
  authController.isAuthenticatedUser,
  projectController.calcElectricityGeneratedByProject
);

module.exports = router;
