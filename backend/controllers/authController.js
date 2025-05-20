const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const { getUserFromCookies } = require("../middlewares/authMiddleware");

// Login
exports.login = async (req, res) => {
    const { username, password } = req.body;    
    const hashedPassword = await bcrypt.hash(password, 10); // hash the password
    const query = "SELECT * FROM login WHERE username = ?";
    const values = [username, hashedPassword];


    try{
        const [rows] = await db.query(query, values);
        if (rows.length > 0) {
            const login = rows[0];

            //check user in usertable as well
            const query = "SELECT * FROM users WHERE user_id = ?";
            const values = [login.user_id];
            const [userRows] = await db.query(query, values);

            if (userRows.length > 0) {
                const user = userRows[0];
                login.role = user.role;
            }
            else {
                return res.status(401).json({ message: "User not found" });
            }

            const token = jwt.sign({ id: login.user_id, username: login.username, role: login.role}, process.env.JWT_SECRET);

            res.cookie("authtoken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
            });

            //create a session for the user
            // querySession = "INSERT INTO usersessions (session_id, user_id, device_info, login_time, last_activity, current_cookie) VALUES (?, ?, ?, ?, ?, ?)";

            res.status(200).json({ 
                message: "Login successful", 
                user: {
                    username: login.username,
                    role: login.role
                }
            });
        } 
        else {
            res.status(401).json({ message: "Invalid username or password" });
        }
    }
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }

};


// Register
exports.register = async (req, res) => {

}

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
    } 
    catch (error) {
      console.error("Error validating token:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get user info from users and login tables
    const [userRows] = await db.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    if (!userRows.length) return res.status(404).json({ message: "User not found" });

    const user = userRows[0];
    // Optionally get username from login table
    const [loginRows] = await db.query("SELECT username FROM login WHERE user_id = ?", [userId]);
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
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
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
    const [userRows] = await db.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    const user = userRows[0];
    const [loginRows] = await db.query("SELECT username FROM login WHERE user_id = ?", [userId]);
    if (loginRows.length) user.username = loginRows[0].username;
    res.json(user);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

// Logout
exports.logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
}

