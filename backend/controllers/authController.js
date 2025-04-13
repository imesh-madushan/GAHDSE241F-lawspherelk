const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

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

// get user from cookies by validating the token and checking in tha database
async function getUserFromCookies(token) {
    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      });
  
      // check if the login exists
      const [loginRows] = await db.query("SELECT * FROM login WHERE user_id = ?", [decoded.id]);
      if (loginRows.length === 0) return null;
  
      // check if the user exists
      const [userRows] = await db.query("SELECT * FROM users WHERE user_id = ?", [decoded.id]);
      if (userRows.length === 0) return null;
  
      return {
        id: decoded.id,
        username: userRows[0].username,
        role: userRows[0].role,
        name: userRows[0].name,
        email: userRows[0].email,
        phone: userRows[0].phone,
        address: userRows[0].address,
        created_at: userRows[0].created_at
      };
    }
    catch (err) {
      console.error("JWT or DB error:", err);
      return null;
    }
  }

// Logout
exports.logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
}