const complainService = require("../services/complainService");
const { getUserFromCookies } = require('../middlewares/authMiddleware');

// get all complaints
exports.getAllComplaints = async (req, res) => {
    const filters = {};

    if (req.query.status) {
        filters.status = req.query.status;
    }
    if (req.query.limit) {
        filters.limit = parseInt(req.query.limit, 10);
    } 
    
    try {
        const complaints = await complainService.getAllComplaints(filters);

        if (complaints.length === 0) {
            return res.status(404).json({ message: "No complaints found" });
        }
        res.status(200).json({message: "Complaints fetched successfully", complaints});
    } 
    catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//
// get complaint by id
exports.getComplaintById = async (req, res) => {
    const { id } = req.params;

    try {
        const complaintData = await complainService.getComplaintById(id);

        if (!complaintData) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        res.status(200).json({message: "Complaint fetched successfully", complaintData});
    } 
    catch (error) {
        console.error("Error fetching complaint:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//
// search complaints
exports.searchComplaints = async (req, res) => {
    try {
        // Auth check (like in case controller)
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const filters = {
            description: req.query.description,
            complain_id: req.query.complain_id,
            officer: req.query.officer,
            complainer: req.query.complainer,
            status: req.query.status,
            timePeriod: req.query.timePeriod // <-- add timePeriod
        };

        // Add more filters as needed (date, etc.)

        const complaints = await complainService.searchComplaints(filters);

        res.status(200).json({
            message: "Search completed successfully",
            complaints: complaints || []
        });
    } catch (error) {
        console.error('Error in searchComplaints controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};