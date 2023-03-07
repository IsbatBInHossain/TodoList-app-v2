module.exports.getDate = () => {
  let today = new Date();
  let day = today.getDay();
  let dayFormat = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  let weekday = today.toLocaleDateString("en-UK", dayFormat);
  return weekday;
};

module.exports.getDay = () => {
  let today = new Date();
  let day = today.getDay();
  let dayFormat = {
    weekday: "long",
  };
  let weekday = today.toLocaleDateString("en-UK", dayFormat);
  return weekday;
};
