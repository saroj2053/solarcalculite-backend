const mongoose = require("mongoose");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB);
    console.log(
      `Successfully connected to mongodb at ${conn.connection.host}`.bgMagenta
        .black
    );
  } catch (err) {
    console.log(err);
  }
};

connectDB();
