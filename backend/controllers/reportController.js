const { getUserFromCookies } = require("../middlewares/authMiddleware");
const reportService = require("../services/reportService");

// Generate case report PDF
exports.generateCaseReport = async (req, res) => {
  try {
    const { caseId } = req.params;

    // Verify authentication
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user has permission to generate reports
    const allowedRoles = ["OIC", "Crime OIC", "Sub Inspector", "Inspector"];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions to generate reports.",
      });
    }

    if (!caseId) {
      return res.status(400).json({ message: "Case ID is required" });
    }

    // Generate the PDF report
    const report = await reportService.generateCaseReport(caseId, user.user_id);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.fileName}"`
    );
    res.setHeader("Content-Length", report.fileSize);

    // Send the PDF buffer
    res.send(report.buffer);
  } catch (error) {
    console.error("Error generating case report:", error);

    if (error.message === "Case not found") {
      return res.status(404).json({ message: "Case not found" });
    }

    res.status(500).json({
      message: "Failed to generate case report",
      error: error.message,
    });
  }
};

// Get report generation history for a case
exports.getReportHistory = async (req, res) => {
  try {
    const { caseId } = req.params;

    // Verify authentication
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // For now, we'll return empty array since we're not storing report history in database
    // This can be extended later to track report generation history
    res.status(200).json({
      message: "Report history retrieved successfully",
      reports: [],
    });
  } catch (error) {
    console.error("Error retrieving report history:", error);
    res.status(500).json({
      message: "Failed to retrieve report history",
      error: error.message,
    });
  }
};
