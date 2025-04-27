const db = require("../config/db");
const { getUserFromCookies } = require('../middlewares/authMiddleware');

//get all counts of cases, complaints, investigations, and evidences
exports.getAllStatsCount = async (req, res) => {
    try {
        const token = req.cookies.authtoken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const user  = await getUserFromCookies(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let query
        if (user.role === "OIC" || user.role === "Crime OIC") {
            query = `
                SELECT
                    (SELECT COUNT(*) FROM cases WHERE status = 'inprogress') AS total_active_cases,
                    (SELECT COUNT(*) FROM complaints WHERE status = 'new') AS total_new_complaints,
                    (SELECT COUNT(*) FROM investigation WHERE status = 'inprogress') AS total_active_investigations
                `;
        }
        
        const [rows] = await db.query(query);
        
        if (rows.length === 0) {
            console.log("No stats found");
            return res.status(404).json({ message: "No stats found" });
        }
        
        res.status(200).json({ statsValues: rows[0] });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};