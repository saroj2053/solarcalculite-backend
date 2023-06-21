const { Template } = require("../schemas/ProductSchema");

exports.createTemplate = async (req, res) => {
  const {
    productName,
    ownedByCompany,
    peekPower,
    area,
    orientation,
    lat,
    lon,
    tilt,
  } = req.body;
  if (!productName) {
    return res.status(400).json({ message: "Product Name is required" });
  }
  if (!peekPower) {
    return res.status(400).json({ message: "Product Peek Power is required" });
  }
  if (!area) {
    return res.status(400).json({ message: "Area is required" });
  }
  if (!orientation) {
    return res.status(400).json({ message: "Orientation is required" });
  }
  if (!lat) {
    return res.status(400).json({ message: "Latitude is required" });
  }
  if (!lon) {
    return res.status(400).json({ message: "Longitude is required" });
  }
  if (!tilt) {
    return res.status(400).json({ message: "Tilt is required" });
  }

  const templateProduct = new Template({
    productName,
    ownedByCompany,
    peekPower,
    area,
    orientation,
    lat,
    lon,
    tilt,
  });

  await templateProduct.save();

  res.status(201).json({
    status: "success",
    message: "New Template Product is being created",
    product: templateProduct,
  });
};

exports.getAllTemplateProducts = async (req, res) => {
  try {
    const templateProducts = await Template.find({});
    if (templateProducts) {
      res.status(200).json({
        status: "success",
        templates: templateProducts.length,
        templateProducts: templateProducts,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
