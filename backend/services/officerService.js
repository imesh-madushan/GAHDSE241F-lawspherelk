const db = require("../config/db");

exports.getAllOfficers = async (roles, userRole, userId) => {
    try {
        let query = `SELECT
                    u.user_id AS id,
                    u.name,
                    u.role,
                    u.email,
                    u.phone,
                    u.profile_pic AS image,
                    (SELECT COUNT(*) FROM Cases c WHERE c.leader_id = u.user_id AND c.status = 'inprogress') AS leading_ongoing_cases,
                    l.account_locked
                    FROM Users u
                    LEFT JOIN Login l ON u.user_id = l.user_id
                    WHERE 1=1 AND u.user_id != ?`;

        const params = [];
        params.push(userId);

        // Add role filter if provided
        if (roles && roles.length > 0) {
            query += " AND role IN (";
            roles.forEach((role, index) => {
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

// New searchOfficers function for filtered and paginated search
exports.searchOfficers = async (filters, userRole, userId) => {
    const { role, name, page = 1, pageSize = 12 } = filters;

    let query = `SELECT
                u.user_id AS id,
                u.name,
                u.role,
                u.email,
                u.phone,
                u.profile_pic AS image,
                (SELECT COUNT(*) FROM Cases c WHERE c.leader_id = u.user_id AND c.status = 'inprogress') AS leading_ongoing_cases,
                l.account_locked
                FROM Users u
                LEFT JOIN Login l ON u.user_id = l.user_id
                WHERE 1=1 AND u.user_id != ?`;

    const params = [];
    params.push(userId);

    if (role) {
        query += " AND role = ?";
        params.push(role);
    }

    if (name) {
        query += " AND name LIKE ?";
        params.push(`%${name}%`);
    }

    const offset = (page - 1) * pageSize;
    query += " LIMIT ? OFFSET ?";
    params.push(pageSize, offset);

    const [officers] = await db.query(query, params);
    return officers;
};