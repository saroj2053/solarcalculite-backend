const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({});

const WeatherData = mongoose.model("WeatherData", weatherSchema);

module.exports = WeatherData;
