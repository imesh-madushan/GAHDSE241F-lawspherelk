const complainService = require("../services/complainService");
const { getUserFromCookies } = require('../middlewares/authMiddleware');
const { stat } = require("fs");

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

// create new complaint
exports.createComplaint = async (req, res) => {
    try {
        // Auth check
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        
        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Validate required fields
        const { description, complainer, complain_type, evidence_details } = req.body;
        
        if (!description || !description.trim()) {
            return res.status(400).json({ message: "Complaint description is required" });
        }
        
        if (!complainer || !complainer.nic || !complainer.name || !complainer.phone || !complainer.email || !complainer.address || !complainer.dob) {
            return res.status(400).json({ message: "Complainer NIC, name, phone, email, address, and date of birth are required" });
        }

        // Validate NIC format
        const nicPattern = /^(\d{9}[vVxX]|\d{12})$/;
        if (!nicPattern.test(complainer.nic.trim())) {
            return res.status(400).json({ message: "Invalid NIC format" });
        }

        // Validate phone format
        const phonePattern = /^0\d{9}$/;
        if (!phonePattern.test(complainer.phone.trim())) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(complainer.email.trim())) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate Date of Birth - now required
        if (!complainer.dob || !complainer.dob.trim()) {
            return res.status(400).json({ message: "Date of birth is required" });
        }
        
        const dobDate = new Date(complainer.dob);
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        
        if (isNaN(dobDate.getTime())) {
            return res.status(400).json({ message: "Invalid date of birth format" });
        }
        
        if (dobDate > today) {
            return res.status(400).json({ message: "Date of birth cannot be in the future" });
        }
        
        if (dobDate < minDate) {
            return res.status(400).json({ message: "Date of birth cannot be more than 120 years ago" });
        }
        
        if (dobDate > oneYearAgo) {
            return res.status(400).json({ message: "Complainer must be at least 1 year old" });
        }

        // Validate evidence details (voice statement)
        if (!evidence_details || !evidence_details.trim()) {
            return res.status(400).json({ message: "Voice statement details are required" });
        }
        
        if (!complain_type || !complain_type.trim()) {
            return res.status(400).json({ message: "Complaint type is required" });
        }

        if (evidence_details.trim().length < 10) {
            return res.status(400).json({ message: "Voice statement details must be at least 10 characters long" });
        }
        
        if (evidence_details.trim().length > 1000) {
            return res.status(400).json({ message: "Voice statement details cannot exceed 1000 characters" });
        }

        const newComplaint = await complainService.createComplaint(description, complainer, evidence_details, complain_type, user);

        res.status(201).json({
            success: true,
            message: "Complaint created successfully",
            complaint: newComplaint
        });
        
    } catch (error) {
        console.error("Error creating complaint:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Duplicate entry detected" });
        }
        
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.closeComplaint = async (req, res) => {
    try {
        // Auth check
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        
        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (user.role !== 'Crime OIC' && user.role !== 'OIC' && user.user_id) {
            return res.status(403).json({ message: "Forbidden: Only OIC or Crime OIC can close complaints" });
        }
        const { complain_id } = req.body;
        const { case_id } = req.body;

        if (!complain_id) {
            return res.status(400).json({ message: "Complaint ID is required" });
        }

        // Check if complaint exists and is not already closed
        const complaint = await complainService.getComplaintById(complain_id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        if (complaint.status === 'closed') {
            return res.status(400).json({ message: "Complaint is already closed" });
        }

        // Close the complaint (you would implement this in complainService)
        const result = await complainService.closeComplaint(complain_id, case_id, user.user_id);

        if (!result) {
            return res.status(500).json({ message: "Failed to close complaint" });
        }

        res.status(200).json({
            success: true,
            message: "Complaint closed successfully"
        });

    } catch (error) {
        console.error("Error closing complaint:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

exports.updateComplaint = async (req, res) => {
    try {
        // Auth check
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (user.role !== 'Crime OIC' && user.role !== 'OIC'){
            return res.status(403).json({ message: "Forbidden: Only OIC or Crime OIC can update complaints" });
        }

        const { complain_id } = req.body;
        const { description, status, complainer } = req.body;

        // At least one field must be present to update
        if (
            description === undefined &&
            status === undefined &&
            (complainer === undefined || Object.keys(complainer).length === 0)
        ) {
            return res.status(400).json({ message: "No changes detected" });
        }

        // If complainer is present, validate at least NIC and name if those fields are being updated
        if (complainer) {
            if (complainer.nic === undefined || !complainer.nic) {
                return res.status(400).json({ message: "Complainer NIC is required for update" });
            }
            if (complainer.name !== undefined && !complainer.name) {
                return res.status(400).json({ message: "Complainer name cannot be empty" });
            }
        }

        // Optionally: validate status if provided
        if (status && !['new', 'viewed', 'closed'].includes(status)) {
            return res.status(400).json({ message: "Invalid complaint status" });
        }

        // Update the complaint
        const result = await complainService.updateComplaint(complain_id, { description, status, complainer }, user.user_id);

        if (!result) {
            return res.status(500).json({ message: "Failed to update complaint" });
        }

        res.status(200).json({
            success: true,
            message: "Complaint updated successfully"
        });

    } catch (error) {
        console.error("Error updating complaint:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};