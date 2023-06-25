const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/", productController.createProduct);

router.delete("/:id", productController.deleteProduct);

router.put("/:id", productController.updateProduct);

router.get(
  "/:id",
  authController.isAuthenticatedUser,
  productController.getSingleProductData
);

module.exports = router;
