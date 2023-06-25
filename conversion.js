const max_temp_ts = 1624633200; // Example timestamp value

const max_temp_date = new Date(max_temp_ts * 1000); // Multiply by 1000 to convert from seconds to milliseconds

const max_temp_hour = max_temp_date.getHours();

console.log(max_temp_hour);
