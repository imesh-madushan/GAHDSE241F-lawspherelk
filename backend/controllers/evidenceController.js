const { getUserFromCookies } = require("../middlewares/authMiddleware");
const evidenceService = require("../services/evidenceService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory structure: uploads/evidences/:evidenceId
    const evidenceId = req.body.evidence_id || "temp";
    const uploadPath = path.join(
      __dirname,
      "../uploads/evidences",
      evidenceId
    );

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images, videos, audio, documents
    const allowedTypes =
      /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Only images, videos, audio files, and documents are allowed!"
        )
      );
    }
  },
});

exports.createEvidence = async (req, res) => {
  // Handle file uploads
  upload.array("attachments", 10)(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({
        success: false,
        message: "File upload error",
        error: uploadErr.message,
      });
    }

    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      type,
      location,
      details,
      collected_dt,
      linking_type, // 'case' or 'investigation'
      case_id,
      investigation_id,
      witnesses = [],
    } = req.body;

    // Get uploaded files from multer
    const attachments = req.files || [];

    if (!type || !details) {
      return res
        .status(400)
        .json({ message: "Evidence type and details are required" });
    }

    // Convert ISO string to MySQL datetime format
    let collectedDateTime;
    if (collected_dt && collected_dt !== "undefined") {
      const date = new Date(collected_dt);
      collectedDateTime = date.toISOString().slice(0, 19).replace("T", " ");
    } else {
      const now = new Date();
      collectedDateTime = now.toISOString().slice(0, 19).replace("T", " ");
    }

    if (linking_type === "case" && !case_id) {
      return res
        .status(400)
        .json({ message: "Case ID is required when linking to case" });
    }

    if (linking_type === "investigation" && !investigation_id) {
      return res.status(400).json({
        message: "Investigation ID is required when linking to investigation",
      });
    }

    // Parse witnesses if it's a string
    let parsedWitnesses = [];
    if (witnesses) {
      try {
        parsedWitnesses =
          typeof witnesses === "string" ? JSON.parse(witnesses) : witnesses;
        if (!Array.isArray(parsedWitnesses)) {
          parsedWitnesses = [];
        }
      } catch (e) {
        parsedWitnesses = [];
      }
    }

    try {
      const result = await evidenceService.createEvidence(
        {
          type,
          location,
          details,
          collectedDateTime,
          linking_type,
          case_id: case_id || null,
          investigation_id: investigation_id || null,
          witnesses: parsedWitnesses.filter((w) => w.nic && w.name), // Only include witnesses with required fields
          attachments, // Pass the actual uploaded files
        },
        user.user_id
      );

      if (!result) {
        return res.status(400).json({
          success: false,
          message: "Failed to create evidence",
        });
      }

      res.status(201).json({
        success: true,
        message: "Evidence created successfully",
        evidence: result,
      });
    } catch (error) {
      console.error("Error creating evidence:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  });
};

exports.getAllEvidence = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filters = {};

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

    const evidences = await evidenceService.getAllEvidence(
      user.role,
      user.user_id,
      filters
    );

    if (evidences.length === 0) {
      return res.status(200).json({
        message: "No evidence found",
        evidences: [],
        total: 0,
      });
    }

    res.status(200).json({
      message: "Evidence fetched successfully",
      evidences,
      total: evidences[0]?.total_count || 0,
    });
  } catch (error) {
    console.error("Error in getAllEvidence controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchEvidence = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      evidence_id: req.query.evidence_id,
      location: req.query.location,
      case_id: req.query.case_id,
      investigation_id: req.query.investigation_id,
      officer_name: req.query.officer_name,
      evidence_type: req.query.evidence_type,
      linking_type: req.query.linking_type,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
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

    const evidences = await evidenceService.searchEvidence(
      filters,
      user.role,
      user.user_id
    );

    if (evidences.length === 0) {
      return res.status(200).json({
        message: "No evidence found matching the criteria",
        evidences: [],
        total: 0,
      });
    }

    res.status(200).json({
      message: "Search completed successfully",
      evidences,
      total: evidences[0]?.total_count || 0,
    });
  } catch (error) {
    console.error("Error in searchEvidence controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getEvidenceById = async (req, res) => {
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

    const evidence = await evidenceService.getEvidenceById(id);

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: "Evidence not found",
      });
    }

    res.status(200).json({
      success: true,
      evidence,
      canEdit:
        evidence.officer_id === user.user_id ||
        user.role === "OIC" ||
        user.role === "Crime OIC",
    });
  } catch (error) {
    console.error("Error in getEvidenceById:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving evidence details",
      error: error.message,
    });
  }
};

exports.updateEvidence = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only OIC and Crime OIC can update evidence
    if (
      user.role !== "OIC" &&
      user.role !== "Crime OIC" &&
      user.role !== "Inspector" &&
      user.role !== "Sub Inspector"
    ) {
      return res.status(403).json({
        message:
          "Forbidden: Only OIC, Crime OIC, Inspector, or Sub Inspector can update evidence",
      });
    }

    const { evidence_id, type, location, details, collected_dt } = req.body;

    if (!evidence_id) {
      return res.status(400).json({ message: "Evidence ID is required" });
    }

    // Only send changed fields to service
    const updateFields = {};
    if (type !== undefined) updateFields.type = type;
    if (location !== undefined) updateFields.location = location;
    if (details !== undefined) updateFields.details = details;
    if (collected_dt !== undefined) updateFields.collected_dt = collected_dt;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No changes detected" });
    }

    const updatedEvidence = await evidenceService.updateEvidence(
      evidence_id,
      updateFields,
      user.user_id
    );

    if (!updatedEvidence) {
      return res.status(404).json({ message: "Evidence not found" });
    }

    res.status(200).json({
      success: true,
      message: "Evidence updated successfully",
      evidence: updatedEvidence,
    });
  } catch (error) {
    console.error("Error updating evidence:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
