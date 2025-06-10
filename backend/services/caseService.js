const db = require("../config/db");
const { generateBatchId } = require("../utils/genarateIDs");
const { logAuditTrail } = require("./commonService");

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
              users.profile_pic AS leader_profile,
              
              COUNT(case_evidance.evidence_id) AS evidence_count

          FROM cases
          LEFT JOIN users ON cases.leader_id = users.user_id
          LEFT JOIN case_evidance ON cases.case_id = case_evidance.case_id

          WHERE cases.status IN ('inprogress', 'closed')`;

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

exports.getCaseById = async (caseId, userRole, userId) => {
  // Query to get the main case data with complaint and leader info
  let caseQuery = `SELECT 
                    c.case_id,
                    c.topic,
                    c.case_type,
                    c.status,
                    c.started_dt,
                    c.end_dt,
                    c.leader_id,
                    c.complain_id,
                    u.name AS leader_name,
                    u.role AS leader_role,
                    u.profile_pic AS leader_profile
                  FROM cases c
                  LEFT JOIN users u ON c.leader_id = u.user_id
                  WHERE c.topic is not null AND c.case_id = ?`;

  const params = [caseId];

  const [caseRows] = await db.query(caseQuery, params);

  if (caseRows.length === 0) {
    return null;
  }

  const caseData = caseRows[0];

  // Get complaint data separately
  let complaintData = null;
  if (caseData.complain_id) {
    const [complaintRows] = await db.query(
      `SELECT 
        complaints.complain_id,
        complaints.description,
        complaints.complain_dt,
        complaints.status AS complaint_status,
        complaints.officer_id,
        users.name AS officer_name,
        users.role AS officer_role,
        users.profile_pic AS officer_profile
      FROM complaints
      LEFT JOIN users ON complaints.officer_id = users.user_id
      WHERE complaints.complain_id = ?`,
      [caseData.complain_id]
    );
    if (complaintRows.length > 0) {
      complaintData = complaintRows[0];
    }
  }

  // Get assigned officers - Enhanced query to include role and profile image
  const [assignedOfficers] = await db.query(
    `
    SELECT DISTINCT 
      u.user_id, 
      u.name, 
      u.role,
      u.profile_pic 
    FROM investigation_officer io
    JOIN users u ON io.officer_id = u.user_id
    JOIN investigation i ON io.investigation_id = i.investigation_id
    WHERE i.case_id = ?
  `,
    [caseId]
  );

  // Get evidence with detailed officer information
  const [evidence] = await db.query(
    `
    SELECT 
      e.evidence_id, 
      e.type, 
      e.location, 
      e.details,
      e.collected_dt,
      u.name as collected_by,
      u.user_id as officer_id,
      u.role as officer_role,
      u.profile_pic as officer_profile
    FROM evidance e
    JOIN case_evidance ce ON e.evidence_id = ce.evidence_id
    LEFT JOIN users u ON e.officer_id = u.user_id
    WHERE ce.case_id = ?
  `,
    [caseId]
  );

  // Get investigations
  const [investigations] = await db.query(
    `
    SELECT 
      i.investigation_id,
      i.topic,
      i.start_dt,
      i.end_dt,
      i.location,
      i.status
    FROM investigation i
    WHERE i.case_id = ?
  `,
    [caseId]
  );

  // Get crime offences and calculate total_crimes and total_risk for each criminal (Convicted only)
  const [offences] = await db.query(
    `
    SELECT 
      co.offence_id,
      co.status,
      co.crime_type,
      co.risk_score,
      co.reported_dt,
      co.happened_dt,
      cr.criminal_id,
      cr.name AS criminal_name,
      cr.nic AS criminal_nic,
      cr.phone AS criminal_phone,
      cr.address AS criminal_address,
      cr.dob AS criminal_dob,
      (
        SELECT COUNT(*) FROM crimeoffence co2
        WHERE co2.criminal_id = cr.criminal_id AND co2.status = 'Convicted'
      ) AS total_crimes,
      (
        SELECT COALESCE(SUM(co2.risk_score), 0) FROM crimeoffence co2
        WHERE co2.criminal_id = cr.criminal_id AND co2.status = 'Convicted'
      ) AS total_risk
    FROM crimeoffence co
    LEFT JOIN criminalrecord cr ON co.criminal_id = cr.criminal_id
    WHERE co.case_id = ?
  `,
    [caseId]
  );

  // Get reports with detailed officer information
  const [reports] = await db.query(
    `
    SELECT 
      r.report_id,
      r.report_type,
      r.content,
      r.remarks,
      r.status,
      r.created_dt,
      u.name as created_by,
      u.user_id as officer_id,
      u.role as officer_role,
      u.profile_pic as officer_profile
    FROM reports r
    JOIN report_refrences rr ON r.report_id = rr.report_id
    LEFT JOIN users u ON r.officer_id = u.user_id
    WHERE rr.ref_id = ? AND rr.ref_type = 'case'
  `,
    [caseId]
  );

  // Return all collected data
  return {
    ...caseData,
    assignedOfficers,
    evidence,
    investigations,
    offences,
    reports,
    complaint: complaintData, // Add the complaint object separately
  };
};

exports.searchCases = async (filters, userRole, userId) => {
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
              users.profile_pic AS leader_profile,
              COUNT(case_evidance.evidence_id) AS evidence_count
          FROM cases
          LEFT JOIN users ON cases.leader_id = users.user_id
          LEFT JOIN case_evidance ON cases.case_id = case_evidance.case_id
          WHERE cases.status IN ('inprogress', 'closed')`;

  const params = [];

  // Topic filter (search by topic)
  if (filters.topic) {
    query += ` AND cases.topic LIKE ?`;
    params.push(`%${filters.topic}%`);
  }

  // Case ID filter
  if (filters.case_id) {
    query += ` AND cases.case_id = ?`;
    params.push(filters.case_id);
  }

  // Case Type filter
  if (filters.case_type) {
    query += ` AND cases.case_type LIKE ?`;
    params.push(`%${filters.case_type}%`);
  }

  // Officer name filter
  if (filters.officer) {
    query += ` AND users.name LIKE ?`;
    params.push(`%${filters.officer}%`);
  }

  // Status filter
  if (filters.status && filters.status !== "all") {
    query += ` AND cases.status = ?`;
    params.push(filters.status);
  }

  // Time period filter
  if (filters.timePeriod && filters.timePeriod !== "all") {
    let dateCondition = "";
    if (filters.timePeriod === "last_7_days") {
      dateCondition =
        " AND cases.started_dt >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (filters.timePeriod === "last_30_days") {
      dateCondition =
        " AND cases.started_dt >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    } else if (filters.timePeriod === "last_90_days") {
      dateCondition =
        " AND cases.started_dt >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
    }
    query += dateCondition;
  }

  // Sub Inspector: only their cases
  if (userRole === "Sub Inspector") {
    query += ` AND cases.leader_id = ?`;
    params.push(userId);
  }

  query += ` GROUP BY cases.case_id ORDER BY cases.started_dt DESC`;

  const [rows] = await db.query(query, params);
  return rows;
};

exports.createCase = async (complaintId, topic, leaderId, caseId) => {
  const now = new Date();

  // Begin transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Generate batch ID for this operation to track all related changes
    const batchId = await generateBatchId();

    // Check if the case data is already filled
    const [existingCase] = await connection.query(
      "SELECT * FROM cases WHERE case_id = ?",
      [caseId]
    );

    // Check if the case topic and leaderId are already in existing case
    if (existingCase[0].topic != null && existingCase[0].leader_id != null) {
      throw new Error(
        "This case is already created with the same topic and leader."
      );
    }

    // Update the existing template of the case
    await connection.query(
      `UPDATE cases SET topic = ?, status = ?, started_dt = ?, leader_id = ? 
            WHERE case_id = ?`,
      [topic, "inprogress", now, leaderId, caseId]
    );

    // Update the complaint status
    await connection.query(
      "UPDATE complaints SET status = 'viewed' WHERE complain_id = ?",
      [complaintId]
    );

    // Log all the updates in audit trail with new values only
    const auditChanges = [
      // Case updates - new values only
      {
        tableName: "cases",
        recordId: caseId,
        fieldName: "topic",
        value: topic,
        actionType: "INSERT",
      },
      {
        tableName: "cases",
        recordId: caseId,
        fieldName: "status",
        value: "inprogress",
        actionType: "UPDATE",
      },
      {
        tableName: "cases",
        recordId: caseId,
        fieldName: "started_dt",
        value: now.toISOString(),
        actionType: "INSERT",
      },
      {
        tableName: "cases",
        recordId: caseId,
        fieldName: "leader_id",
        value: leaderId,
        actionType: "INSERT",
      },

      // Complaint status update
      {
        tableName: "complaints",
        recordId: complaintId,
        fieldName: "status",
        value: "viewed",
        actionType: "UPDATE",
      },
    ];

    await logAuditTrail({
      batchId,
      changes: auditChanges,
      changedBy: leaderId,
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

exports.updateCase = async (case_id, updateData, updatedBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const batchId = await generateBatchId();
    const changes = [];

    // Get current case data
    const [currentRows] = await connection.query(
      "SELECT * FROM cases WHERE case_id = ?",
      [case_id]
    );
    if (!currentRows || currentRows.length === 0) {
      throw new Error("Case not found");
    }
    const current = currentRows[0];

    // Prepare update fields and audit log
    const fields = [];
    const values = [];
    if (updateData.topic !== undefined && updateData.topic !== current.topic) {
      fields.push("topic = ?");
      values.push(updateData.topic);
      changes.push({
        tableName: "cases",
        recordId: case_id,
        fieldName: "topic",
        value: updateData.topic,
        actionType: "UPDATE",
      });
    }
    if (
      updateData.leader_id !== undefined &&
      updateData.leader_id !== current.leader_id
    ) {
      fields.push("leader_id = ?");
      values.push(updateData.leader_id);
      changes.push({
        tableName: "cases",
        recordId: case_id,
        fieldName: "leader_id",
        value: updateData.leader_id,
        actionType: "UPDATE",
      });
    }
    // Add more fields as needed

    if (fields.length === 0) {
      connection.release();
      return false; // Nothing to update
    }

    // Update the case
    await connection.query(
      `UPDATE cases SET ${fields.join(", ")} WHERE case_id = ?`,
      [...values, case_id]
    );

    // Log audit trail
    await logAuditTrail({
      batchId,
      changes,
      changedBy: updatedBy,
      connection,
    });

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

//get case status by case_id
exports.getCaseStatus = async (case_id) => {
  try {
    const [rows] = await db.query(
      `SELECT status FROM cases WHERE case_id = ?`,
      [case_id]
    );
    return rows[0].status || null;
  } catch (error) {
    console.error("Error fetching case status:", error);
    throw error;
  }
};

//get case leader by case_id
exports.getCaseLeader = async (case_id) => {
  try {
    const [rows] = await db.query(
      `SELECT leader_id FROM cases WHERE case_id = ?`,
      [case_id]
    );
    return rows[0].leader_id || null;
  } catch (error) {
    console.error("Error fetching case leader:", error);
    throw error;
  }
};

