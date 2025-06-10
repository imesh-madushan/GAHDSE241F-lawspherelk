const db = require("../config/db");
const { generateUniqueId } = require("../utils/genarateIDs");

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
  } else if (userRole === "Sub Inspector" || userRole === "Sergeant") {
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

// Enhanced audit logging function with configuration object
exports.logAuditTrail = async (auditConfig) => {
  const { batchId, changes, changedBy, connection = null } = auditConfig;

  // Validate required parameters
  if (!batchId || !changes || !changedBy) {
    throw new Error(
      "Missing required audit parameters: batchId, changes, changedBy"
    );
  }

  try {
    // Use provided connection or get new one
    const conn = connection || (await db.getConnection());
    const shouldReleaseConnection = !connection;

    try {
      // Handle array of changes with tableName, recordId, fieldName, value
      if (Array.isArray(changes)) {
        for (const change of changes) {
          const auditId = await generateUniqueId("audit_log");

          await conn.query(
            `INSERT INTO audit_log (audit_id, batch_id, table_name, record_id, field_name, value, action_type, changed_by, changed_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              auditId,
              batchId,
              change.tableName,
              change.recordId,
              change.fieldName,
              change.value,
              change.actionType,
              changedBy,
            ]
          );
        }
      }
      // Handle single change object with tableName, recordId, fieldName, value
      else if (
        typeof changes === "object" &&
        changes !== null &&
        changes.tableName &&
        changes.recordId
      ) {
        const auditId = await generateUniqueId("audit_log");

        await conn.query(
          `INSERT INTO audit_log (audit_id, batch_id, table_name, record_id, field_name, value, action_type, changed_by, changed_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            auditId,
            batchId,
            changes.tableName,
            changes.recordId,
            changes.fieldName,
            changes.value,
            changes.actionType,
            changedBy,
          ]
        );
      }
      // Fallback for other formats (backward compatibility)
      else {
        throw new Error(
          "Invalid changes format. Expected array or object with tableName, recordId, fieldName, value"
        );
      }

      return batchId;
    } finally {
      if (shouldReleaseConnection) {
        conn.release();
      }
    }
  } catch (error) {
    console.error("Error logging audit trail:", error);
    throw error;
  }
};

// Get audit history for a specific record
exports.getAuditHistory = async (tableName, recordId) => {
  try {
    const query = `
            SELECT 
                al.audit_id,
                al.batch_id,
                al.table_name,
                al.record_id,
                al.field_name,
                al.value,
                al.action_type,
                al.changed_at,
                u.name as changed_by_name,
                u.role as changed_by_role
            FROM audit_log al
            LEFT JOIN users u ON al.changed_by = u.user_id
            WHERE al.table_name = ? AND al.record_id = ?
            ORDER BY al.changed_at DESC
        `;

    const [rows] = await db.query(query, [tableName, recordId]);
    return rows;
  } catch (error) {
    console.error("Error fetching audit history:", error);
    throw error;
  }
};

// Get audit history by batch ID (to see all related changes in one transaction)
exports.getAuditBatch = async (batchId) => {
  try {
    const query = `
            SELECT 
                al.audit_id,
                al.batch_id,
                al.table_name,
                al.record_id,
                al.field_name,
                al.value,
                al.action_type,
                al.changed_at,
                u.name as changed_by_name,
                u.role as changed_by_role
            FROM audit_log al
            LEFT JOIN users u ON al.changed_by = u.user_id
            WHERE al.batch_id = ?
            ORDER BY al.changed_at ASC
        `;

    const [rows] = await db.query(query, [batchId]);
    return rows;
  } catch (error) {
    console.error("Error fetching audit batch:", error);
    throw error;
  }
};
