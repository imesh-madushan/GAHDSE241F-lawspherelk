const db = require("../config/db");
const { generateBatchId, generateUniqueId } = require("../utils/genarateIDs");
const { logAuditTrail } = require("./commonService");
const bcrypt = require("bcrypt");

exports.getAllOfficers = async (roles, userRole, userId) => {
  try {
    let query = `SELECT
                    u.user_id AS id,
                    u.name,
                    u.role,
                    u.email,
                    u.phone,
                    u.nic,
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
};

// Enhanced searchOfficers function for all search/filter options
exports.searchOfficers = async (filters, userRole, userId) => {
  const {
    role,
    name,
    id,
    nic,
    phone,
    email,
    page = 1,
    pageSize = 12,
    dropIds,
    dropRoles,
    extraIds
  } = filters;

  let query = `SELECT
                u.user_id AS id,
                u.name,
                u.role,
                u.email,
                u.phone,
                u.nic,
                u.profile_pic AS image,
                (SELECT COUNT(*) FROM Cases c WHERE c.leader_id = u.user_id AND c.status = 'inprogress') AS leading_ongoing_cases,
                l.account_locked
                FROM Users u
                LEFT JOIN Login l ON u.user_id = l.user_id
                WHERE 1=1 AND u.user_id != ?`;

  const params = [];
  params.push(userId);

  if (role && role !== "all") {
    query += " AND u.role = ?";
    params.push(role);
  }
  if (name) {
    query += " AND u.name LIKE ?";
    params.push(`%${name}%`);
  }
  if (id) {
    query += " AND u.user_id = ?";
    params.push(id);
  }
  if (nic) {
    query += " AND u.nic LIKE ?";
    params.push(`%${nic}%`);
  }
  if (phone) {
    query += " AND u.phone LIKE ?";
    params.push(`%${phone}%`);
  }
  if (email) {
    query += " AND u.email LIKE ?";
    params.push(`%${email}%`);
  }
  if (dropIds && dropIds.length > 0) {
    query += " AND u.user_id NOT IN (";
    dropIds.forEach((id, index) => {
      query += index === 0 ? "?" : ", ?";
      params.push(id);
    });
    query += ")";
  }

  if (dropRoles && dropRoles.length > 0) {
    query += " AND u.role NOT IN (";
    dropRoles.forEach((role, index) => {
      query += index === 0 ? "?" : ", ?";
      params.push(role);
    });
    query += ")";
  }

  const offset = (page - 1) * pageSize;
  query += " LIMIT ? OFFSET ?";
  params.push(pageSize, offset);

  const [officers] = await db.query(query, params);

  // If extraIds are provided, fetch and append them
  if (extraIds && extraIds.length > 0) {
    const extraQuery = `
      SELECT
        u.user_id AS id,
        u.name,
        u.role,
        u.email,
        u.phone,
        u.nic,
        u.profile_pic AS image,
        (SELECT COUNT(*) FROM Cases c WHERE c.leader_id = u.user_id AND c.status = 'inprogress') AS leading_ongoing_cases,
        l.account_locked
      FROM Users u
      LEFT JOIN Login l ON u.user_id = l.user_id
      WHERE u.user_id IN (?)
    `;
    const [extraOfficers] = await db.query(extraQuery, [extraIds]);
    //add to officers if not already present
    const existingIds = new Set(officers.map((o) => o.id));
    extraOfficers.forEach((o) => {
      if (!existingIds.has(o.id)) {
        officers.push(o);
      }
    });
  }

  return officers;
};

exports.getOfficerById = async (officerId) => {
  // Query to get the main officer data
  let officerQuery = `SELECT 
                    u.user_id,
                    u.name,
                    u.email,
                    u.phone,
                    u.address,
                    u.profile_pic,
                    u.role,
                    u.created_dt,
                    l.username,
                    l.account_locked,
                    l.lastlogin_dt
                  FROM users u
                  LEFT JOIN login l ON u.user_id = l.user_id
                  WHERE u.user_id = ?`;

  const params = [officerId];

  const [officerRows] = await db.query(officerQuery, params);

  if (officerRows.length === 0) {
    return null;
  }

  const officerData = officerRows[0];

  // Get cases led by the officer
  const [cases] = await db.query(
    `
        SELECT 
            c.case_id,
            c.topic,
            c.case_type,
            c.status,
            c.started_dt,
            c.end_dt,
            c.complain_id,
            comp.description as complaint_description,
            comp.complain_dt,
            comp.status as complaint_status
        FROM cases c
        LEFT JOIN complaints comp ON c.complain_id = comp.complain_id
        WHERE c.leader_id = ?
        ORDER BY c.started_dt DESC
    `,
    [officerId]
  );

  // Get complaints handled by the officer
  const [complaints] = await db.query(
    `
        SELECT 
            comp.complain_id,
            comp.description,
            comp.status,
            comp.complain_dt,
            comp.first_evidance_id,
            e.type as evidence_type,
            e.details as evidence_details,
            e.collected_dt as evidence_collected_dt
        FROM complaints comp
        LEFT JOIN evidance e ON comp.first_evidance_id = e.evidence_id
        WHERE comp.officer_id = ?
        ORDER BY comp.complain_dt DESC
    `,
    [officerId]
  );

  // Get evidence collected by the officer
  const [evidence] = await db.query(
    `
        SELECT 
            e.evidence_id,
            e.type,
            e.location,
            e.details,
            e.collected_dt,
            e.investigation_id,
            i.topic as investigation_topic,
            i.status as investigation_status,
            i.case_id,
            c.topic as case_topic,
            c.status as case_status,
            GROUP_CONCAT(DISTINCT w.name) as witnesses
        FROM evidance e
        LEFT JOIN investigation i ON e.investigation_id = i.investigation_id
        LEFT JOIN cases c ON i.case_id = c.case_id
        LEFT JOIN evidance_witnesses w ON e.evidence_id = w.evidence_id
        WHERE e.officer_id = ?
        GROUP BY e.evidence_id
        ORDER BY e.collected_dt DESC
    `,
    [officerId]
  );

  // Get investigations conducted by the officer
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
            c.status as case_status,
            COUNT(DISTINCT e.evidence_id) as evidence_count
        FROM investigation i
        JOIN investigation_officer io ON i.investigation_id = io.investigation_id
        LEFT JOIN cases c ON i.case_id = c.case_id
        LEFT JOIN evidance e ON i.investigation_id = e.investigation_id
        WHERE io.officer_id = ?
        GROUP BY i.investigation_id
        ORDER BY i.start_dt DESC
    `,
    [officerId]
  );

  // Get forensic reports created by the officer
  const [forensicReports] = await db.query(
    `
        SELECT 
            fr.report_id,
            fr.analysis_type,
            fr.result,
            fr.status,
            fr.requested_dt,
            fr.start_dt,
            fr.end_dt,
            fr.remarks,
            fr.attachments,
            fr.evidence_id,
            e.type as evidence_type,
            e.location as evidence_location,
            e.details as evidence_details,
            GROUP_CONCAT(DISTINCT u.name) as analysts
        FROM forensicreport fr
        LEFT JOIN evidance e ON fr.evidence_id = e.evidence_id
        LEFT JOIN forensicreport_analysts fa ON fr.report_id = fa.report_id
        LEFT JOIN users u ON fa.analyst_id = u.user_id
        WHERE fr.officer_id = ?
        GROUP BY fr.report_id
        ORDER BY fr.requested_dt DESC
    `,
    [officerId]
  );

  // Get reports created by the officer
  const [reports] = await db.query(
    `
        SELECT 
            r.report_id,
            r.report_type,
            r.content,
            r.remarks,
            r.status,
            r.created_dt,
            GROUP_CONCAT(DISTINCT CONCAT(rr.ref_type, ':', rr.ref_id)) as refs
        FROM reports r
        LEFT JOIN report_refrences rr ON r.report_id = rr.report_id
        WHERE r.officer_id = ?
        GROUP BY r.report_id
        ORDER BY r.created_dt DESC
    `,
    [officerId]
  );

  // Return all collected data
  return {
    ...officerData,
    cases,
    complaints,
    evidence,
    investigations,
    forensicReports,
    reports,
  };
};

exports.toggleOfficerAccount = async (officerId, updatedBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT account_locked FROM login WHERE user_id = ?",
      [officerId]
    );

    if (!rows.length) {
      await connection.rollback();
      return null;
    }
    const current = rows[0].account_locked ? 1 : 0;
    const newStatus = current ? 0 : 1;

    await connection.query(
      "UPDATE login SET account_locked = ? WHERE user_id = ?",
      [newStatus, officerId]
    );

    // Audit log for account status toggle
    const batchId = await generateBatchId();
    await logAuditTrail({
      batchId,
      changes: [
        {
          tableName: "login",
          recordId: officerId,
          fieldName: "account_locked",
          value: newStatus,
          actionType: "UPDATE",
        },
      ],
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

exports.updateOfficer = async (officerId, updateFields, updatedBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // Get current officer data for comparison
    const [[currentOfficer]] = await connection.query(
      "SELECT name, nic, phone, email, address, role, profile_pic FROM users WHERE user_id = ?",
      [officerId]
    );
    if (!currentOfficer) {
      await connection.rollback();
      return null;
    }

    // Only update changed fields
    const fieldsToUpdate = {};
    const auditChanges = [];
    for (const key of Object.keys(updateFields)) {
      if (
        updateFields[key] !== undefined &&
        updateFields[key] !== currentOfficer[key]
      ) {
        fieldsToUpdate[key] = updateFields[key];
        auditChanges.push({
          tableName: "users",
          recordId: officerId,
          fieldName: key,
          value: updateFields[key],
          actionType: "UPDATE",
        });
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      await connection.rollback();
      return currentOfficer;
    }

    // Build update query dynamically
    const setClause = Object.keys(fieldsToUpdate)
      .map((f) => `${f} = ?`)
      .join(", ");
    const values = Object.values(fieldsToUpdate);
    values.push(officerId);

    await connection.query(
      `UPDATE users SET ${setClause} WHERE user_id = ?`,
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

    // Return updated officer data
    const [[updatedOfficer]] = await connection.query(
      "SELECT user_id, name, nic, phone, email, address, role, profile_pic FROM users WHERE user_id = ?",
      [officerId]
    );
    return updatedOfficer;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.createOfficer = async (officerData, createdBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      nic,
      phone,
      email,
      address,
      role,
      username,
      password,
      profile_pic,
    } = officerData;

    // Check if username already exists
    const [existingUsername] = await connection.query(
      "SELECT username FROM login WHERE username = ?",
      [username]
    );
    if (existingUsername.length > 0) {
      await connection.rollback();
      throw new Error("Username already exists");
    }

    // Check if email already exists
    const [existingEmail] = await connection.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );
    if (existingEmail.length > 0) {
      await connection.rollback();
      throw new Error("Email already exists");
    }

    // Check if NIC already exists
    const [existingNIC] = await connection.query(
      "SELECT nic FROM users WHERE nic = ?",
      [nic]
    );
    if (existingNIC.length > 0) {
      await connection.rollback();
      throw new Error("NIC already exists");
    }

    // Generate user ID
    const userId = await generateUniqueId("users");

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert into users table
    await connection.query(
      `INSERT INTO users (user_id, name, nic, phone, email, address, role, profile_pic, created_dt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, name, nic, phone, email, address, role, profile_pic]
    );

    // Insert into login table (without account_locked default value)
    await connection.query(
      `INSERT INTO login (user_id, username, password_hash) 
             VALUES (?, ?, ?)`,
      [userId, username, hashedPassword]
    );

    // Create audit log
    const batchId = await generateBatchId();
    const auditChanges = [
      {
        tableName: "users",
        recordId: userId,
        fieldName: "name",
        value: name,
        actionType: "INSERT",
      },
      {
        tableName: "users",
        recordId: userId,
        fieldName: "nic",
        value: nic,
        actionType: "INSERT",
      },
      {
        tableName: "users",
        recordId: userId,
        fieldName: "phone",
        value: phone,
        actionType: "INSERT",
      },
      {
        tableName: "users",
        recordId: userId,
        fieldName: "email",
        value: email,
        actionType: "INSERT",
      },
      {
        tableName: "users",
        recordId: userId,
        fieldName: "address",
        value: address,
        actionType: "INSERT",
      },
      {
        tableName: "users",
        recordId: userId,
        fieldName: "role",
        value: role,
        actionType: "INSERT",
      },
      {
        tableName: "login",
        recordId: userId,
        fieldName: "username",
        value: username,
        actionType: "INSERT",
      },
    ];

    if (profile_pic) {
      auditChanges.push({
        tableName: "users",
        recordId: userId,
        fieldName: "profile_pic",
        value: profile_pic,
        actionType: "INSERT",
      });
    }

    await logAuditTrail({
      batchId,
      changes: auditChanges,
      changedBy: createdBy,
      connection,
    });

    await connection.commit();

    // Return created officer data
    const [[createdOfficer]] = await connection.query(
      "SELECT user_id, name, nic, phone, email, address, role, profile_pic, created_dt FROM users WHERE user_id = ?",
      [userId]
    );

    return createdOfficer;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
