const db = require("../config/db");
const { generateUniqueId, generateBatchId } = require("../utils/genarateIDs");
const { logAuditTrail } = require("./commonService");

exports.getAllInvestigations = async (userId, filters = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      sortBy = "start_dt",
      sortOrder = "DESC",
      search,
    } = filters;

    let query = `
            SELECT 
                i.investigation_id,
                i.topic,
                i.start_dt,
                i.end_dt,
                i.location,
                i.status,
                i.case_id,
                c.topic as case_topic,
                c.case_type,
                c.status as case_status,
                COUNT(DISTINCT io.officer_id) as officer_count,
                COUNT(DISTINCT e.evidence_id) as evidence_count,
                GROUP_CONCAT(DISTINCT u.name) as officers
            FROM investigation i
            LEFT JOIN cases c ON i.case_id = c.case_id
            LEFT JOIN investigation_officer io ON i.investigation_id = io.investigation_id
            LEFT JOIN users u ON io.officer_id = u.user_id
            LEFT JOIN evidance e ON i.investigation_id = e.investigation_id
            WHERE 1=1
        `;

    const params = [];

    if (search) {
      query += ` AND (i.topic LIKE ? OR i.location LIKE ? OR c.topic LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY i.investigation_id`;
    query += ` ORDER BY i.${sortBy} ${sortOrder}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Get total count separately
    let countQuery = `
            SELECT COUNT(DISTINCT i.investigation_id) as total_count
            FROM investigation i
            LEFT JOIN cases c ON i.case_id = c.case_id
            WHERE 1=1
        `;
    const countParams = [];
    if (search) {
      countQuery += ` AND (i.topic LIKE ? OR i.location LIKE ? OR c.topic LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [investigations] = await db.query(query, params);
    const [countRows] = await db.query(countQuery, countParams);
    const total_count = countRows[0]?.total_count || 0;

    // Attach total_count to each investigation for compatibility
    investigations.forEach((inv) => (inv.total_count = total_count));

    return investigations;
  } catch (error) {
    console.error("Error fetching investigations:", error);
    throw error;
  }
};

exports.searchInvestigations = async (filters, userId) => {
  try {
    const {
      topic,
      investigation_id,
      case_id,
      officer_name,
      status,
      location,
      start_date,
      end_date,
      limit = 50,
      offset = 0,
      sortBy = "start_dt",
      sortOrder = "DESC",
    } = filters;

    let query = `
            SELECT 
                i.investigation_id,
                i.topic,
                i.start_dt,
                i.end_dt,
                i.location,
                i.status,
                i.case_id,
                c.topic as case_topic,
                c.case_type,
                c.status as case_status,
                COUNT(DISTINCT io.officer_id) as officer_count,
                COUNT(DISTINCT e.evidence_id) as evidence_count,
                GROUP_CONCAT(DISTINCT u.name) as officers
            FROM investigation i
            LEFT JOIN cases c ON i.case_id = c.case_id
            LEFT JOIN investigation_officer io ON i.investigation_id = io.investigation_id
            LEFT JOIN users u ON io.officer_id = u.user_id
            LEFT JOIN evidance e ON i.investigation_id = e.investigation_id
            WHERE 1=1
        `;

    const params = [];
    let countQuery = `
            SELECT COUNT(DISTINCT i.investigation_id) as total_count
            FROM investigation i
            LEFT JOIN cases c ON i.case_id = c.case_id
            LEFT JOIN investigation_officer io ON i.investigation_id = io.investigation_id
            LEFT JOIN users u ON io.officer_id = u.user_id
            WHERE 1=1
        `;
    const countParams = [];

    if (topic) {
      query += ` AND i.topic LIKE ?`;
      params.push(`%${topic}%`);
      countQuery += ` AND i.topic LIKE ?`;
      countParams.push(`%${topic}%`);
    }
    if (investigation_id) {
      query += ` AND i.investigation_id = ?`;
      params.push(investigation_id);
      countQuery += ` AND i.investigation_id = ?`;
      countParams.push(investigation_id);
    }
    if (case_id) {
      query += ` AND i.case_id = ?`;
      params.push(case_id);
      countQuery += ` AND i.case_id = ?`;
      countParams.push(case_id);
    }
    if (officer_name) {
      query += ` AND u.name LIKE ?`;
      params.push(`%${officer_name}%`);
      countQuery += ` AND u.name LIKE ?`;
      countParams.push(`%${officer_name}%`);
    }
    if (status) {
      query += ` AND i.status = ?`;
      params.push(status);
      countQuery += ` AND i.status = ?`;
      countParams.push(status);
    }
    if (location) {
      query += ` AND i.location LIKE ?`;
      params.push(`%${location}%`);
      countQuery += ` AND i.location LIKE ?`;
      countParams.push(`%${location}%`);
    }
    if (start_date) {
      query += ` AND DATE(i.start_dt) >= ?`;
      params.push(start_date);
      countQuery += ` AND DATE(i.start_dt) >= ?`;
      countParams.push(start_date);
    }
    if (end_date) {
      query += ` AND DATE(i.start_dt) <= ?`;
      params.push(end_date);
      countQuery += ` AND DATE(i.start_dt) <= ?`;
      countParams.push(end_date);
    }

    query += ` GROUP BY i.investigation_id`;
    query += ` ORDER BY i.${sortBy} ${sortOrder}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [investigations] = await db.query(query, params);
    const [countRows] = await db.query(countQuery, countParams);
    const total_count = countRows[0]?.total_count || 0;

    investigations.forEach((inv) => (inv.total_count = total_count));

    return investigations;
  } catch (error) {
    console.error("Error searching investigations:", error);
    throw error;
  }
};

exports.getInvestigationById = async (investigationId) => {
  try {
    const [investigations] = await db.query(
      `
            SELECT 
                i.investigation_id,
                i.topic,
                i.start_dt,
                i.end_dt,
                i.location,
                i.status,
                i.case_id,
                c.topic as case_topic,
                c.case_type,
                c.status as case_status,
                c.leader_id,
                leader.name as case_leader_name,
                leader.profile_pic as case_leader_profile_pic,
                leader.role as case_leader_role
            FROM investigation i
            LEFT JOIN cases c ON i.case_id = c.case_id
            LEFT JOIN users leader ON c.leader_id = leader.user_id
            WHERE i.investigation_id = ?
        `,
      [investigationId]
    );

    if (investigations.length === 0) {
      return null;
    }

    const investigation = investigations[0];

    // Get officers assigned to this investigation
    const [officers] = await db.query(
      `
            SELECT 
                u.user_id,
                u.name,
                u.role,
                u.email,
                u.phone,
                u.profile_pic
            FROM investigation_officer io
            JOIN users u ON io.officer_id = u.user_id
            WHERE io.investigation_id = ?
        `,
      [investigationId]
    );

    // Get evidence collected during this investigation
    const [evidence] = await db.query(
      `
            SELECT 
                e.evidence_id,
                e.type,
                e.location,
                e.details,
                e.collected_dt,
                e.officer_id,
                u.name as officer_name
            FROM evidance e
            LEFT JOIN users u ON e.officer_id = u.user_id
            WHERE e.investigation_id = ?
            ORDER BY e.collected_dt DESC
        `,
      [investigationId]
    );

    return {
      ...investigation,
      officers,
      evidence,
    };
  } catch (error) {
    console.error("Error fetching investigation by ID:", error);
    throw error;
  }
};

exports.createInvestigation = async (investigationData, createdBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Double-check case status in transaction
    const [caseRows] = await connection.query(
      "SELECT status FROM cases WHERE case_id = ?",
      [investigationData.case_id]
    );

    if (!caseRows[0]) {
      throw new Error("Case not found");
    }

    if (caseRows[0].status === "closed") {
      throw new Error("Cannot create investigation for closed case");
    }

    const investigationId = await generateUniqueId("investigation");

    // Insert investigation
    await connection.query(
      `INSERT INTO investigation (investigation_id, topic, location, status, case_id, start_dt) 
             VALUES (?, ?, ?, 'inprogress', ?, NOW())`,
      [
        investigationId,
        investigationData.topic,
        investigationData.location,
        investigationData.case_id,
      ]
    );

    // Insert officers
    const batchId = await generateBatchId();
    const auditChanges = [];

    for (const officerId of investigationData.officer_ids) {
      await connection.query(
        "INSERT INTO investigation_officer (investigation_id, officer_id) VALUES (?, ?)",
        [investigationId, officerId]
      );

      auditChanges.push({
        tableName: "investigation_officer",
        recordId: `${investigationId}_${officerId}`,
        fieldName: "officer_id",
        value: officerId,
        actionType: "INSERT",
      });
    }

    // Audit log for investigation creation
    auditChanges.push(
      {
        tableName: "investigation",
        recordId: investigationId,
        fieldName: "topic",
        value: investigationData.topic,
        actionType: "INSERT",
      },
      {
        tableName: "investigation",
        recordId: investigationId,
        fieldName: "location",
        value: investigationData.location,
        actionType: "INSERT",
      },
      {
        tableName: "investigation",
        recordId: investigationId,
        fieldName: "status",
        value: "inprogress",
        actionType: "INSERT",
      },
      {
        tableName: "investigation",
        recordId: investigationId,
        fieldName: "case_id",
        value: investigationData.case_id,
        actionType: "INSERT",
      }
    );

    await logAuditTrail({
      batchId,
      changes: auditChanges,
      changedBy: createdBy,
      connection,
    });

    await connection.commit();

    return {
      investigation_id: investigationId,
      ...investigationData,
      status: "inprogress",
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.updateInvestigation = async (
  investigationId,
  updateFields,
  updatedBy
) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[currentInvestigation]] = await connection.query(
      "SELECT topic, location, status, end_dt FROM investigation WHERE investigation_id = ?",
      [investigationId]
    );

    if (!currentInvestigation) {
      await connection.rollback();
      return null;
    }

    const fieldsToUpdate = {};
    const auditChanges = [];

    for (const key of Object.keys(updateFields)) {
      if (
        updateFields[key] !== undefined &&
        updateFields[key] !== currentInvestigation[key]
      ) {
        fieldsToUpdate[key] = updateFields[key];
        auditChanges.push({
          tableName: "investigation",
          recordId: investigationId,
          fieldName: key,
          value: updateFields[key],
          actionType: "UPDATE",
        });
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      await connection.rollback();
      return currentInvestigation;
    }

    // Update investigation
    const setClause = Object.keys(fieldsToUpdate)
      .map((f) => `${f} = ?`)
      .join(", ");
    const values = Object.values(fieldsToUpdate);
    values.push(investigationId);

    await connection.query(
      `UPDATE investigation SET ${setClause} WHERE investigation_id = ?`,
      values
    );

    // Audit log
    if (auditChanges.length > 0) {
      const batchId = await generateBatchId();
      await logAuditTrail({
        batchId,
        changes: auditChanges,
        changedBy: updatedBy,
        connection,
      });
    }

    await connection.commit();

    const [[updatedInvestigation]] = await connection.query(
      "SELECT * FROM investigation WHERE investigation_id = ?",
      [investigationId]
    );

    return updatedInvestigation;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.addOfficerToInvestigation = async (
  investigationId,
  officerId,
  addedBy
) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if officer is already assigned
    const [existing] = await connection.query(
      "SELECT * FROM investigation_officer WHERE investigation_id = ? AND officer_id = ?",
      [investigationId, officerId]
    );

    if (existing.length > 0) {
      await connection.rollback();
      throw new Error("Officer is already assigned to this investigation");
    }

    // Add officer to investigation
    await connection.query(
      "INSERT INTO investigation_officer (investigation_id, officer_id) VALUES (?, ?)",
      [investigationId, officerId]
    );

    // Audit log
    const batchId = await generateBatchId();
    await logAuditTrail({
      batchId,
      changes: [
        {
          tableName: "investigation_officer",
          recordId: `${investigationId}_${officerId}`,
          fieldName: "officer_id",
          value: officerId,
          actionType: "INSERT",
        },
      ],
      changedBy: addedBy,
      connection,
    });

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.removeOfficerFromInvestigation = async (
  investigationId,
  officerId,
  removedBy
) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if officer exists in investigation
    const [existing] = await connection.query(
      "SELECT * FROM investigation_officer WHERE investigation_id = ? AND officer_id = ?",
      [investigationId, officerId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      throw new Error("Officer is not assigned to this investigation");
    }

    // Remove officer from investigation
    await connection.query(
      "DELETE FROM investigation_officer WHERE investigation_id = ? AND officer_id = ?",
      [investigationId, officerId]
    );

    // Audit log
    const batchId = await generateBatchId();
    await logAuditTrail({
      batchId,
      changes: [
        {
          tableName: "investigation_officer",
          recordId: `${investigationId}_${officerId}`,
          fieldName: "officer_id",
          value: officerId,
          actionType: "DELETE",
        },
      ],
      changedBy: removedBy,
      connection,
    });

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.getInvestigationStatus = async (investigation_id) => {
  try {
    const [rows] = await db.query(
      "SELECT investigation_id, status FROM investigation WHERE investigation_id = ?",
      [investigation_id]
    );
    return rows[0].status || null;
  } catch (error) {
    console.error("Error fetching investigation status:", error);
    throw error;
  }
};

exports.getLeaderByInvestigationId = async (investigationId) => {
  try {
    const [rows] = await db.query(
      `
            SELECT c.leader_id
            FROM investigation i
            JOIN cases c ON i.case_id = c.case_id
            WHERE i.investigation_id = ?
        `,
      [investigationId]
    );
    return rows[0].leader_id || null;
  } catch (error) {
    console.error("Error fetching investigation leader:", error);
    throw error;
  }
}

exports.getInvestigationOfficersIds = async (investigationId) => {
  try {
    const [rows] = await db.query(
      `
            SELECT u.user_id
            FROM investigation_officer io
            JOIN users u ON io.officer_id = u.user_id
            WHERE io.investigation_id = ?
        `,
      [investigationId]
    );
    if (rows.length === 0) {
      return [];
    }
    return rows.map((row) => row.user_id);
  } catch (error) {
    console.error("Error fetching investigation officers:", error);
    throw error;
  }
};