const Project = require("../schemas/ProjectSchema");
const { cloudinary } = require("../cloudinary/index");
const { Product, Template } = require("../schemas/ProductSchema");

exports.getAllProjects = async (req, res) => {
  console.log(req.user);
  const id = req.user.id;
  try {
    const projects = await Project.find({ author: id }).sort({ createdAt: -1 });
    console.log(projects);
    if (projects) {
      res.status(200).json({
        projects,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.createProject = async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ message: "Project title is required" });
  }
  if (!req.body.description) {
    return res.status(400).json({ message: "Project description is required" });
  }
  if (!req.files.map(f => ({ url: f.path, filename: f.filename }))) {
    return res
      .status(400)
      .json({ message: "Please include atleast one image" });
  }

  if (!req.body.product) {
    return res.status(400).json({
      message: "Please include atleast one of the predefined products",
    });
  }
  const temp_project = {
    title: req.body.title,
    description: req.body.description,
    author: req.user.id,
    images: req.files.map(f => ({ url: f.path, filename: f.filename })),
    products: [],
  };

  const newProject = await Project.create(temp_project);

  const prod = JSON.parse(req.body.product);

  delete prod._id;

  const product = await Product.create(prod);

  newProject.products.push(product._id);

  const updatedProject = await Project.findByIdAndUpdate(
    newProject._id,
    newProject,
    {
      new: true,
    }
  );

  res.status(201).json({
    status: "success",
    project: updatedProject,
  });
};

exports.showProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("author")
      .populate("products");

    if (project) {
      res.status(200).json({
        status: "success",
        project,
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "Project not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};
exports.updateProject = async (req, res) => {
  const { title, description } = req.body;
  const author = req.user.id;
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        author,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    res.status(200).json({
      status: "success",
      message: "Project Updated Successfully",
      project: updatedProject,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
exports.deleteProject = async (req, res) => {
  try {
    //finding the project to be deleted
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        status: "fail",
        message: "Project not found",
      });
    }

    const productIds = project.products;

    // Deleting particular project
    await project.deleteOne();

    // Deleting the associated products
    await Product.deleteMany({ _id: { $in: productIds } });

    res.status(200).json({
      status: "success",
      message: "Project deleted successfully",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err,
    });
  }
};
