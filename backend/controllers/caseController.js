const db = require("../config/db");
const { getUserFromCookies } = require('../middlewares/authMiddleware');

// get all cases for OIC and Crime OIC
exports.getAllCases = async (req, res) => {
    const filters = {};

    const token = req.cookies.authtoken;
    if (!token) {
    return res.status(401).json({ message: "No token provided" });
    }

    const user  = await getUserFromCookies(token);
    if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.query.status) {
        filters.status = req.query.status;
    }
    if (req.query.limit) {
        filters.limit = parseInt(req.query.limit, 10);
    }

    // Start with the base query
    let query = `SELECT 
                cases.case_id,
                cases.topic,
                cases.case_type,
                cases.status AS case_status,
                cases.started_dt,
                cases.end_dt,
                cases.leader_id,
                cases.complain_id,
                
                users.name AS leader_name,
                users.role AS leader_role,
                
                COUNT(case_evidance.evidence_id) AS evidence_count

            FROM cases
            LEFT JOIN users ON cases.leader_id = users.user_id
            LEFT JOIN case_evidance ON cases.case_id = case_evidance.case_id

            WHERE cases.status != 'oicnotreviewed'`;

    //status filter if provided
    if (filters.status) {
        query += ` AND cases.status = ?`;
    }
    
    // if data is requested by sub inspector, his dashboard will show only the cases he is leading
    if (user.role === "Sub Inspector") {
        query += ` AND cases.leader_id = ?`;
    }

    //group by and order by
    query += ` GROUP BY cases.case_id ORDER BY cases.started_dt DESC`;
    
    //limit if provided
    if (filters.limit) {
        query += ` LIMIT ?`;
    }
            
    try {
        const params = [];
        if (filters.status) params.push(filters.status);
        if (filters.limit) params.push(filters.limit);
        
        const [rows] = await db.query(query, params);
        
        if (rows.length === 0) {
            console.log("No cases found");
            return res.status(404).json({ message: "No cases found" });
        }
               
        res.status(200).json({message: "Cases fetched successfully", cases: rows});
    } 
    catch (error) {
        console.error("Error fetching cases:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};