// const max_temp_ts = 1624633200; // Example timestamp value

// const max_temp_date = new Date(max_temp_ts * 1000); // Multiply by 1000 to convert from seconds to milliseconds

// const max_temp_hour = max_temp_date.getHours();

// console.log(max_temp_hour);

// let todayDate = new Date();
// console.log(todayDate);
// let currentDate = todayDate.getDate(); //gives the date
// console.log(currentDate);
// let month = todayDate.getMonth() + 1; // The getMonth() method in JavaScript returns the zero-based index of the month for a specified date. The index starts from 0 for January and goes up to 11 for December.
// console.log(month);
// let year = todayDate.getFullYear();
// console.log(year);

let todayDate = new Date();
let year = todayDate.getFullYear(); //year
let month = todayDate.getMonth() + 1; // month
let date = todayDate.getDate(); // date

console.log(year, month, date);

let dateBeforeThirtyDays = new Date();
dateBeforeThirtyDays.setDate(todayDate.getDate() - 30);
let getYear = dateBeforeThirtyDays.getFullYear();
let getMonth = dateBeforeThirtyDays.getMonth() + 1;
let getDate = dateBeforeThirtyDays.getDate();

console.log(getYear, getMonth, getDate);

// extra code
// exports.calcElectricityGeneratedByProject = () => {
//   initiate_search_calculate();
//   console.log("electricity generation called");
// };

// async function initiate_search_calculate() {
//   const cdate = dateIntervalsCreation();
//   function isTargetDaysAchieved(productCreatedDate) {
//     let isThirty = false;
//     const cdate = dateIntervalsCreation();

//     console.log(cdate);
//     let currentDate = new Date(cdate[0]);
//     const prodDate = new Date(productCreatedDate);

//     const differenceInDates = prodDate.getTime() - currentDate.getTime() + 1;

//     console.log(differenceInDates);

//     const daysDiff = Math.floor(differenceInDates / (1000 * 60 * 60 * 24));
//     console.log(daysDiff);

//     if (daysDiff === 30) {
//       isThirty = true;
//     }
//     return true;
//   }

//   const projectlist = await Project.find({ isActive: true }); // check for omly one project

//   async function processProject(proj) {
//     const dateOfProjectCreation = proj.createdAt;

//     const crdate = dateOfProjectCreation.toISOString().split("T")[0];

//     // console.log(typeof crdate);

//     const datechk = isTargetDaysAchieved(crdate);

//     console.log("datechk", datechk);

//     const user = await User.find({ _id: proj.author });
//     console.log(user);

//     const prodidlist = await Project.find(
//       { _id: proj._id, isActive: true },
//       { projection: { products: 1 } }
//     ).populate("products");

//     let productlist = [...prodidlist[0].products];
//     const activeProducts = productlist.filter(product => {
//       return product.isReadOnly !== true;
//     });

//     console.log(activeProducts);

//     // for (elem of productlist) {
//     if (datechk === true) {
//       // const deactivprod = await Product.updateMany({_id : elem._id},{isactive : false})
//     }

//     if (datechk === true) {
//       // const deacticproj = await Project.updateMany({_id : proj._id},{isactive:false})
//       sendLast30DaysProjectReports(proj, activeProducts, cdate, user[0].email);
//     }
//   }

//   async function processProjects() {
//     for (const proj of projectlist) {
//       // await new Promise(resolve => setTimeout(resolve, 3000));

//       await processProject(proj);
//     }
//   }

//   processProjects();
// }

// async function sendLast30DaysProjectReports(
//   project,
//   activeProductList,
//   date,
//   email
// ) {
//   const title = project.title;

//   let csvpaths = [];
//   for (let product of activeProductList) {
//     const thirtydays = [];

//     const weatherResponse = await fetch(
//       `https://api.weatherbit.io/v2.0/history/daily?&lat=${product.lat}&lon=${product.lon}&start_date=${date[0]}&end_date=${date[1]}&key=${process.env.WEATHERBIT_API_KEY}`
//     );
//     const weatherData = await weatherResponse.json();
//     const dailyData = weatherData.data;
//     console.log(dailyData);

//     for (const data of dailyData) {
//       const cdate = new Date(data.max_temp_ts * 1000);
//       const sunHours = cdate.getHours();
//       const elec = (data.max_dni * product.area * sunHours) / 1000;
//       const electricityResult = {
//         productname: product.productName,
//         irradiance: data.max_dni,
//         "Sun Hours": sunHours,
//         date: data.datetime,
//         electricity: elec,
//         "Product Location": `${weatherData.city_name}`,
//         country_code: `${weatherData.country_code}`,
//       };
//       thirtydays.push(electricityResult);
//     }

//     let filename = `${product.productName}.csv`;

//     const csvarr = convertJsonToCsv(thirtydays, filename);
//     csvpaths.push(filename);

//     //TODO:
//     // stored the thirtydays result into the product data schema
//     //set the product status to readonly using the updateOne function since the products are in the loop
//     await new Promise(resolve => setTimeout(resolve, 3000));
//   }

//   const attachments = [];

//   const util = require("util");
//   const fs = require("fs");
//   const readFile = util.promisify(fs.readFile);

//   for (const csvpath of csvpaths) {
//     const fileContent = await readFile(csvpath);
//     const attachment = {
//       filename: csvpath,
//       content: fileContent,
//     };
//     attachments.push(attachment);
//   }

//   var mailOptions = {
//     from: "sarojsaroj390@gmail.com",
//     to: `${email}`,
//     subject: `${title} electricty generation reports`,
//     text: "Sending this email after gernerating report",
//     attachments: attachments,
//   };

//   const emailLink = getEmailService();

//   emailLink.sendMail(mailOptions, function (err, info) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("email sent successfully" + info.response);
//     }
//   });
