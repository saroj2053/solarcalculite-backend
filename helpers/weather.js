const createCsvWriter = require("csv-writer").createObjectCsvWriter;

exports.dateIntervalsCreation = () => {
  let todayDate = new Date();
  let year = todayDate.getFullYear();
  let month = todayDate.getMonth() + 1;
  let date = todayDate.getDate();

  let dateBeforeThirtyDays = new Date();
  dateBeforeThirtyDays.setDate(todayDate.getDate() - 30);
  let getYear = dateBeforeThirtyDays.getFullYear();
  let getMonth = dateBeforeThirtyDays.getMonth() + 1;
  let getDate = dateBeforeThirtyDays.getDate();

  let end_date = year + "-" + month + "-" + date;

  let start_date = getYear + "-" + getMonth + "-" + getDate;

  return [start_date, end_date];
};

exports.dateIntervalSingleDay = () => {
  let todayDate = new Date();
  let year = todayDate.getFullYear();
  let month = todayDate.getMonth() + 1;
  let date = todayDate.getDate();

  let yesterdayDate = new Date();
  yesterdayDate.setDate(todayDate.getDate() - 1);
  let getYear = yesterdayDate.getFullYear();
  let getMonth = yesterdayDate.getMonth() + 1;
  let getDate = yesterdayDate.getDate();

  let end_date = year + "-" + month + "-" + date;

  let start_date = getYear + "-" + getMonth + "-" + getDate;

  return [start_date, end_date];
};

exports.convertJsonToCsv = (jsonArray, filename) => {
  if (!jsonArray.length) {
    return null;
  }

  const csvWriter = createCsvWriter({
    path: filename,
    header: Object.keys(jsonArray[0]).map(key => ({ id: key, title: key })),
  });

  return csvWriter.writeRecords(jsonArray);
};
