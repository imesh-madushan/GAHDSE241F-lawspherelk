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

// Search audit logs with multiple filters (following complaints pattern)
exports.searchAuditLogs = async (filters) => {
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
      WHERE 1=1
    `;

    const params = [];

    // Batch ID filter
    if (filters.batchId) {
      query += ` AND al.batch_id LIKE ?`;
      params.push(`%${filters.batchId}%`);
    }

    // Value filter
    if (filters.value) {
      query += ` AND al.value LIKE ?`;
      params.push(`%${filters.value}%`);
    }

    // Table name filter
    if (filters.tableName) {
      query += ` AND al.table_name LIKE ?`;
      params.push(`%${filters.tableName}%`);
    }

    // Record ID filter
    if (filters.recordId) {
      query += ` AND al.record_id LIKE ?`;
      params.push(`%${filters.recordId}%`);
    }

    // Action type filter
    if (filters.actionType && filters.actionType !== "all") {
      query += ` AND al.action_type = ?`;
      params.push(filters.actionType);
    }

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
    return Object.values(batchMap);
  } catch (error) {
    console.error("Error in searchAuditLogs:", error);
    throw error;
  }
};
