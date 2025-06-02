const { getUserFromCookies } = require('../middlewares/authMiddleware');
const criminalService = require('../services/criminalService');

// Get all criminals
exports.getAllCriminals = async (req, res) => {
    const filters = {};

    const token = req.cookies.authtoken;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.query.limit) {
        filters.limit = parseInt(req.query.limit, 10);
    }

    try {
        const criminals = await criminalService.getAllCriminals(filters, user.role, user.id);

        if (criminals.length === 0) {
            console.log("No criminals found");
            return res.status(404).json({ message: "No criminals found" });
        }

        res.status(200).json({ message: "Criminals fetched successfully", criminals });
    }
    catch (error) {
        console.error("Error fetching criminals:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Search criminals
exports.searchCriminals = async (req, res) => {
    try{
        const filters = { 
           name: req.query.name || "", 
           nic: req.query.nic || "", 
           id: req.query.criminal_id || "",
           fingerprint: req.query.fingerprint || "" 
        };

        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const criminals = await criminalService.searchCriminals(filters, user.role, user.id);

        if (criminals.length === 0) {
            return res.status(404).json({ message: "No criminals found matching the search criteria" });
        }

        res.status(200).json({ message: "Criminals fetched successfully", criminals });
    }
    catch (error) {
        console.error('Error in searchCriminals controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    
};

// Get single criminal by ID
exports.getCriminalById = async (req, res) => {
    const { id } = req.params;

    const token = req.cookies.authtoken;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const criminalData = await criminalService.getCriminalById(id, user.role, user.id);

        if (!criminalData) {
            return res.status(404).json({ message: "Criminal not found" });
        }

        res.status(200).json({ message: "Criminal fetched successfully", criminalData });
    }
    catch (error) {
        console.error("Error fetching criminal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create new criminal record
exports.createCriminal = async (req, res) => {
    try {
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Only OIC, Crime OIC, Inspector, Sub Inspector can create criminal records
        if (
            user.role !== 'OIC' &&
            user.role !== 'Crime OIC' &&
            user.role !== 'Inspector' &&
            user.role !== 'Sub Inspector'
        ) {
            return res.status(403).json({ message: "Forbidden: You do not have permission to create a criminal record" });
        }

        const criminalData = req.body;

        if (!criminalData.name || !criminalData.nic || !criminalData.dob) {
            return res.status(400).json({ message: "Name, NIC, and Date of Birth are required" });
        }

        // Additional validation can be added here

        try {
            const newCriminal = await criminalService.createCriminal(criminalData, user.user_id);
            res.status(201).json({ message: "Criminal record created successfully", criminal: newCriminal });
        }
        catch (error) {
            res.status(500).json({ message: error.sqlMessage });
        }
    } catch (error) {
        console.error("Error creating criminal record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update criminal record
exports.updateCriminal = async (req, res) => {
    const token = req.cookies.authtoken;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { criminal_id, name, nic, dob } = req.body;
    if (!criminal_id) {
        return res.status(400).json({ message: "Criminal ID is required" });
    }
    if (name !== undefined && (!name || !name.trim())) {
        return res.status(400).json({ message: "Name cannot be empty" });
    }
    if (nic !== undefined && (!nic || !nic.trim())) {
        return res.status(400).json({ message: "NIC cannot be empty" });
    }
    if (dob !== undefined && (!dob || !dob.trim())) {
        return res.status(400).json({ message: "Date of Birth cannot be empty" });
    }

    // Only allow update if at least one field is present
    const updatableFields = ['name', 'nic', 'phone', 'address', 'dob', 'fingerprint_hash', 'photo'];
    const hasUpdate = updatableFields.some(f => req.body[f] !== undefined);
    if (!hasUpdate) {
        return res.status(400).json({ message: "No changes detected" });
    }

    const updateData = req.body;

    try {
        const result = await criminalService.updateCriminal(criminal_id, updateData, user.user_id);

        if (!result) {
            return res.status(404).json({ message: "Criminal Data update failed" });
        }

        res.status(200).json({ message: "Criminal record updated successfully", success: result });
    }
    catch (error) {
        console.error("Error updating criminal record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};