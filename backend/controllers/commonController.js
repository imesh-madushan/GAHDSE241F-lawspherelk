const db = require("../config/db");
const { getUserFromCookies } = require('../middlewares/authMiddleware');
const commonService = require('../services/commonService');

//get all counts of cases, complaints, investigations, and evidences
exports.getAllStatsCount = async (req, res) => {
    try {
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!["OIC", "Crime OIC", "Sub Inspector", "Sergeant"].includes(user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const stats = await commonService.getAllStatsCount(user.role, user.id);
        
        if (!stats) {
            console.log("No stats found");
            return res.status(404).json({ message: "No stats found" });
        }
        
        res.status(200).json({ statsValues: stats });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.logAuditTrail = async (req, res) => {
    try {
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if(user.role !== "OIC" && user.role !== "Crime OIC") {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { tableName, recordId } = req.body;
        if (!tableName || !recordId) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        const audits = await commonService.getAuditHistory(tableName, recordId);

        if (!audits) {
            console.log("No audits found");
            return res.status(404).json({ message: "No audits found" });
        }

        res.status(200).json({ auditLogs: audits });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}