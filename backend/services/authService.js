const bcrypt = require("bcrypt");
const db = require("../config/db");

// Authentication-related database operations
exports.findUserByUsername = async (username) => {
  const query = "SELECT * FROM login WHERE username = ?";
  const [rows] = await db.query(query, [username]);
  return rows.length > 0 ? rows[0] : null;
};

exports.getUserById = async (userId) => {
  const query = "SELECT * FROM users WHERE user_id = ?";
  const [rows] = await db.query(query, [userId]);
  return rows.length > 0 ? rows[0] : null;
};

exports.comparePasswords = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// You can add more service methods as needed for registration, etc.
