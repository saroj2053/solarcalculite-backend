const express = require("express");
const templateController = require("../controllers/templateController");

const router = express.Router();

router
  .route("/")
  .post(templateController.createTemplate)
  .get(templateController.getAllTemplateProducts);

module.exports = router;
