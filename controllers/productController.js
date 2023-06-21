const { Product } = require("../schemas/ProductSchema");
const Project = require("../schemas/ProjectSchema");

exports.createProduct = async (req, res) => {
  const {
    productName,
    area,
    peekPower,
    orientation,
    tilt,
    lon,
    lat,
    projectId,
  } = req.body;

  if (!productName) {
    return res.status(400).json({ message: "Product Name is required" });
  }
  if (!area) {
    return res.status(400).json({ message: "Area is required" });
  }
  if (!peekPower) {
    return res.status(400).json({ message: "Peek Power is required" });
  }
  if (!orientation) {
    return res.status(400).json({ message: "Orientation is required" });
  }
  if (!tilt) {
    return res
      .status(400)
      .json({ message: "Angle of inclination is required" });
  }
  if (!lon) {
    return res.status(400).json({ message: "Longitude is required" });
  }
  if (!lat) {
    return res.status(400).json({ message: "Latitude is required" });
  }

  try {
    const product = new Product({
      productName,
      area,
      peekPower,
      orientation,
      tilt,
      lon,
      lat,
    });

    const newProduct = await product.save();

    const associatedProject = await Project.findById(projectId);

    associatedProject.products.push(newProduct._id);

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      associatedProject,
      {
        new: true,
      }
    );

    res.status(201).json({
      status: "success",
      message: "Product has been created successfully",
      updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { productName, area, peekPower, orientation, tilt, lon, lat } =
    req.body;

  try {
    const newValues = {
      productName,
      area,
      peekPower,
      orientation,
      tilt,
      lon,
      lat,
    };

    console.log(newValues);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      newValues,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      message: "Successfully updated product",
      updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const retrievedProject = await Project.findOne({
      products: productId,
    }).populate("products");

    if (!retrievedProject) {
      return res.status(400).json({
        status: "error",
        message: "Project not found",
      });
    }

    const newProductsList = retrievedProject.products.filter(
      prd => prd._id.toString() !== productId
    );

    console.log(newProductsList);

    const updatedProject = await Project.findByIdAndUpdate(
      retrievedProject._id,
      { products: newProductsList },
      { new: true }
    );

    await Product.findByIdAndDelete(productId);

    res.status(200).json({
      status: "success",
      message: "Successfully deleted a product",
      updatedProject,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: err.message,
    });
  }
};
