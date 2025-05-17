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
    const { name, nic, fingerprint } = req.query;
    const filters = { name, nic, fingerprint };

    const token = req.cookies.authtoken;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const criminals = await criminalService.searchCriminals(filters, user.role, user.id);

        if (criminals.length === 0) {
            return res.status(404).json({ message: "No criminals found matching the search criteria" });
        }

        res.status(200).json({ message: "Criminals fetched successfully", criminals });
    }
    catch (error) {
        console.error("Error searching criminals:", error);
        res.status(500).json({ message: "Internal server error" });
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
    const criminalData = req.body;

    const token = req.cookies.authtoken;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const newCriminal = await criminalService.createCriminal(criminalData, user.role, user.id);
        res.status(201).json({ message: "Criminal record created successfully", criminal: newCriminal });
    }
    catch (error) {
        console.error("Error creating criminal record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update criminal record
exports.updateCriminal = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const token = req.cookies.authtoken;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const updatedCriminal = await criminalService.updateCriminal(id, updateData, user.role, user.id);

        if (!updatedCriminal) {
            return res.status(404).json({ message: "Criminal not found" });
        }

        res.status(200).json({ message: "Criminal record updated successfully", criminal: updatedCriminal });
    }
    catch (error) {
        console.error("Error updating criminal record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete criminal record
exports.deleteCriminal = async (req, res) => {
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
        const result = await criminalService.deleteCriminal(id, user.role, user.id);

        if (!result) {
            return res.status(404).json({ message: "Criminal not found" });
        }

        res.status(200).json({ message: "Criminal record deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting criminal record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}; 