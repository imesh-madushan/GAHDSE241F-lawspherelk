const { getUserFromCookies } = require('../middlewares/authMiddleware');
const investigationService = require('../services/investigationService');

exports.getAllInvestigations = async (req, res) => {
    try {
        const filters = {};

        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get pagination and sorting parameters
        if (req.query.limit) {
            filters.limit = parseInt(req.query.limit, 10);
        }
        if (req.query.offset) {
            filters.offset = parseInt(req.query.offset, 10);
        }
        if (req.query.sortBy) {
            filters.sortBy = req.query.sortBy;
        }
        if (req.query.sortOrder) {
            filters.sortOrder = req.query.sortOrder;
        }
        if (req.query.search) {
            filters.search = req.query.search;
        }

        const investigations = await investigationService.getAllInvestigations(user.id, filters);

        if (investigations.length === 0) {
            return res.status(200).json({
                message: "No investigations found",
                investigations: [],
                total: 0
            });
        }

        res.status(200).json({
            message: "Investigations fetched successfully",
            investigations,
            total: investigations[0]?.total_count || 0
        });
    } catch (error) {
        console.error('Error in getAllInvestigations controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.searchInvestigations = async (req, res) => {
    try {
        const filters = {
            topic: req.query.topic,
            investigation_id: req.query.investigation_id,
            case_id: req.query.case_id,
            officer_name: req.query.officer_name,
            status: req.query.status,
            location: req.query.location,
            start_date: req.query.start_date,
            end_date: req.query.end_date
        };

        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get pagination and sorting parameters
        if (req.query.limit) {
            filters.limit = parseInt(req.query.limit, 10);
        }
        if (req.query.offset) {
            filters.offset = parseInt(req.query.offset, 10);
        }
        if (req.query.sortBy) {
            filters.sortBy = req.query.sortBy;
        }
        if (req.query.sortOrder) {
            filters.sortOrder = req.query.sortOrder;
        }

        const investigations = await investigationService.searchInvestigations(filters, user.user_id);

        if (investigations.length === 0) {
            return res.status(200).json({
                message: "No investigations found matching the criteria",
                investigations: [],
                total: 0
            });
        }

        res.status(200).json({
            message: "Search completed successfully",
            investigations,
            total: investigations[0]?.total_count || 0
        });
    } catch (error) {
        console.error('Error in searchInvestigations controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getInvestigationById = async (req, res) => {
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

        const investigation = await investigationService.getInvestigationById(id);

        if (!investigation) {
            return res.status(404).json({
                success: false,
                message: 'Investigation not found'
            });
        }

        res.status(200).json({
            success: true,
            investigation
        });
    } catch (error) {
        console.error('Error in getInvestigationById:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving investigation details',
            error: error.message
        });
    }
};

exports.createInvestigation = async (req, res) => {
    try {
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Only certain roles can create investigations
        if (user.role !== "OIC" && user.role !== "Crime OIC" && user.role !== "Inspector" && user.role !== "Sub Inspector") {
            return res.status(403).json({ message: "Forbidden: Only OIC, Crime OIC, Inspector, or Sub Inspector can create investigations" });
        }

        const {
            topic,
            location,
            case_id,
            officer_ids
        } = req.body;

        // Basic validation
        if (!topic || !location || !case_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await investigationService.createInvestigation({
            topic,
            location,
            case_id,
            officer_ids
        }, user.user_id);

        res.status(201).json({
            success: true,
            message: "Investigation created successfully",
            investigation: result
        });
    } catch (error) {
        console.error('Error in createInvestigation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateInvestigation = async (req, res) => {
    try {
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Only certain roles can update investigations
        if (user.role !== "OIC" && user.role !== "Crime OIC" && user.role !== "Inspector" && user.role !== "Sub Inspector") {
            return res.status(403).json({ message: "Forbidden: Only OIC, Crime OIC, Inspector, or Sub Inspector can update investigations" });
        }

        const {
            investigation_id,
            topic,
            location,
            status,
            end_dt
        } = req.body;

        if (!investigation_id) {
            return res.status(400).json({ message: "Investigation ID is required" });
        }

        // Only send changed fields to service
        const updateFields = {};
        if (topic !== undefined) updateFields.topic = topic;
        if (location !== undefined) updateFields.location = location;
        if (status !== undefined) updateFields.status = status;
        if (end_dt !== undefined) updateFields.end_dt = end_dt;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No changes detected" });
        }

        const updatedInvestigation = await investigationService.updateInvestigation(
            investigation_id,
            updateFields,
            user.user_id
        );

        if (!updatedInvestigation) {
            return res.status(404).json({ message: "Investigation not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: "Investigation updated successfully", 
            investigation: updatedInvestigation 
        });
    } catch (error) {
        console.error("Error updating investigation:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

exports.addOfficerToInvestigation = async (req, res) => {
    try {
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { investigation_id, officer_id } = req.body;

        if (!investigation_id || !officer_id) {
            return res.status(400).json({ message: "Investigation ID and Officer ID are required" });
        }

        // Get investigation details to check permissions
        const investigation = await investigationService.getInvestigationById(investigation_id);
        if (!investigation) {
            return res.status(404).json({ message: "Investigation not found" });
        }

        // Check permissions - only case leader, Crime OIC, or OIC can add officers
        if (user.role !== "OIC" && user.role !== "Crime OIC" && user.user_id !== investigation.leader_id) {
            return res.status(403).json({ message: "Forbidden: Only case leader, Crime OIC, or OIC can add officers" });
        }

        await investigationService.addOfficerToInvestigation(investigation_id, officer_id, user.user_id);

        res.status(200).json({
            success: true,
            message: "Officer added to investigation successfully"
        });
    } catch (error) {
        console.error('Error adding officer to investigation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Internal server error' 
        });
    }
};

exports.removeOfficerFromInvestigation = async (req, res) => {
    try {
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { investigation_id, officer_id } = req.body;

        if (!investigation_id || !officer_id) {
            return res.status(400).json({ message: "Investigation ID and Officer ID are required" });
        }

        // Get investigation details to check permissions
        const investigation = await investigationService.getInvestigationById(investigation_id);
        if (!investigation) {
            return res.status(404).json({ message: "Investigation not found" });
        }

        // Check permissions - only case leader, Crime OIC, or OIC can remove officers
        if (user.role !== "OIC" && user.role !== "Crime OIC" && user.user_id !== investigation.leader_id) {
            return res.status(403).json({ message: "Forbidden: Only case leader, Crime OIC, or OIC can remove officers" });
        }

        await investigationService.removeOfficerFromInvestigation(investigation_id, officer_id, user.user_id);

        res.status(200).json({
            success: true,
            message: "Officer removed from investigation successfully"
        });
    } catch (error) {
        console.error('Error removing officer from investigation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Internal server error' 
        });
    }
};
