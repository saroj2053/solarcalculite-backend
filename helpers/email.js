const nodemailer = require("nodemailer");

exports.getEmailService = () => {
  const link = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.PASS_KEY,
    },
  });

  return link;
};
