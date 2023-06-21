const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    ownedByCompany: {
      type: String,
      default: "",
    },
    peekPower: {
      type: Number,
      required: true,
    },
    area: {
      type: Number,
      required: true,
    },
    orientation: {
      type: String,
      enum: ["N", "S", "E", "W"],
      required: true,
    },
    lon: {
      type: String,
      required: true,
    },
    lat: {
      type: String,
      required: true,
    },
    tilt: {
      type: Number,
      enum: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
      required: true,
    },

    // project: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Project",
    // },

    isReadOnly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
const Template = mongoose.model("Template", productSchema);

module.exports = {
  Product: Product,
  Template: Template,
};