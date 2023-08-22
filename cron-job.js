const cron = require("node-cron");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const Project = require("./schemas/ProjectSchema");
const User = require("./schemas/UserSchema");
const { Product } = require("./schemas/ProductSchema");
const {
  dateIntervalsCreation,
  convertJsonToCsv,
  dateIntervalSingleDay,
} = require("./helpers/weather");

const { getEmailService } = require("./helpers/email");
require("isomorphic-fetch");

require("./database");
async function cronrun() {
  // fetching projects that are active
  const projects = await Project.find({ isActive: true })
    .populate("products")
    .populate("author");

  // looping through the projects
  for (let project of projects) {
    const createdDate = project.createdAt;

    const todayDate = new Date();

    const differenceInMilliseconds = todayDate - createdDate;

    const oneDayMilliseconds = 24 * 60 * 60 * 1000;

    const differenceInDays = Math.round(
      Math.abs(differenceInMilliseconds / oneDayMilliseconds)
    );

    console.log(differenceInDays);

    const user = project.author;
    const email = user.email;

    const products = project.products;

    const activeProducts = products.filter(product => {
      return product.isReadOnly === false;
    });

    if (differenceInDays === 30) {
      const date_interval = dateIntervalsCreation();
      generateElectricityForLast30Days(
        project,
        activeProducts,
        date_interval,
        email
      );
    } else {
      generateElectricityForSingleDay(activeProducts);
    }
  }
}

async function generateElectricityForSingleDay(activeProductList) {
  for (let product of activeProductList) {
    const date = dateIntervalSingleDay();

    const weatherResponse = await fetch(
      `https://api.weatherbit.io/v2.0/history/daily?&lat=${product.lat}&lon=${product.lon}&start_date=${date[0]}&end_date=${date[1]}&key=${process.env.WEATHERBIT_API_KEY}`
    );
    const weatherData = await weatherResponse.json();
    const data = weatherData.data[0];

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

    // stored the dataForSingleDay into the particular product
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { $push: { solarCalculiteResults: electricityResult } },
      { new: true }
    );

    if (updatedProduct) {
      console.log("Data is added to database");
    } else {
      console.log("Failed to update the product with the electricity result");
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

async function generateElectricityForLast30Days(
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

    await Product.findByIdAndUpdate(
      product._id,
      { isReadOnly: true, $set: { solarCalculiteResults: dataForThirtyDays } },
      { new: true }
    );

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

cron.schedule("20 13 * * *", async () => {
  cronrun();
});
