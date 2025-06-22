const db = require("../config/db");

// Get all audit logs with user details, optionally filtered by batch ID
exports.getAllAuditLogs = async (batchId = null) => {
  try {
    let query = `
      SELECT 
        al.audit_id,
        al.batch_id,
        al.table_name,
        al.record_id,
        al.field_name,
        al.value,
        al.action_type,
        al.changed_by,
        al.changed_at,
        u.name AS user_name,
        u.role AS user_role,
        u.profile_pic AS user_profile_pic
      FROM 
        audit_log al
      LEFT JOIN 
        users u ON al.changed_by = u.user_id
    `;

    const params = [];

    // Filter by batch ID if provided
    if (batchId) {
      query += ` WHERE al.batch_id = ?`;
      params.push(batchId);
    }

    // Order by changed_at
    query += ` ORDER BY al.changed_at DESC`;

    const [rows] = await db.query(query, params);

    // Group by batch ID for easier consumption
    const batchMap = {};
    rows.forEach((row) => {
      if (!batchMap[row.batch_id]) {
        batchMap[row.batch_id] = {
          batchId: row.batch_id,
          changedBy: row.changed_by,
          userName: row.user_name,
          userRole: row.user_role,
          userProfilePic: row.user_profile_pic,
          changedAt: row.changed_at,
          logs: [],
        };
      }

      batchMap[row.batch_id].logs.push({
        auditId: row.audit_id,
        tableName: row.table_name,
        recordId: row.record_id,
        fieldName: row.field_name,
        value: row.value,
        actionType: row.action_type,
        changedAt: row.changed_at,
      });
    });

    // Convert map to array
    const batchesArray = Object.values(batchMap);

    return batchesArray;
  } catch (error) {
    console.error("Error in getAllAuditLogs:", error);
    throw error;
  }
};

// Search audit logs by batch ID or value
exports.searchAuditLogs = async (searchParam) => {
  try {
    // If it's a batch ID, just return logs for that batch
    if (searchParam.batchId) {
      return await this.getAllAuditLogs(searchParam.batchId);
    }
    // If it's a value, find batch IDs containing that value
    if (searchParam.value) {
      // Find all batch IDs containing the value
      const batchIdQuery = `
        SELECT DISTINCT batch_id
        FROM audit_log
        WHERE value LIKE ?
      `;

      const [batchResults] = await db.query(batchIdQuery, [
        `%${searchParam.value}%`,
      ]);

      if (batchResults.length === 0) {
        return [];
      }

      // Get all matching batch IDs
      const batchIds = batchResults.map((row) => row.batch_id);

      // Create a placeholder string for the SQL IN clause
      const placeholders = batchIds.map(() => "?").join(",");

      // Query to get all logs for all matching batches
      const query = `
        SELECT 
          al.audit_id,
          al.batch_id,
          al.table_name,
          al.record_id,
          al.field_name,
          al.value,
          al.action_type,
          al.changed_by,
          al.changed_at,
          u.name AS user_name,
          u.role AS user_role,
          u.profile_pic AS user_profile_pic
        FROM 
          audit_log al
        LEFT JOIN 
          users u ON al.changed_by = u.user_id
        WHERE 
          al.batch_id IN (${placeholders})
        ORDER BY 
          al.changed_at DESC
      `;

      const [rows] = await db.query(query, batchIds);

      // Group by batch ID for easier consumption
      const batchMap = {};
      rows.forEach((row) => {
        if (!batchMap[row.batch_id]) {
          batchMap[row.batch_id] = {
            batchId: row.batch_id,
            changedBy: row.changed_by,
            userName: row.user_name,
            userRole: row.user_role,
            userProfilePic: row.user_profile_pic,
            changedAt: row.changed_at,
            logs: [],
          };
        }

        batchMap[row.batch_id].logs.push({
          auditId: row.audit_id,
          tableName: row.table_name,
          recordId: row.record_id,
          fieldName: row.field_name,
          value: row.value,
          actionType: row.action_type,
          changedAt: row.changed_at,
        });
      });

      // Convert map to array
      return Object.values(batchMap);
    }

    return [];
  } catch (error) {
    console.error("Error in searchAuditLogs:", error);
    throw error;
  }
};
