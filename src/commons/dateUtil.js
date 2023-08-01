
import { regularExpData } from "../constants";
import moment from "moment";
const { DateTime } = require("luxon");

const dateUtil = {};
let dateFormat = "DD MMM YYYY";

dateUtil.toISODateFormat = (input, dateFormat) => {
  if (!input) return ""
  if (!dateFormat) dateFormat = "DD-MM-YYYY";
  return DateTime.fromISO(input, { zone: "UTC" }).toFormat(dateFormat);
};

dateUtil.fromToDateFormat = (input, fromFormat,dateFormat) => {
  if (!input) return "";
  if (!dateFormat) dateFormat = "DD-MM-YYYY";
  //return input;
  return moment(input,fromFormat).format(dateFormat);
};
dateUtil.toDateFormat = (input, dateFormat) => {
  if (!input) return "";
  if (!dateFormat) dateFormat = "DD-MM-YYYY";
  //return input;
  return moment(new Date(input)).format(dateFormat);
};

dateUtil.formatDate = (input,dateFormat) => {
  if (!input) return "";
  if (!dateFormat) dateFormat = "DD-MM-YYYY";
  console.log(dateFormat)
  console.log(input);
  //return input;
  return moment(new Date(input)).format(dateFormat);
}

dateUtil.toFormat = (input, dateFormat) => { 
  if (!input) return "";
  if (!dateFormat) dateFormat = "DD-MM-YYYY";
  console.log(input);
  console.log(moment(input))
  return input;
  return moment(input).format(dateFormat);
};
dateUtil.toTimeFormat = (input, dateFormat) => {
  if (!input) return "";
  if (!dateFormat) dateFormat = "HH:MM";
  return moment(new Date(input)).format(dateFormat);
};
export default dateUtil;
