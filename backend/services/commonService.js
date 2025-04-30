const db = require("../config/db");

exports.getAllStatsCount = async (userRole, userId) => {
    let query;
    let params = [];
    
    if (userRole === "OIC" || userRole === "Crime OIC") {
        query = `
            SELECT
                (SELECT COUNT(*) FROM cases WHERE status = 'inprogress') AS total_active_cases,
                (SELECT COUNT(*) FROM complaints WHERE status = 'new') AS total_new_complaints,
                (SELECT COUNT(*) FROM investigation WHERE status = 'inprogress') AS total_active_investigations
            `;
    }
    else if (userRole === "Sub Inspector" || userRole === "Sergeant") {
        query = `
            SELECT
                (SELECT COUNT(*) FROM cases WHERE status = 'inprogress' AND leader_id = ?) AS total_active_cases,
                (SELECT COUNT(*) FROM complaints WHERE status = 'new') AS total_new_complaints,
                (SELECT COUNT(*) FROM investigation WHERE status = 'inprogress' AND leader_id = ?) AS total_active_investigations
            `;
        params = [userId, userId];
    }
    
    const [rows] = await db.query(query, params);
    return rows[0];
};
