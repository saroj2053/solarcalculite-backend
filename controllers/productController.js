const ProductSchema = require("../schemas/ProductSchema");
const { Product } = require("../schemas/ProductSchema");
const Project = require("../schemas/ProjectSchema");
const cron = require("node-cron");
const User = require("../schemas/UserSchema");
const fs = require("fs");
const {
  dateIntervalsCreation,
  convertJsonToCsv,
} = require("../helpers/weather");

const { getEmailService } = require("../helpers/email");
const { generatePDF } = require("../helpers/jsonTopdfConverter");

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

exports.getElectricityGeneratedByProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    if (product) {
      res.status(200).json({
        status: "success",
        product,
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.calcElectricityGeneratedByProduct = async (req, res) => {
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

async function getGeneratedElectricity(prodId, userId) {
  const product = await Product.findById(prodId);

  const date_interval = dateIntervalsCreation();

  const user = await User.find({ _id: userId });

  generateLastThirtyDaysProductReport(product, date_interval, user[0].email);
}

// async function generateLastThirtyDaysProductReport(product, date, email) {
//   const dataForThirtyDays = [];

//   const startDate = new Date(date[0]);
//   const endDate = new Date(date[1]);

//   const weatherResponse = await fetch(
//     `https://api.weatherbit.io/v2.0/history/daily?&lat=${product.lat}&lon=${
//       product.lon
//     }&start_date=${startDate.toISOString().split("T")[0]}&end_date=${
//       endDate.toISOString().split("T")[0]
//     }&key=${process.env.WEATHERBIT_API_KEY}`
//   );
//   const res = await weatherResponse.json();
//   const weatherData = res.data;

//   weatherData.forEach(data => {
//     const date_interval = new Date(data.max_temp_ts * 1000);
//     const sunHours = date_interval.getHours();
//     const generatedElectricity =
//       (data.max_dni * product.area * sunHours) / 1000;
//     const electricityResult = {
//       solar_irradiance: data.max_dni,
//       sun_hours: sunHours,
//       date: data.datetime,
//       electricity_produced: generatedElectricity,
//       product_location: `${res.city_name}`,
//       country_code: `${res.country_code}`,
//     };
//     dataForThirtyDays.push(electricityResult);
//   });

//   const productName = product.productName;
//   const recipientEmail = email;

//   sendReportToEmail(productName, recipientEmail, dataForThirtyDays);

//   await Product.findByIdAndUpdate(
//     product._id,
//     {
//       isReadOnly: true,
//       $set: { solarCalculiteResults: dataForThirtyDays },
//     },
//     { new: true }
//   );
// }

// const sendReportToEmail = (productName, recipientEmail, dataForThirtyDays) => {
//   let fileName = `data/${productName}.csv`;

//   const csvContent = convertJsonToCsv(dataForThirtyDays, fileName);
//   const attachment = {
//     filename: fileName,
//     path: fileName,
//     content: csvContent,
//   };

//   const mailOptions = {
//     from: "sarojsaroj390@gmail.com",
//     to: recipientEmail,
//     subject: `Calculated Energy Produced by the Photo Voltaic Product ${productName}`,
//     text: "A detail report on energy calculation",
//     attachments: [attachment],
//   };

//   const emailLink = getEmailService();

//   emailLink.sendMail(mailOptions, function (err, info) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("Email sent successfully: " + info.response);
//     }
//   });
// };

async function generateLastThirtyDaysProductReport(product, date, email) {
  const dataForThirtyDays = [];

  const startDate = new Date(date[0]);
  const endDate = new Date(date[1]);

  const weatherResponse = await fetch(
    `https://api.weatherbit.io/v2.0/history/daily?&lat=${product.lat}&lon=${
      product.lon
    }&start_date=${startDate.toISOString().split("T")[0]}&end_date=${
      endDate.toISOString().split("T")[0]
    }&key=${process.env.WEATHERBIT_API_KEY}`
  );
  const res = await weatherResponse.json();
  const weatherData = res.data;
  console.log(weatherData);

  weatherData.forEach(data => {
    const date_interval = new Date(data.max_temp_ts * 1000);
    const sunHours = date_interval.getHours();
    const generatedElectricity =
      (data.max_dni * product.area * sunHours) / 1000;
    const electricityResult = {
      solar_irradiance: data.max_dni,
      sun_hours: sunHours,
      date: data.datetime,
      electricity_produced: generatedElectricity.toFixed(3),
      product_location: `${res.city_name}`,
      country_code: `${res.country_code}`,
    };
    dataForThirtyDays.push(electricityResult);
  });

  const productName = product.productName;
  const recipientEmail = email;

  sendReportToEmail(productName, recipientEmail, dataForThirtyDays);

  await Product.findByIdAndUpdate(
    product._id,
    {
      isReadOnly: true,
      $set: { solarCalculiteResults: dataForThirtyDays },
    },
    { new: true }
  );
}

const sendReportToEmail = (productName, recipientEmail, dataForThirtyDays) => {
  let fileName = `data/${productName}.pdf`;

  const pdfContent = generatePDF(dataForThirtyDays, fileName);

  const mailOptions = {
    from: "sarojsaroj390@gmail.com",
    to: recipientEmail,
    subject: `Calculated Energy Produced by the Photo Voltaic Product ${productName}`,
    text: "A detailed report on energy calculation",
    attachments: [
      {
        filename: fileName,
        path: pdfContent,
        contentType: "application/pdf",
      },
    ],
  };

  const emailLink = getEmailService();

  emailLink.sendMail(mailOptions, function (error, result) {
    if (error) {
      console.log(err);
    } else {
      console.log("Email sent successfully: " + result.response);
    }
  });
};
