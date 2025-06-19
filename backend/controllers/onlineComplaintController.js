const onlineComplaintService = require("../services/onlineComplaintService");

// Controller to handle online complaint submission
exports.createOnlineComplaint = async (req, res) => {
    try {
        // TEMP: Log the incoming request body for testing
        console.log("[TEST] Online complaint received:", req.body);
        // Comment out the actual logic for now
        /*
        // Extract and validate required fields
        const { description, complainer, complain_type, evidence_details } = req.body;
        if (!description || !description.trim()) {
            return res.status(400).json({ message: "Complaint description is required" });
        }
        if (!complainer || !complainer.nic || !complainer.name || !complainer.phone || !complainer.email || !complainer.address || !complainer.dob) {
            return res.status(400).json({ message: "Complainer NIC, name, phone, email, address, and date of birth are required" });
        }
        const nicPattern = /^(\d{9}[vVxX]|\d{12})$/;
        if (!nicPattern.test(complainer.nic.trim())) {
            return res.status(400).json({ message: "Invalid NIC format" });
        }
        const phonePattern = /^0\d{9}$/;
        if (!phonePattern.test(complainer.phone.trim())) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(complainer.email.trim())) {
            return res.status(400).json({ message: "Invalid email format" });
        }
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
        // Call the service to create the complaint
        const newComplaint = await onlineComplaintService.createOnlineComplaint(description, complainer, evidence_details, complain_type);
        res.status(201).json({
            success: true,
            message: "Online complaint created successfully",
            complaint: newComplaint
        });
        */
        // Respond with a test message
        res.status(200).json({ message: "Test: Data received at backend", data: req.body });
    } catch (error) {
        console.error("Error creating online complaint:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
