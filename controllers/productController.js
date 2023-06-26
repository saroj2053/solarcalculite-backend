const ProductSchema = require("../schemas/ProductSchema");
const { Product } = require("../schemas/ProductSchema");
const Project = require("../schemas/ProjectSchema");
const cron = require("node-cron");
const User = require("../schemas/UserSchema");
const { dateIntervalsCreation } = require("../helpers/weather");
const nodemailer = require("nodemailer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
require("isomorphic-fetch");

exports.createProduct = async (req, res) => {
  const {
    productName,
    area,
    peakPower,
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
  if (!peakPower) {
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
      peakPower,
      orientation,
      tilt,
      lon,
      lat,
    });

    const newProduct = await product.save();

    // cron.schedule("0 5 * * *", async () => {
    //   const weatherResponse = await fetch(
    //     `https://api.weatherbit.io/v2.0/history/daily?&lat=${product.lat}&lon=${
    //       product.lon
    //     }&start_date=${startDate.toISOString().split("T")[0]}&end_date=${
    //       endDate.toISOString().split("T")[0]
    //     }&key=${process.env.WEATHERBIT_API_KEY}`
    //   );
    //   const responseJson = await weatherResponse.json();
    //   const dataResponse = responseJson.data;
    // });

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
  const { productName, area, peakPower, orientation, tilt, lon, lat } =
    req.body;

  try {
    const newValues = {
      productName,
      area,
      peakPower,
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

exports.getSingleProductData = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;

  const product = await Product.findById(productId);

  try {
    getGeneratedElectricity(productId, userId);
    res.status(200).json({
      status: "success",
      message: `Electricity data is generated for ${product.productName}`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const link = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sarojsaroj390@gmail.com",
    pass: "jelswsffzvptedwn",
  },
});

async function getGeneratedElectricity(prodId, userId) {
  const product = await Product.findById(prodId);

  const date_interval = dateIntervalsCreation();

  function isTargetDaysAchieved(productCreatedDate) {
    let isThirty = false;

    function parseDateString(dateString) {
      const parts = dateString.split("-");
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    const date_interval = dateIntervalsCreation();

    console.log(date_interval);

    let currentDate = parseDateString(date_interval[1]);
    console.log(currentDate);

    let createdProductAt = parseDateString(productCreatedDate);

    const differenceInMilliseconds = currentDate - createdProductAt;
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    console.log(differenceInDays);

    if (differenceInDays === 30) {
      isThirty = true;
    }
    return true;
  }

  const dateOfProductCreation = product.createdAt;

  const crdate = dateOfProductCreation.toISOString().split("T")[0];

  console.log(crdate);

  // console.log(typeof crdate);

  const dateCheck = isTargetDaysAchieved(crdate);
  console.log(dateCheck);

  const user = await User.find({ _id: userId });

  // for (elem of productlist) {
  if (dateCheck === true) {
    // const deactivprod = await Product.updateMany({_id : elem._id},{isactive : false})
  }

  if (dateCheck === true) {
    // const deacticproj = await Project.updateMany({_id : proj._id},{isactive:false})
    sendLast30DaysProjectReports(product, date_interval, user[0].email);
  }
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

async function sendLast30DaysProjectReports(product, date, email) {
  const thirtydays = [];

  const startDate = new Date(date[0]);
  const endDate = new Date(date[1]);

  const weatherResponse = await fetch(
    `https://api.weatherbit.io/v2.0/history/daily?&lat=${product.lat}&lon=${
      product.lon
    }&start_date=${startDate.toISOString().split("T")[0]}&end_date=${
      endDate.toISOString().split("T")[0]
    }&key=${process.env.WEATHERBIT_API_KEY}`
  );
  const responseJson = await weatherResponse.json();
  const dataResponse = responseJson.data;

  dataResponse.forEach(data => {
    const date_interval = new Date(data.max_temp_ts * 1000);
    const sunHours = date_interval.getHours();
    const elec = (data.max_dni * product.area * sunHours) / 1000;
    const electricityResult = {
      productname: product.productName,
      irradiance: data.max_dni,
      "Sun Hours": sunHours,
      date: data.datetime,
      electricity: elec,
      "Product Location": `${weatherData.city_name}`,
      country_code: `${weatherData.country_code}`,
    };
    thirtydays.push(electricityResult);
  });

  let filename = `${product.productName}.csv`;

  const csvContent = convertJsonToCsv(thirtydays, filename);
  const attachment = {
    filename: filename,
    path: filename,
    content: csvContent,
  };

  const mailOptions = {
    from: "sarojsaroj390@gmail.com",
    to: email,
    subject: `${product.productName} electricity generation reports`,
    text: "Sending this email after generating the report",
    attachments: [attachment],
  };

  link.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  await Product.findByIdAndUpdate(product._id, {
    isReadOnly: true,
  });
}
