const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
const { getUserFromCookies } = require("../middlewares/authMiddleware");

// Login
exports.login = async (req, res) => {
    const { username, password } = req.body;    

    try{
        // Use service instead of direct query
        const login = await authService.findUserByUsername(username);
        
        if (login) {
            // Verify password using service
            const passwordMatch = await authService.comparePasswords(password, login.password);
            
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid username or password" });
            }
            
            // Get user details from users table
            const user = await authService.getUserById(login.user_id);
            
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            const token = jwt.sign({ 
                id: login.user_id, 
                username: login.username, 
                role: user.role
            }, process.env.JWT_SECRET);

            res.cookie("authtoken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
            });

            res.status(200).json({ 
                message: "Login successful", 
                user: {
                    username: login.username,
                    role: user.role
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
    // Implement using authService
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

// Logout
exports.logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
}

