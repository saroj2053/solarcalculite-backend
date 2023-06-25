const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const https = require("https");
const cron = require("node-cron");

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
require("./helpers/weather");

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

const PORT = process.env.PORT || 8888;

app.listen(8000, () => {
  console.log(`Server is running on port ${PORT}`.bgCyan.black);
});
