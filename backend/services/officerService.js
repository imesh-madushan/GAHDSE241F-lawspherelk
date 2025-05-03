const db = require("../config/db");

exports.getAllOfficers = async (filters) => {
    try {
        let query = `SELECT user_id as id, name, role, profile_pic as image 
                    FROM Users 
                    WHERE 1=1`;
        
        const params = [];
        
        // Add role filter if provided
        if (filters.roles && filters.roles.length > 0) {
            query += " AND role IN (";
            filters.roles.forEach((role, index) => {
                query += index === 0 ? "?" : ", ?";
                params.push(role);
            });
            query += ")";
        }
        
        const [officers] = await db.query(query, params);
        return officers;
    } catch (error) {
        console.error("Error fetching officers:", error);
        throw error;
    }
}