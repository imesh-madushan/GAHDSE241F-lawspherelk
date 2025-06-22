const { getUserFromCookies } = require("../middlewares/authMiddleware");
const auditService = require("../services/auditService");

// Get all audit logs with user details, optionally filtered by batch ID
exports.getAllAuditLogs = async (req, res) => {
  const batchId = req.query.batchId || null;

  //   const token = req.cookies.authtoken;
  //   if (!token) {
  //     return res.status(401).json({ message: "No token provided" });
  //   }

  //   const user = await getUserFromCookies(token);
  //   if (!user) {
  //     return res.status(401).json({ message: "Unauthorized" });
  //   }

  //   // Only allow certain roles to access audit logs
  //   if (!["OIC", "Crime OIC", "Admin"].includes(user.role)) {
  //     return res.status(403).json({ message: "Access denied" });
  //   }

  try {
    const auditLogs = await auditService.getAllAuditLogs(batchId);

    if (!auditLogs || auditLogs.length === 0) {
      return res.status(404).json({
        message: batchId
          ? `No audit logs found for batch ID: ${batchId}`
          : "No audit logs found",
      });
    }

    res.status(200).json({
      message: "Audit logs fetched successfully",
      auditLogs,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search audit logs by batch ID or value
exports.searchAuditLogs = async (req, res) => {
  const searchParam = {
    batchId: req.query.batchId,
    value: req.query.value,
  };

  // Ensure at least one search parameter is provided
  if (!searchParam.batchId && !searchParam.value) {
    return res.status(400).json({
      message: "Please provide either a batch ID or a value to search for",
    });
  }

  //   const token = req.cookies.authtoken;
  //   if (!token) {
  //     return res.status(401).json({ message: "No token provided" });
  //   }

  //   const user = await getUserFromCookies(token);
  //   if (!user) {
  //     return res.status(401).json({ message: "Unauthorized" });
  //   }

  //   // Only allow certain roles to access audit logs
  //   if (!["OIC", "Crime OIC", "Admin"].includes(user.role)) {
  //     return res.status(403).json({ message: "Access denied" });
  //   }

  try {
    const auditLogs = await auditService.searchAuditLogs(searchParam);

    if (!auditLogs || auditLogs.length === 0) {
      return res.status(404).json({
        message: searchParam.batchId
          ? `No audit logs found for batch ID: ${searchParam.batchId}`
          : `No audit logs found containing value: ${searchParam.value}`,
      });
    }

    res.status(200).json({
      message: "Audit logs found",
      auditLogs,
    });
  } catch (error) {
    console.error("Error searching audit logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
