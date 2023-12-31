const Project = require("../schemas/ProjectSchema");
const { cloudinary } = require("../cloudinary/index");
const { Product, Template } = require("../schemas/ProductSchema");
const User = require("../schemas/UserSchema");

const {
  dateIntervalsCreation,
  convertJsonToCsv,
} = require("../helpers/weather");

const { getEmailService } = require("../helpers/email");

const nodemailer = require("nodemailer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
require("isomorphic-fetch");

exports.getAllProjects = async (req, res) => {
  const id = req.user.id;
  try {
    const projects = await Project.find({ author: id }).sort({ createdAt: -1 });

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

exports.calcElectricityGeneratedByProject = async (req, res) => {
  const existingProject = await Project.findById(req.params.id);

  const user = await User.find({ _id: existingProject.author });

  const listOfProducts = await Project.find(
    { _id: existingProject._id, isActive: true },
    { projection: { products: 1 } }
  ).populate("products");

  let productlist = [...listOfProducts[0].products];

  const activeProducts = productlist.filter(product => {
    return product.isReadOnly !== true;
  });

  const cdate = dateIntervalsCreation();
  try {
    generateReportForLast30Days(
      existingProject,
      activeProducts,
      cdate,
      user[0].email
    );

    res.status(200).json({
      status: "success",
      message: "Successfully generated report for a project",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.stack,
    });
  }
};

async function generateReportForLast30Days(
  project,
  activeProductList,
  date,
  email
) {
  const title = project.title;

  let csvpaths = [];
  for (let product of activeProductList) {
    const dataForThirtyDays = [];

    const weatherResponse = await fetch(
      `https://api.weatherbit.io/v2.0/history/daily?&lat=${product.lat}&lon=${product.lon}&start_date=${date[0]}&end_date=${date[1]}&key=${process.env.WEATHERBIT_API_KEY}`
    );
    const weatherData = await weatherResponse.json();
    const dailyData = weatherData.data;

    for (const data of dailyData) {
      const cdate = new Date(data.max_temp_ts * 1000);
      const sunHours = cdate.getHours();
      const generatedElectricity =
        (data.max_dni * product.area * sunHours) / 1000;
      const electricityResult = {
        solar_irradiance: data.max_dni,
        sun_hours: sunHours,
        date: data.datetime,
        electricity_produced: generatedElectricity.toFixed(3),
        product_location: `${weatherData.city_name}`,
        country_code: `${weatherData.country_code}`,
      };
      dataForThirtyDays.push(electricityResult);
    }

    let filename = `data/${product.productName}.csv`;

    const csvarr = convertJsonToCsv(dataForThirtyDays, filename);
    csvpaths.push(filename);

    //TODO:
    // stored the dataForThirtyDays result into the product data schema
    await Product.findByIdAndUpdate(
      product._id,
      { isReadOnly: true, $set: { solarCalculiteResults: dataForThirtyDays } },
      { new: true }
    );
    //set the product status to readonly using the updateOne function since the products are in the loop
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  const attachments = [];

  const util = require("util");
  const fs = require("fs");
  const readFile = util.promisify(fs.readFile);

  for (const csvpath of csvpaths) {
    const fileContent = await readFile(csvpath);
    const attachment = {
      filename: csvpath,
      content: fileContent,
    };
    attachments.push(attachment);
  }

  var mailOptions = {
    from: "sarojsaroj390@gmail.com",
    to: `${email}`,
    subject: `${title} electricty generation reports`,
    text: "Sending this email after gernerating report",
    attachments: attachments,
  };

  const emailLink = getEmailService();

  emailLink.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("email sent successfully" + info.response);
    }
  });

  await Project.updateOne({ _id: project._id }, { isActive: false });
}
