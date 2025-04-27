const jwt = require("jsonwebtoken");
const db = require("../config/db");

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
        role: userRows[0].role,
        name: userRows[0].name,
        email: userRows[0].email,
        phone: userRows[0].phone,
        address: userRows[0].address,
        created_dt: userRows[0].created_dt
      };
    }
    catch (err) {
      console.error("JWT or DB error:", err);
      return null;
    }
  }
exports.getUserFromCookies = getUserFromCookies;