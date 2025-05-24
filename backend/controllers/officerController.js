const db = require("../config/db");
const { getUserFromCookies } = require('../middlewares/authMiddleware');
const officerService = require('../services/officerService');

exports.getAll = async (req, res) => {
    const token = req.cookies.authtoken;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const roles = req.body.roles || [];
        const officers = await officerService.getAllOfficers(roles, user.role, user.user_id);

        res.status(200).json(officers);
    } catch (error) {
        console.error("Error in getAll officers:", error);
        res.status(500).json({ message: "Failed to fetch officers", error: error.message });
    }
}

exports.searchOfficers = async (req, res) => {
    const filters = {
        role: req.body.role || null,
        name: req.body.name || null,
        id: req.body.id || null,
        nic: req.body.nic || null,
        phone: req.body.phone || null,
        email: req.body.email || null,
        page: req.body.page || 1,
        pageSize: req.body.pageSize || 12
    };

    const token = req.cookies.authtoken;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }


    try {
        const officers = await officerService.searchOfficers(filters, user.role, user.user_id);
        res.status(200).json(officers);
    } catch (error) {
        res.status(500).json({ message: "Failed to search officers", error: error.message });
    }
};

exports.getOfficerById = async (req, res) => {
    try {
        const { id } = req.params;

        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const officerData = await officerService.getOfficerById(id);

        if (!officerData) {
            return res.status(404).json({
                success: false,
                message: 'Officer not found'
            });
        }

        res.status(200).json({
            success: true,
            officerData
        });
    } catch (error) {
        console.error('Error in getOfficerById:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving officer details',
            error: error.message
        });
    }
};

exports.toggleOfficerAccount = async (req, res) => {
    try {
        const { officerId } = req.body;
        const token = req.cookies.authtoken;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);

        if (!user || user.role !== "OIC") {
            return res.status(403).json({ message: "Forbidden: Only OIC can perform this action" });
        }
        
        if (!officerId) {
            return res.status(400).json({ message: "Officer ID is required" });
        }

        if (user.user_id === officerId) {
            return res.status(400).json({ message: "You cannot toggle your own account status" });
        }
        
        const result = await officerService.toggleOfficerAccount(officerId);
        
        if (!result) {
            return res.status(404).json({ message: "Officer not found" });
        }
        
        res.status(200).json({ success: true, message: "Account status toggled" });
    } catch (error) {
        console.error("Error in toggleOfficerAccount:", error);
        res.status(500).json({ message: "Failed to toggle account status", error: error.message });
    }
};