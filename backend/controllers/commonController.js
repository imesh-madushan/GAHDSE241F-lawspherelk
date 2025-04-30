const db = require("../config/db");
const { getUserFromCookies } = require('../middlewares/authMiddleware');
const commonService = require('../services/commonService');

//get all counts of cases, complaints, investigations, and evidences
exports.getAllStatsCount = async (req, res) => {
    try {
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!["OIC", "Crime OIC", "Sub Inspector", "Sergeant"].includes(user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const stats = await commonService.getAllStatsCount(user.role, user.id);
        
        if (!stats) {
            console.log("No stats found");
            return res.status(404).json({ message: "No stats found" });
        }
        
        res.status(200).json({ statsValues: stats });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};