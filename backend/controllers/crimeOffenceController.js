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