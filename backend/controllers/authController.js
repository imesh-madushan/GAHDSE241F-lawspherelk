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
            const user = rows[0];
            const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            // res.json({ token });

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600000 // 1 hour
            });

            //create a session for the user
            query = "INSERT INTO UserSessions (session_id, user_id, device_info, login_time, last_activity, current_cookie) VALUES (?, ?, ?, ?, ?, ?)";

            res.status(200).json({ message: "Login successful", token });
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