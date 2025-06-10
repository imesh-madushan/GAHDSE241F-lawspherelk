// Capitalize first letter of topic
export const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Convert JS Date or date string to MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
export const toMySqlDatetime = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
