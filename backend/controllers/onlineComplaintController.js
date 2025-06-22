const onlineComplaintService = require("../services/onlineComplaintService");
const db = require("../config/db");

// Create a new online complaint (no authentication required)
exports.createOnlineComplaint = async (req, res) => {
    try {
        // Log incoming request for debugging
        console.log('[INFO] Received body:', req.body);
        console.log('[INFO] Received files:', req.files);

        const complaint_type = req.body.complaint_type?.trim();
        const description = req.body.description?.trim();
        const complainant_full_name = req.body.complainant_full_name?.trim();
        const nic_no = req.body.nic_no?.trim();
        const dob = req.body.dob?.trim();
        const phone_no = req.body.phone_no?.trim();
        const email = req.body.email?.trim();
        const address = req.body.address?.trim();

        // Validate required fields
        if (!complaint_type || !description || !complainant_full_name || !nic_no || !dob || !phone_no || !email || !address) {
            return res.status(400).json({ message: "All fields are required." });
        }
        // Validate NIC format
        if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(nic_no)) {
            return res.status(400).json({ message: "Invalid NIC format." });
        }
        // Validate phone number
        if (!/^0\d{9}$/.test(phone_no)) {
            return res.status(400).json({ message: "Invalid phone number format." });
        }
        // Validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }
        // Validate DOB
        const dobDate = new Date(dob);
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
        const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
        if (isNaN(dobDate.getTime()) || dobDate > today || dobDate < minDate || dobDate > fiveYearsAgo) {
            return res.status(400).json({ message: "Invalid date of birth." });
        }
        // Validate evidence files (max 10, each <= 50MB)
        if (req.files && req.files.length > 10) {
            return res.status(400).json({ message: "Maximum 10 evidence files allowed." });
        }
        // Call service to save complaint and evidence
        const complaint_id = await onlineComplaintService.createOnlineComplaint({
            complaint_type,
            description,
            complainant_full_name,
            nic_no,
            dob,
            phone_no,
            email,
            address
        }, req.files);
        res.status(201).json({ message: 'Complaint submitted successfully.', complaint_id });
    } catch (err) {
        console.error('Error creating online complaint:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get a single online complaint by ID
exports.viewOnlineComplaint = async (req, res) => {
    const { id } = req.params;
    try {
        const complaintData = await onlineComplaintService.viewOnlineComplaint(id);
        if (!complaintData) {
            return res.status(404).json({ message: "Online complaint not found" });
        }
        res.status(200).json({ message: "Online complaint fetched successfully", complaintData });
    } catch (error) {
        console.error("Error fetching online complaint:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

