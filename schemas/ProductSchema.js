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
    peakPower: {
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

    solarCalculiteResults: [
      {
        date: String,
        solar_irradiance: Number,
        sun_hours: Number,
        electricity_produced: Number,
        product_location: String,
        country_code: String,
      },
    ],

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
