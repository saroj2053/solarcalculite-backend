const mongoose = require("mongoose");
const { Product } = require("../schemas/ProductSchema");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    images: [
      {
        url: String,
        filename: String,
      },
    ],
    description: String,
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
