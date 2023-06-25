const cron = require("node-cron");
const https = require("https");
const fs = require("fs");

const fetchWeatherData = () => {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const request = https.request(
    `https://api.weatherbit.io/v2.0/history/daily?postal_code=09126&country=DE&start_date=2023-05-17&end_date=2023-06-18&key=${process.env.WEATHERBIT_API_KEY}`,
    options,
    response => {
      let data = "";

      response.on("data", chunk => {
        data += chunk;
      });

      response.on("end", () => {
        // res.status(200).json(JSON.parse(data));
        data = JSON.parse(data);
        fs.appendFile("logs.json", JSON.stringify(data), err => {
          if (err) throw err;
          console.log("file added");
        });
      });
    }
  );

  request.on("error", error => {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  });

  request.end();
};

// cron.schedule("*/10 * * * * *", () => {
//   // fetchWeatherData();
// });
