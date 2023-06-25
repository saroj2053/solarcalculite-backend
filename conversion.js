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
