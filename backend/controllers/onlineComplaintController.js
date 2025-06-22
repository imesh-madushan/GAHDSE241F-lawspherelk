const onlineComplaintService = require("../services/onlineComplaintService");
const axios = require("axios");
const formidable = require("formidable");
const FormData = require("form-data");
const fs = require("fs");
const { generateUniqueId } = require("../utils/genarateIDs");
const { getUserFromCookies } = require("../middlewares/authMiddleware");

// Configuration for file server
const FILE_SERVER_URL = "http://localhost:5001"; // Same as evidence system

// Create a new online complaint (no authentication required)
exports.createOnlineComplaint = async (req, res) => {
  try {
    const complaint_type = req.body.complaint_type?.trim();
    const description = req.body.description?.trim();
    const complainant_full_name = req.body.complainant_full_name?.trim();
    const nic_no = req.body.nic_no?.trim();
    const dob = req.body.dob?.trim();
    const phone_no = req.body.phone_no?.trim();
    const email = req.body.email?.trim();
    const address = req.body.address?.trim();

    // Validate required fields
    if (
      !complaint_type ||
      !description ||
      !complainant_full_name ||
      !nic_no ||
      !dob ||
      !phone_no ||
      !email ||
      !address
    ) {
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
    const minDate = new Date(
      today.getFullYear() - 120,
      today.getMonth(),
      today.getDate()
    );
    const fiveYearsAgo = new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate()
    );
    if (
      isNaN(dobDate.getTime()) ||
      dobDate > today ||
      dobDate < minDate ||
      dobDate > fiveYearsAgo
    ) {
      return res.status(400).json({ message: "Invalid date of birth." });
    }
    // Validate evidence files (max 10, each <= 50MB)
    if (req.files && req.files.length > 10) {
      return res
        .status(400)
        .json({ message: "Maximum 10 evidence files allowed." });
    }
    // Call service to save complaint and evidence
    const complaint_id =
      await onlineComplaintService.createOnlineComplaintWithFiles(
        {
          complaint_type,
          description,
          complainant_full_name,
          nic_no,
          dob,
          phone_no,
          email,
          address,
        },
        req.files
      );

    res
      .status(201)
      .json({ message: "Complaint submitted successfully.", complaint_id });
  } catch (err) {
    console.error("Error creating online complaint:", err);
    res.status(500).json({ message: "Internal server error." });
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
    res.status(200).json({
      message: "Online complaint fetched successfully",
      complaintData,
    });
  } catch (error) {
    console.error("Error fetching online complaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new online complaint with file upload support (same as evidence system)
exports.createOnlineComplaintWithFileUpload = async (req, res) => {
  try {
    // Use formidable to parse form data with files (same as evidence system)
    const form = new formidable.IncomingForm({
      multiples: true,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return res.status(400).json({
          message: "Error parsing form data",
          error: err.message,
        });
      }

      // Extract fields from the form data - Get the first value if it's an array
      const complaint_type = Array.isArray(fields.complaint_type)
        ? fields.complaint_type[0]
        : fields.complaint_type;
      const description = Array.isArray(fields.description)
        ? fields.description[0]
        : fields.description;
      const complainant_full_name = Array.isArray(fields.complainant_full_name)
        ? fields.complainant_full_name[0]
        : fields.complainant_full_name;
      const nic_no = Array.isArray(fields.nic_no)
        ? fields.nic_no[0]
        : fields.nic_no;
      const dob = Array.isArray(fields.dob) ? fields.dob[0] : fields.dob;
      const phone_no = Array.isArray(fields.phone_no)
        ? fields.phone_no[0]
        : fields.phone_no;
      const email = Array.isArray(fields.email)
        ? fields.email[0]
        : fields.email;
      const address = Array.isArray(fields.address)
        ? fields.address[0]
        : fields.address;

      // Validate required fields
      if (
        !complaint_type ||
        !description ||
        !complainant_full_name ||
        !nic_no ||
        !dob ||
        !phone_no ||
        !email ||
        !address
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Validate NIC format
      if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(nic_no?.trim())) {
        return res.status(400).json({ message: "Invalid NIC format." });
      }

      // Validate phone number
      if (!/^0\d{9}$/.test(phone_no?.trim())) {
        return res
          .status(400)
          .json({ message: "Invalid phone number format." });
      }

      // Validate email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim())) {
        return res.status(400).json({ message: "Invalid email format." });
      }

      // Validate DOB
      const dobDate = new Date(dob);
      const today = new Date();
      const minDate = new Date(
        today.getFullYear() - 120,
        today.getMonth(),
        today.getDate()
      );
      const fiveYearsAgo = new Date(
        today.getFullYear() - 5,
        today.getMonth(),
        today.getDate()
      );
      if (
        isNaN(dobDate.getTime()) ||
        dobDate > today ||
        dobDate < minDate ||
        dobDate > fiveYearsAgo
      ) {
        return res.status(400).json({ message: "Invalid date of birth." });
      }

      // Validate evidence files (max 10, each <= 50MB)
      if (files.evidence) {
        const fileList = Array.isArray(files.evidence)
          ? files.evidence
          : [files.evidence];
        if (fileList.length > 10) {
          return res
            .status(400)
            .json({ message: "Maximum 10 evidence files allowed." });
        }
      }

      // Generate complaint ID first to create folder structure
      const complaint_id = await generateUniqueId("online_complaints");

      // Process and upload evidence files to file server (same as evidence system)
      const processedEvidenceFiles = [];

      if (files.evidence) {
        const fileList = Array.isArray(files.evidence)
          ? files.evidence
          : [files.evidence];

        for (const file of fileList) {
          if (file && file.originalFilename) {
            try {
              // Create form data for file upload to file server
              const formData = new FormData();
              formData.append("file", fs.createReadStream(file.filepath));
              formData.append("folder", "online_evidences"); // Use online_evidences folder
              formData.append("evidence_id", complaint_id); // Use complaint_id as evidence_id

              // Upload to file server (same endpoint as evidence system)
              const fileResponse = await axios.post(
                `${FILE_SERVER_URL}/upload`,
                formData,
                {
                  headers: {
                    ...formData.getHeaders(),
                  },
                }
              );

              if (fileResponse.data.success) {
                // Add file metadata to processed evidence files
                processedEvidenceFiles.push({
                  original_name: fileResponse.data.original_name,
                  file_name: fileResponse.data.original_name,
                  file_path: `${FILE_SERVER_URL}${fileResponse.data.file_path}`, // Full URL path
                  file_type: fileResponse.data.file_type,
                  file_size: fileResponse.data.file_size,
                });
              } else {
                console.error(
                  "Error uploading file to file server:",
                  fileResponse.data
                );
              }
            } catch (error) {
              console.error("Error processing evidence file:", error.message);
            }
          }
        }
      }

      try {
        // Call service to save complaint and evidence files
        const result = await onlineComplaintService.createOnlineComplaintFinal({
          complaint_id,
          complaint_type: complaint_type?.trim(),
          description: description?.trim(),
          complainant_full_name: complainant_full_name?.trim(),
          nic_no: nic_no?.trim(),
          dob: dob?.trim(),
          phone_no: phone_no?.trim(),
          email: email?.trim(),
          address: address?.trim(),
          evidenceFiles: processedEvidenceFiles,
        });

        res.status(201).json({
          message: "Complaint submitted successfully.",
          complaint_id: result,
        });
      } catch (error) {
        console.error("Error creating online complaint:", error);
        res.status(500).json({
          message: "Internal server error.",
          error: error.message,
        });
      }
    });
  } catch (err) {
    console.error("Error in createOnlineComplaint:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get all online complaints (OIC and Crime OIC only)
exports.getAllOnlineComplaints = async (req, res) => {
  try {
    // Check if user has permission
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (
        user.role !== "OIC" &&
        user.role !== "Crime OIC"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Only OIC and Crime OIC can view online complaints.",
      });
    }

    const { status } = req.query;
    const result = await onlineComplaintService.getAllOnlineComplaints({
      status,
    });

    res.status(200).json({
      success: true,
      complaints: result,
    });
  } catch (error) {
    console.error("Error fetching online complaints:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Get single online complaint (OIC and Crime OIC only)
exports.getOnlineComplaintById = async (req, res) => {
  try {
    // Check if user has permission
     // Check if user has permission
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (
        user.role !== "OIC" &&
        user.role !== "Crime OIC"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Only OIC and Crime OIC can view online complaints.",
      });
    }

    const { complaintId } = req.params;
    const result = await onlineComplaintService.getOnlineComplaintWithFiles(
      complaintId
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Online complaint not found.",
      });
    }

    res.status(200).json({
      success: true,
      complaint: result,
    });
  } catch (error) {
    console.error("Error fetching online complaint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Search online complaints (OIC and Crime OIC only)
exports.searchOnlineComplaints = async (req, res) => {
  try {
     // Check if user has permission
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (
        user.role !== "OIC" &&
        user.role !== "Crime OIC"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Only OIC and Crime OIC can view online complaints.",
      });
    }

    const searchParams = req.query;
    const result = await onlineComplaintService.searchOnlineComplaints(
      searchParams
    );

    res.status(200).json({
      success: true,
      complaints: result,
    });
  } catch (error) {
    console.error("Error searching online complaints:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Update online complaint (OIC and Crime OIC only)
exports.updateOnlineComplaint = async (req, res) => {
  try {
    // Check if user has permission

    const { complaint_id, description, status } = req.body;

    if (!complaint_id) {
      return res.status(400).json({
        success: false,
        message: "Complaint ID is required.",
      });
    }

    const result = await onlineComplaintService.updateOnlineComplaint({
      complaint_id,
      description,
      status,
      updated_by: req.user.user_id,
    });

    res.status(200).json({
      success: true,
      message: "Online complaint updated successfully.",
      result,
    });
  } catch (error) {
    console.error("Error updating online complaint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Close online complaint (OIC and Crime OIC only)
exports.closeOnlineComplaint = async (req, res) => {
  try {
     // Check if user has permission
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (
        user.role !== "OIC" &&
        user.role !== "Crime OIC"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Only OIC and Crime OIC can view online complaints.",
      });
    }

    const { complaint_id, case_id } = req.body;

    if (!complaint_id) {
      return res.status(400).json({
        success: false,
        message: "Complaint ID is required.",
      });
    }

    const result = await onlineComplaintService.closeOnlineComplaint({
      complaint_id,
      case_id,
      closed_by: req.user.user_id,
    });

    res.status(200).json({
      success: true,
      message: "Online complaint closed successfully.",
      result,
    });
  } catch (error) {
    console.error("Error closing online complaint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// ...existing code...
