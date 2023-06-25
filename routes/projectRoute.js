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

// .post(upload.array("files"), (req, res) => {
//   console.log(req.body, req.files);
// });

router
  .route("/:id")
  .get(authController.isAuthenticatedUser, projectController.showProject)
  .patch(authController.isAuthenticatedUser, projectController.updateProject)
  .delete(authController.isAuthenticatedUser, projectController.deleteProject);

router.get(
  "/:id/generateReport",
  authController.isAuthenticatedUser,
  projectController.generateProjectReport
);

module.exports = router;
