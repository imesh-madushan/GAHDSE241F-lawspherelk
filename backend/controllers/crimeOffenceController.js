const { getUserFromCookies } = require('../middlewares/authMiddleware');
const crimeOffenceService = require('../services/crimeOffenceService');

exports.getAllOffences = async (req, res) => {
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

        const offences = await crimeOffenceService.getAllOffences(user.role, user.id, filters);

        if (offences.length === 0) {
            return res.status(200).json({
                message: "No offences found",
                offences: [],
                total: 0
            });
        }

        res.status(200).json({
            message: "Offences fetched successfully",
            offences,
            total: offences[0]?.total_count || 0
        });
    } catch (error) {
        console.error('Error in getAllOffences controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.searchOffences = async (req, res) => {
    try {
        const filters = {
            crime_type: req.query.crime_type,
            criminal_name: req.query.criminal_name,
            criminal_id: req.query.criminal_id,
            fingerprint: req.query.fingerprint,
            case_id: req.query.case_id,
            status: req.query.status,
            risk_level: req.query.risk_level,
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

        const offences = await crimeOffenceService.searchOffences(
            filters,
            user.role,
            user.id
        );

        if (offences.length === 0) {
            return res.status(200).json({
                message: "No offences found matching the criteria",
                offences: [],
                total: 0
            });
        }

        res.status(200).json({
            message: "Search completed successfully",
            offences,
            total: offences[0]?.total_count || 0
        });
    } catch (error) {
        console.error('Error in searchOffences controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createOffence = async (req, res) => {
    try {
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const {
            crime_type,
            risk_score,
            reported_dt,
            happened_dt,
            criminal_id,
            case_id
        } = req.body;

        // Basic validation
        if (!crime_type || !risk_score || !reported_dt || !criminal_id || !case_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await crimeOffenceService.createOffence({
            crime_type,
            risk_score,
            reported_dt,
            happened_dt,
            criminal_id,
            case_id
        }, user.user_id);

        res.status(201).json({
            success: true,
            message: "Crime offence created successfully",
            offence: result
        });
    } catch (error) {
        console.error('Error in createOffence:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getOffenceById = async (req, res) => {
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

        const offence = await crimeOffenceService.getOffenceById(id);

        if (!offence) {
            return res.status(404).json({
                success: false,
                message: 'Offence not found'
            });
        }

        res.status(200).json({
            success: true,
            offence
        });
    } catch (error) {
        console.error('Error in getOffenceById:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving offence details',
            error: error.message
        });
    }
};

exports.updateOffence = async (req, res) => {
    try {
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Only OIC and Crime OIC can update offences
        if (user.role !== "OIC" && user.role !== "Crime OIC" && user.role !== "Inspector" && user.role !== "Sub Inspector") {
            return res.status(403).json({ message: "Forbidden: Only OIC, Crime OIC, Inspector, or Sub Inspector can update offences" });
        }

        const {
            offence_id,
            crime_type,
            status,
            risk_score,
            reported_dt,
            happened_dt
        } = req.body;

        if (!offence_id) {
            return res.status(400).json({ message: "Offence ID is required" });
        }

        // Only send changed fields to service
        const updateFields = {};
        if (crime_type !== undefined) updateFields.crime_type = crime_type;
        if (status !== undefined) updateFields.status = status;
        if (risk_score !== undefined) updateFields.risk_score = risk_score;
        if (reported_dt !== undefined) updateFields.reported_dt = reported_dt;
        if (happened_dt !== undefined) updateFields.happened_dt = happened_dt;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No changes detected" });
        }

        const updatedOffence = await crimeOffenceService.updateOffence(
            offence_id,
            updateFields,
            user.user_id
        );

        if (!updatedOffence) {
            return res.status(404).json({ message: "Offence not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: "Offence updated successfully", 
            offence: updatedOffence 
        });
    } catch (error) {
        console.error("Error updating offence:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};