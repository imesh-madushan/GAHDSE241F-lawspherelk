const db = require("../config/db");

exports.getAllCases = async (filters, userRole, userId) => {
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

  const params = [];

  //status filter if provided
  if (filters.status) {
      query += ` AND cases.status = ?`;
      params.push(filters.status);
  }
  
  // if data is requested by sub inspector, show only the cases they're leading
  if (userRole === "Sub Inspector") {
      query += ` AND cases.leader_id = ?`;
      params.push(userId);
  }

  //group by and order by
  query += ` GROUP BY cases.case_id ORDER BY cases.started_dt DESC`;
  
  //limit if provided
  if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(filters.limit);
  }

  const [rows] = await db.query(query, params);
  return rows;
};

// You can add more case-related service methods here
