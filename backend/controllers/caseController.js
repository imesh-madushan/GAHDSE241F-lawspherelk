const { getUserFromCookies } = require("../middlewares/authMiddleware");
const caseService = require("../services/caseService");

// get all cases for OIC and Crime OIC
exports.getAllCases = async (req, res) => {
  const filters = {};

  const token = req.cookies.authtoken;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const user = await getUserFromCookies(token);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.query.status) {
    filters.status = req.query.status;
  }
  if (req.query.limit) {
    filters.limit = parseInt(req.query.limit, 10);
  }

  try {
    const cases = await caseService.getAllCases(filters, user.role, user.id);

    if (cases.length === 0) {
      console.log("No cases found");
      return res.status(404).json({ message: "No cases found" });
    }

    res.status(200).json({ message: "Cases fetched successfully", cases });
  } catch (error) {
    console.error("Error fetching cases:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get case by id
exports.getCaseById = async (req, res) => {
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
    const caseData = await caseService.getCaseById(id, user.role, user.id);

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    res.status(200).json({ message: "Case fetched successfully", caseData });
  } catch (error) {
    console.error("Error fetching case:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchCases = async (req, res) => {
  try {
    const filters = {
      topic: req.query.topic,
      case_id: req.query.case_id,
      case_type: req.query.case_type,
      officer: req.query.officer,
      status: req.query.status,
      timePeriod: req.query.timePeriod,
    };

    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cases = await caseService.searchCases(
      filters,
      user.role,
      user.user_id
    );

    if (!cases || cases.length === 0) {
      return res.status(200).json({
        message: "No cases found matching the criteria",
        cases: [],
      });
    }

    res.status(200).json({
      message: "Search completed successfully",
      cases,
    });
  } catch (error) {
    console.error("Error in searchCases controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//this will update already created case with new topic and leader
exports.createCase = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { complaintId, topic, leaderId, caseId } = req.body;

    // Validate required parameters
    if (!complaintId) {
      return res.status(400).json({ message: "Complaint ID is required" });
    }

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }
    if (!leaderId) {
      return res.status(400).json({ message: "Leader ID is required" });
    }
    // Create the case
    const result = await caseService.createCase(
      complaintId,
      topic,
      leaderId,
      caseId
    );
    if (!result) {
      return res.status(500).json({ message: "Failed to create case" });
    }

    res.status(201).json({
      success: true,
      message: "Case created successfully",
    });
  } catch (error) {
    console.error("Error creating case:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateCase = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //update code here
    const { case_id, topic, leader_id } = req.body;
    if (!case_id) {
      return res.status(400).json({ message: "Case ID is required" });
    }
    console.log(user.user_id, leader_id);

    const case_leader = await caseService.getCaseLeader(case_id);
    if (!case_leader) {
      return res.status(404).json({ message: "Case leader not found" });
    }

    if (
      user.user_id !== case_leader &&
      user.role !== "OIC" &&
      user.role !== "Crime OIC"
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to change the case leader" });
    }

    // Check if case exists and is not closed
    const caseStatus = await caseService.getCaseStatus(case_id);
    if (!caseStatus) {
      return res.status(404).json({ message: "Case not found" });
    }
    if (caseStatus.status === "closed") {
      return res.status(403).json({
        message: "Cannot update case",
        details: "This case has been closed and can't be updated.",
      });
    }

    const result = await caseService.updateCase(
      case_id,
      { topic, leader_id },
      user.user_id
    );
    if (!result) {
      return res.status(404).json({ message: "Case update failed" });
    }

    res.status(200).json({
      success: true,
      message: "Case updated successfully",
    });
  } catch (error) {
    console.error("Error updating case:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create case from online complaint (for OIC/Crime OIC)
exports.createCaseFromOnlineComplaint = async (req, res) => {
  try {
    const { complaintId, topic, leaderId } = req.body;

    if (!complaintId || !topic || !leaderId) {
      return res.status(400).json({
        success: false,
        message: "Complaint ID, topic, and leader ID are required",
      });
    }

    // Check if user has permission to create cases
    if (req.user.role !== "OIC" && req.user.role !== "Crime OIC") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only OIC and Crime OIC can create cases.",
      });
    }

    // Create case from online complaint
    const result = await caseService.createCaseFromOnlineComplaint({
      complaintId,
      topic,
      leaderId,
      createdBy: req.user.user_id,
    });

    res.status(201).json({
      success: true,
      message: "Case created successfully from online complaint",
      caseId: result.caseId,
    });
  } catch (error) {
    console.error("Error creating case from online complaint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
