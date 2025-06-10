const bcrypt = require("bcrypt");
const db = require("../config/db");

// Find user by username
exports.findUserByUsername = async (username) => {
  try {
    const [rows] = await db.query("SELECT * FROM login WHERE username = ?", [
      username,
    ]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error finding user by username:", error);
    throw error;
  }
};

// Get user details by user_id
exports.getUserById = async (userId) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [
      userId,
    ]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

// Compare passwords
exports.comparePasswords = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
};

// Hash password
exports.hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

// Update last login
exports.updateLastLogin = async (userId) => {
  try {
    await db.query("UPDATE login SET lastlogin_dt = NOW() WHERE user_id = ?", [
      userId,
    ]);
  } catch (error) {
    console.error("Error updating last login:", error);
    throw error;
  }
};

// Check if account is locked
exports.isAccountLocked = async (username) => {
  try {
    const [rows] = await db.query(
      "SELECT account_locked FROM login WHERE username = ?",
      [username]
    );
    return rows.length > 0 ? rows[0].account_locked === 1 : false;
  } catch (error) {
    console.error("Error checking account lock status:", error);
    throw error;
  }
};

// Increment failed attempts
exports.incrementFailedAttempts = async (username) => {
  try {
    await db.query(
      "UPDATE login SET faild_attempts = faild_attempts + 1 WHERE username = ?",
      [username]
    );

    // Check if we should lock the account after too many failed attempts
    const [rows] = await db.query(
      "SELECT faild_attempts FROM login WHERE username = ?",
      [username]
    );

    if (rows.length > 0 && rows[0].faild_attempts >= 5) {
      // Lock account after 5 failed attempts
      await db.query("UPDATE login SET account_locked = 1 WHERE username = ?", [
        username,
      ]);
    }
  } catch (error) {
    console.error("Error incrementing failed attempts:", error);
    throw error;
  }
};

// Reset failed attempts
exports.resetFailedAttempts = async (username) => {
  try {
    await db.query("UPDATE login SET faild_attempts = 0 WHERE username = ?", [
      username,
    ]);
  } catch (error) {
    console.error("Error resetting failed attempts:", error);
    throw error;
  }
};

// Add new method to get failed attempts count
exports.getFailedAttempts = async (username) => {
  try {
    const [rows] = await db.query(
      "SELECT faild_attempts FROM login WHERE username = ?",
      [username]
    );
    return rows.length > 0 ? rows[0].faild_attempts : 0;
  } catch (error) {
    console.error("Error getting failed attempts:", error);
    throw error;
  }
};
