const Project = require("../schemas/ProjectSchema");
const { cloudinary } = require("../cloudinary/index");
const { Product, Template } = require("../schemas/ProductSchema");
const User = require("../schemas/UserSchema");
const nodemailer = require("nodemailer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
require("isomorphic-fetch");

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

exports.generateProjectReport = () => {
  popcorn();
  console.log("popcorn called");
};

function diffdate() {
  let todaydate = new Date();
  let currdate = todaydate.getDate() - 1;
  let month = todaydate.getMonth() + 1;
  let year = todaydate.getFullYear();
  let dateafterthirtydays = new Date(
    new Date().setDate(todaydate.getDate() - 30)
  );

  console.log(dateafterthirtydays);
  let getdate = dateafterthirtydays.getDate();
  let getmonth = dateafterthirtydays.getMonth() + 1;
  let getyear = dateafterthirtydays.getFullYear();
  let enddate = year + "-" + month + "-" + currdate;
  let startdate = getyear + "-" + getmonth + "-" + getdate;
  console.log(startdate);
  return [startdate, enddate];
}

const link = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sarojsaroj390@gmail.com",
    pass: "jelswsffzvptedwn",
  },
});

async function popcorn() {
  const cdate = diffdate();
  function isThirty(productCreatedDate) {
    let isThirty = false;
    const cdate = diffdate();

    console.log(cdate);
    let currentDate = new Date(cdate[0]);
    const prodDate = new Date(productCreatedDate);

    const differenceInDates = prodDate.getTime() - currentDate.getTime() + 1;

    console.log(differenceInDates);

    const daysDiff = Math.floor(differenceInDates / (1000 * 60 * 60 * 24));
    console.log(daysDiff);

    if (daysDiff === 30) {
      isThirty = true;
    }
    return true;
  }

  const projectlist = await Project.find({ isActive: true });

  async function processProject(proj) {
    const dateOfProjectCreation = proj.createdAt;

    const crdate = dateOfProjectCreation.toISOString().split("T")[0];

    // console.log(typeof crdate);

    const datechk = isThirty(crdate);

    console.log("datechk", datechk);

    const user = await User.find({ _id: proj.author });
    console.log(user);

    const prodidlist = await Project.find(
      { _id: proj._id, isActive: true },
      { projection: { products: 1 } }
    ).populate("products");

    console.log(prodidlist[0].products);

    let productlist = [...prodidlist[0].products];

    // for (elem of productlist) {
    if (datechk === true) {
      // const deactivprod = await Product.updateMany({_id : elem._id},{isactive : false})
    }

    if (datechk === true) {
      // const deacticproj = await Project.updateMany({_id : proj._id},{isactive:false})
      sendLast30DaysProjectReports(proj, productlist, cdate, user[0].email);
    }
  }

  async function processProjects() {
    for (const proj of projectlist) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      await processProject(proj);
    }
  }

  processProjects();
}

function convertJsonToCsv(jsonArray, filename) {
  if (!jsonArray.length) {
    return null;
  }

  const csvWriter = createCsvWriter({
    path: filename,
    header: Object.keys(jsonArray[0]).map(key => ({ id: key, title: key })),
  });

  return csvWriter.writeRecords(jsonArray);
}

async function sendLast30DaysProjectReports(
  project,
  activeProductList,
  date,
  email
) {
  const title = project.title;

  let csvpaths = [];
  for (let product of activeProductList) {
    const thirtydays = [];
    // const endDate = new Date(date[0]); // Current date
    // const startDate = new Date(date[0]); // Start with the current date
    // startDate.setDate(startDate.getDate() - 30); // Subtract 30 days

    // const startDateISO = startDate.toISOString().split("T")[0];
    // const endDateISO = endDate.toISOString().split("T")[0];

    const weatherResponse = await fetch(
      `https://api.weatherbit.io/v2.0/history/daily?&lat=${product.lat}&lon=${product.lon}&start_date=${date[0]}&end_date=${date[1]}&key=${process.env.WEATHERBIT_API_KEY}`
    );
    const newres = await weatherResponse.json();
    const dataResponse = newres.data;
    console.log(dataResponse);

    dataResponse.forEach(data => {
      const cdate = new Date(data.max_temp_ts * 1000);
      const sunHours = cdate.getHours();
      const elec = (data.max_dni * product.area * sunHours) / 1000;
      const electricityResult = {
        productname: product.productName,
        irradiance: data.max_dni,
        "Sun Hours": sunHours,
        date: data.datetime,
        electricity: elec,
        "Product Location": `${newres.city_name} ${newres.country_code}`,
      };
      thirtydays.push(electricityResult);
    });

    let filename = `${product.productName}.csv`;

    const csvarr = convertJsonToCsv(thirtydays, filename);
    csvpaths.push(filename);
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

  var mailop = {
    from: "sarojsaroj390@gmail.com",
    to: `${email}`,
    subject: `${title} electricty generation reports`,
    text: "Sending this email after gernerating report",
    attachments: attachments,
  };

  link.sendMail(mailop, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("email sent" + info.response);
    }
  });
}
