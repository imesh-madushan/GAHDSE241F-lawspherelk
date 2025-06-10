const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
const { getUserFromCookies } = require("../middlewares/authMiddleware");
const db = require("../config/db");

// Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Use service instead of direct query
    const login = await authService.findUserByUsername(username);

    if (!login) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check if account is locked before attempting login
    if (login.account_locked === 1) {
      return res.status(403).json({
        message:
          "Account is locked. Please contact the administrator to unlock your account.",
      });
    }

    // Verify password using service - use password_hash instead of password
    const passwordMatch = await authService.comparePasswords(
      password,
      login.password_hash
    );

    if (!passwordMatch) {
      // Increment failed attempts
      await authService.incrementFailedAttempts(username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Get user details from users table
    const user = await authService.getUserById(login.user_id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Reset failed attempts on successful login
    await authService.resetFailedAttempts(username);

    // Update last login time
    await authService.updateLastLogin(login.user_id);

    const token = jwt.sign(
      {
        id: login.user_id,
        username: login.username,
        role: user.role,
      },
      process.env.JWT_SECRET
    );

    res.cookie("authtoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        username: login.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Register
exports.register = async (req, res) => {
  const { username, password, name, email, role } = req.body;

  try {
    // Check if username already exists
    const existingUser = await authService.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create user using authService
    const result = await authService.createUser({
      username,
      password,
      name,
      email,
      role,
    });

    if (result) {
      res.status(201).json({
        message: "User registered successfully",
        user: {
          username: result.username,
          role: result.role,
        },
      });
    } else {
      res.status(400).json({ message: "Registration failed" });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Validate token
exports.validateCookies = async (req, res) => {
  const token = req.cookies.authtoken;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.status(200).json({ message: "Token is valid", user });
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = require("jsonwebtoken").verify(
      token,
      process.env.JWT_SECRET
    );
    const userId = decoded.id;

    // Get user info from users and login tables
    const [userRows] = await db.query("SELECT * FROM users WHERE user_id = ?", [
      userId,
    ]);
    if (!userRows.length)
      return res.status(404).json({ message: "User not found" });

    const user = userRows[0];
    // Optionally get username from login table
    const [loginRows] = await db.query(
      "SELECT username FROM login WHERE user_id = ?",
      [userId]
    );
    if (loginRows.length) user.username = loginRows[0].username;

    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = require("jsonwebtoken").verify(
      token,
      process.env.JWT_SECRET
    );
    const userId = decoded.id;
    const { name, role, email, phone, address } = req.body;

    // Update users table
    await db.query(
      "UPDATE users SET name = ?, role = ?, email = ?, phone = ?, address = ? WHERE user_id = ?",
      [name, role, email, phone, address, userId]
    );

    // Optionally, update username in login table if you want to allow username change
    // await db.query("UPDATE login SET username = ? WHERE user_id = ?", [username, userId]);

    // Return updated user
    const [userRows] = await db.query("SELECT * FROM users WHERE user_id = ?", [
      userId,
    ]);
    const user = userRows[0];
    const [loginRows] = await db.query(
      "SELECT username FROM login WHERE user_id = ?",
      [userId]
    );
    if (loginRows.length) user.username = loginRows[0].username;
    res.json(user);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    res.clearCookie("authtoken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
