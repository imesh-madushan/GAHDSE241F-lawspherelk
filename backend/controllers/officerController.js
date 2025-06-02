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
        
        const result = await officerService.toggleOfficerAccount(officerId, user.user_id); 
        
        if (!result) {
            return res.status(404).json({ message: "Officer not found" });
        }
        
        res.status(200).json({ success: true, message: "Account status toggled" });
    } catch (error) {
        console.error("Error in toggleOfficerAccount:", error);
        res.status(500).json({ message: "Failed to toggle account status", error: error.message });
    }
};

exports.updateOfficer = async (req, res) => {
    const token = req.cookies.authtoken;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Only OIC can update officer details
    if (user.role !== "OIC") {
        return res.status(403).json({ message: "Forbidden: Only OIC can update officer details" });
    }

    // Accept all updatable officer fields
    const {
        officerId,
        name,
        nic,
        phone,
        email,
        address,
        role,
        profile_pic
    } = req.body;

    if (!officerId) {
        return res.status(400).json({ message: "Officer ID is required" });
    }

    // Only send changed fields to service
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (nic !== undefined) updateFields.nic = nic;
    if (phone !== undefined) updateFields.phone = phone;
    if (email !== undefined) updateFields.email = email;
    if (address !== undefined) updateFields.address = address;
    if (role !== undefined) updateFields.role = role;
    if (profile_pic !== undefined) updateFields.profile_pic = profile_pic;

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: "No changes detected" });
    }

    try {
        const updatedOfficer = await officerService.updateOfficer(
            officerId,
            updateFields,
            user.user_id // pass OIC user id for audit
        );
        if (!updatedOfficer) {
            return res.status(404).json({ message: "Officer not found" });
        }
        res.status(200).json({ success: true, message: "Officer updated successfully", officer: updatedOfficer });
    } catch (error) {
        console.error("Error updating officer:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};