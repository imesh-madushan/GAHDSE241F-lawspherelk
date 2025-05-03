const db = require("../config/db");
const { getUserFromCookies } = require('../middlewares/authMiddleware');
const officerService = require('../services/officerService');

exports.getAll = async (req, res) => {
    try {
        // Get roles from request body (since we're using POST)
        const roles = req.body.roles || [];
        
        // Fetch officers (users) with the specified roles
        const officers = await officerService.getAllOfficers({ roles });
        
        res.status(200).json(officers);
    } catch (error) {
        console.error("Error in getAll officers:", error);
        res.status(500).json({ message: "Failed to fetch officers", error: error.message });
    }
}