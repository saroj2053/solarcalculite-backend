const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const https = require("https");
const cron = require("node-cron");
const fs = require("fs");
const authRouter = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");
const projectRouter = require("./routes/projectRoute");
const productRouter = require("./routes/productRoute");
const templateProductRouter = require("./routes/templateRoute");

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:3000"],
};

const app = express();

// connection to database
require("./database");

// middlewares
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());

// app.use((req, res, next) => {
//   console.log("Middleware function");
//   next();
// });

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/products", productRouter);
app.use("/api/templateProducts", templateProductRouter);

app.get("/weatherData", (req, res) => {
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
        res.status(200).json(JSON.parse(data));
      });
    }
  );

  request.on("error", error => {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  });

  request.end();
});

// cron.schedule("*/10 * * * * *", () => {
//   let data = "Hi from the node-cron\n";
//   fs.appendFile("logs.txt", data, err => {
//     if (err) throw err;
//     console.log("file added");
//   });
// });

const PORT = process.env.PORT || 8888;

app.listen(8000, () => {
  console.log(`Server is running on port ${PORT}`.bgCyan.black);
});
