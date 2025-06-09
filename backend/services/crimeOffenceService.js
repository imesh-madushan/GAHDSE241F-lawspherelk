const db = require("../config/db");
const { generateUniqueId, generateBatchId } = require("../utils/genarateIDs");
const { logAuditTrail } = require("./commonService");

const buildSortClause = (sortBy, sortOrder) => {
  const validColumns = [
    "reported_dt",
    "happened_dt",
    "risk_score",
    "crime_type",
    "status",
  ];
  const validOrders = ["ASC", "DESC"];

  const column = validColumns.includes(sortBy) ? sortBy : "reported_dt";
  const order = validOrders.includes(sortOrder?.toUpperCase())
    ? sortOrder.toUpperCase()
    : "DESC";

  return ` ORDER BY co.${column} ${order}`;
};

const buildPaginationClause = (limit, offset) => {
  const parsedLimit = parseInt(limit) || 10;
  const parsedOffset = parseInt(offset) || 0;
  return ` LIMIT ${parsedLimit} OFFSET ${parsedOffset}`;
};

exports.getAllOffences = async (userRole, userId, options = {}) => {
  try {
    const { limit, offset, sortBy, sortOrder, search } = options;

    // First get the total count
    let countQuery = `
            SELECT COUNT(*) as total_count
            FROM CrimeOffence co
            JOIN CriminalRecord cr ON co.criminal_id = cr.criminal_id
            JOIN Cases c ON co.case_id = c.case_id
            WHERE 1=1
        `;

    // Main query for getting the data
    let query = `
            SELECT 
                co.offence_id,
                co.status,
                co.crime_type,
                co.risk_score,
                co.reported_dt,
                co.happened_dt,
                cr.criminal_id,
                cr.name as criminal_name,
                cr.fingerprint_hash as criminal_fingerprint_hash,
                cr.nic as criminal_nic,
                cr.phone as criminal_phone,
                cr.address as criminal_address,
                cr.dob as criminal_dob,
                (
                    SELECT COUNT(*) FROM CrimeOffence co2
                    WHERE co2.criminal_id = cr.criminal_id AND co2.status = 'Convicted'
                ) as criminal_total_crimes,
                (
                    SELECT COALESCE(SUM(co2.risk_score), 0) FROM CrimeOffence co2
                    WHERE co2.criminal_id = cr.criminal_id AND co2.status = 'Convicted'
                ) as criminal_total_risk,
                c.case_id,
                c.topic as case_topic
            FROM CrimeOffence co
            JOIN CriminalRecord cr ON co.criminal_id = cr.criminal_id
            JOIN Cases c ON co.case_id = c.case_id
            WHERE 1=1
        `;

    const params = [];

    // Add role-based filtering
    if (userRole === "Sub Inspector") {
      query += ` AND c.leader_id = ?`;
      countQuery += ` AND c.leader_id = ?`;
      params.push(userId);
    }

    // Add search if provided
    if (search) {
      const searchCondition = ` AND (
                co.crime_type LIKE ? OR
                cr.name LIKE ? OR
                cr.criminal_id LIKE ? OR
                cr.nic LIKE ? OR
                c.case_id LIKE ?
            )`;
      query += searchCondition;
      countQuery += searchCondition;
      const searchParam = `%${search}%`;
      params.push(
        searchParam,
        searchParam,
        searchParam,
        searchParam,
        searchParam
      );
    }

    // Add sorting
    query += buildSortClause(sortBy, sortOrder);

    // Add pagination
    query += buildPaginationClause(limit, offset);

    // Execute both queries
    const [offences] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, params);
    const totalCount = countResult[0]?.total_count || 0;

    // Add total count to each offence
    return offences.map((offence) => ({
      ...offence,
      total_count: totalCount,
    }));
  } catch (error) {
    console.error("Error in getAllOffences:", error);
    throw new Error("Failed to fetch offences");
  }
};

exports.searchOffences = async (filters, userRole, userId, options = {}) => {
  try {
    const { limit, offset, sortBy, sortOrder } = options;

    // First get the total count
    let countQuery = `
            SELECT COUNT(*) as total_count
            FROM CrimeOffence co
            JOIN CriminalRecord cr ON co.criminal_id = cr.criminal_id
            JOIN Cases c ON co.case_id = c.case_id
            WHERE 1=1
        `;

    // Main query for getting the data
    let query = `
            SELECT 
                co.offence_id,
                co.status,
                co.crime_type,
                co.risk_score,
                co.reported_dt,
                co.happened_dt,
                cr.criminal_id,
                cr.name as criminal_name,
                cr.fingerprint_hash as criminal_fingerprint_hash,
                cr.nic as criminal_nic,
                cr.phone as criminal_phone,
                cr.address as criminal_address,
                cr.dob as criminal_dob,
                (
                    SELECT COUNT(*) FROM CrimeOffence co2
                    WHERE co2.criminal_id = cr.criminal_id AND co2.status = 'Convicted'
                ) as criminal_total_crimes,
                (
                    SELECT COALESCE(SUM(co2.risk_score), 0) FROM CrimeOffence co2
                    WHERE co2.criminal_id = cr.criminal_id AND co2.status = 'Convicted'
                ) as criminal_total_risk,
                c.case_id,
                c.topic as case_topic
            FROM CrimeOffence co
            JOIN CriminalRecord cr ON co.criminal_id = cr.criminal_id
            JOIN Cases c ON co.case_id = c.case_id
            WHERE 1=1
        `;

    const params = [];

    // Add offence ID filter
    if (filters.offence_id) {
      query += ` AND co.offence_id LIKE ?`;
      countQuery += ` AND co.offence_id LIKE ?`;
      params.push(`%${filters.offence_id}%`);
    }
    // Add search filters
    if (filters.crime_type) {
      query += ` AND co.crime_type LIKE ?`;
      countQuery += ` AND co.crime_type LIKE ?`;
      params.push(`%${filters.crime_type}%`);
    }

    if (filters.criminal_name) {
      query += ` AND cr.name LIKE ?`;
      countQuery += ` AND cr.name LIKE ?`;
      params.push(`%${filters.criminal_name}%`);
    }

    if (filters.criminal_id) {
      query += ` AND cr.criminal_id = ?`;
      countQuery += ` AND cr.criminal_id = ?`;
      params.push(filters.criminal_id);
    }

    if (filters.fingerprint) {
      query += ` AND cr.fingerprint_hash = ?`;
      countQuery += ` AND cr.fingerprint_hash = ?`;
      params.push(filters.fingerprint);
    }

    if (filters.nic) {
      query += ` AND cr.nic = ?`;
      countQuery += ` AND cr.nic = ?`;
      params.push(filters.nic);
    }

    if (filters.case_id) {
      query += ` AND c.case_id = ?`;
      countQuery += ` AND c.case_id = ?`;
      params.push(filters.case_id);
    }

    if (filters.status) {
      query += ` AND co.status = ?`;
      countQuery += ` AND co.status = ?`;
      params.push(filters.status);
    }

    // Risk level filter
    if (filters.risk_level) {
      const riskCondition =
        filters.risk_level === "high"
          ? " AND co.risk_score >= 70"
          : filters.risk_level === "medium"
          ? " AND co.risk_score >= 40 AND co.risk_score < 70"
          : " AND co.risk_score < 40";
      query += riskCondition;
      countQuery += riskCondition;
    }

    // Date range filter
    if (filters.start_date) {
      query += ` AND co.reported_dt >= ?`;
      countQuery += ` AND co.reported_dt >= ?`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ` AND co.reported_dt <= ?`;
      countQuery += ` AND co.reported_dt <= ?`;
      params.push(filters.end_date);
    }

    // Add role-based filtering
    if (userRole === "Sub Inspector") {
      query += ` AND c.leader_id = ?`;
      countQuery += ` AND c.leader_id = ?`;
      params.push(userId);
    }

    // Add sorting
    query += buildSortClause(sortBy, sortOrder);

    // Add pagination
    query += buildPaginationClause(limit, offset);

    // Execute both queries
    const [offences] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, params);
    const totalCount = countResult[0]?.total_count || 0;

    // Add total count to each offence
    return offences.map((offence) => ({
      ...offence,
      total_count: totalCount,
    }));
  } catch (error) {
    console.error("Error in searchOffences:", error);
    throw new Error("Search failed");
  }
};

exports.createOffence = async (offenceData, createdBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const batchId = await generateBatchId();

    const offence_id = await generateUniqueId("crimeoffence");
    const {
      crime_type,
      risk_score,
      reported_dt,
      happened_dt,
      criminal_id,
      case_id,
    } = offenceData;

    await connection.query(
      `INSERT INTO crimeoffence (offence_id, crime_type, risk_score, reported_dt, happened_dt, criminal_id, case_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        offence_id,
        crime_type,
        risk_score,
        reported_dt,
        happened_dt,
        criminal_id,
        case_id,
      ]
    );

    // Audit log
    const auditChanges = [
      {
        tableName: "crimeoffence",
        recordId: offence_id,
        fieldName: "crime_type",
        value: crime_type,
        actionType: "INSERT",
      },
      {
        tableName: "crimeoffence",
        recordId: offence_id,
        fieldName: "status",
        value: "Alleged",
        actionType: "INSERT",
      },
      {
        tableName: "crimeoffence",
        recordId: offence_id,
        fieldName: "risk_score",
        value: risk_score,
        actionType: "INSERT",
      },
      {
        tableName: "crimeoffence",
        recordId: offence_id,
        fieldName: "reported_dt",
        value: reported_dt,
        actionType: "INSERT",
      },
      {
        tableName: "crimeoffence",
        recordId: offence_id,
        fieldName: "happened_dt",
        value: happened_dt,
        actionType: "INSERT",
      },
      {
        tableName: "crimeoffence",
        recordId: offence_id,
        fieldName: "criminal_id",
        value: criminal_id,
        actionType: "INSERT",
      },
      {
        tableName: "crimeoffence",
        recordId: offence_id,
        fieldName: "case_id",
        value: case_id,
        actionType: "INSERT",
      },
    ];

    await logAuditTrail({
      batchId,
      changes: auditChanges,
      changedBy: createdBy,
      connection,
    });

    await connection.commit();
    return { offence_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.getOffenceById = async (offenceId) => {
  try {
    // Main offence query
    const query = `
            SELECT 
                co.offence_id,
                co.crime_type,
                co.status,
                co.risk_score,
                co.reported_dt,
                co.happened_dt,
                co.criminal_id,
                co.case_id,
                cr.name AS criminal_name,
                cr.phone AS criminal_phone,
                cr.address AS criminal_address,
                cr.nic AS criminal_nic,
                c.topic AS case_topic,
                c.status AS case_status,
                c.case_type,
                c.leader_id AS case_leader_id,
                leader.name AS case_leader_name,
                leader.role AS case_leader_role,
                leader.profile_pic AS case_leader_profile
            FROM crimeoffence co
            LEFT JOIN criminalrecord cr ON co.criminal_id = cr.criminal_id
            LEFT JOIN cases c ON co.case_id = c.case_id
            LEFT JOIN users leader ON c.leader_id = leader.user_id
            WHERE co.offence_id = ?
        `;

    const [rows] = await db.query(query, [offenceId]);

    if (rows.length === 0) {
      return null;
    }

    const offence = rows[0];

    // Get related evidence from crimeoffence_evidance table
    const evidenceQuery = `
            SELECT 
                e.evidence_id,
                e.type,
                e.location,
                e.details,
                e.collected_dt,
                e.officer_id,
                u.name as collected_by,
                u.role as officer_role
            FROM crimeoffence_evidance coe
            LEFT JOIN evidance e ON coe.evidence_id = e.evidence_id
            LEFT JOIN users u ON e.officer_id = u.user_id
            WHERE coe.offence_id = ?
            ORDER BY e.collected_dt DESC
        `;

    const [evidence] = await db.query(evidenceQuery, [offenceId]);

    // Get victims - using only existing columns: offence_id, nic, name, phone, address, dob
    const victimsQuery = `
            SELECT 
                offence_id,
                nic,
                name,
                phone,
                address,
                dob
            FROM crimeoffence_victim
            WHERE offence_id = ?
            ORDER BY name
        `;

    const [victims] = await db.query(victimsQuery, [offenceId]);

    // Add the related data to offence object
    offence.evidence = evidence || [];
    offence.victims = victims || [];

    return offence;
  } catch (error) {
    console.error("Error fetching offence by ID:", error);
    throw error;
  }
};

exports.updateOffence = async (offenceId, updateFields, updatedBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get current offence data for comparison
    const [[currentOffence]] = await connection.query(
      "SELECT crime_type, status, risk_score, reported_dt, happened_dt FROM crimeoffence WHERE offence_id = ?",
      [offenceId]
    );

    if (!currentOffence) {
      await connection.rollback();
      return null;
    }

    // Only update changed fields
    const fieldsToUpdate = {};
    const auditChanges = [];

    for (const key of Object.keys(updateFields)) {
      if (
        updateFields[key] !== undefined &&
        updateFields[key] !== currentOffence[key]
      ) {
        fieldsToUpdate[key] = updateFields[key];
        auditChanges.push({
          tableName: "crimeoffence",
          recordId: offenceId,
          fieldName: key,
          value: updateFields[key],
          actionType: "UPDATE",
        });
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      await connection.rollback();
      return currentOffence;
    }

    // Build update query dynamically
    const setClause = Object.keys(fieldsToUpdate)
      .map((f) => `${f} = ?`)
      .join(", ");
    const values = Object.values(fieldsToUpdate);
    values.push(offenceId);

    await connection.query(
      `UPDATE crimeoffence SET ${setClause} WHERE offence_id = ?`,
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

    // Return updated offence data
    const [[updatedOffence]] = await connection.query(
      "SELECT offence_id, crime_type, status, risk_score, reported_dt, happened_dt FROM crimeoffence WHERE offence_id = ?",
      [offenceId]
    );
    return updatedOffence;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.linkEvidenceToOffence = async (offenceId, evidenceId, linkedBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if link already exists
    const [existing] = await connection.query(
      "SELECT * FROM crimeoffence_evidance WHERE offence_id = ? AND evidence_id = ?",
      [offenceId, evidenceId]
    );

    if (existing.length > 0) {
      await connection.rollback();
      throw new Error("Evidence is already linked to this offence");
    }

    // Create the link
    await connection.query(
      "INSERT INTO crimeoffence_evidance (offence_id, evidence_id) VALUES (?, ?)",
      [offenceId, evidenceId]
    );

    // Audit log
    const batchId = await generateBatchId();
    const auditChanges = [
      {
        tableName: "crimeoffence_evidance",
        recordId: `${offenceId}_${evidenceId}`,
        fieldName: "offence_id",
        value: offenceId,
        actionType: "INSERT",
      },
      {
        tableName: "crimeoffence_evidance",
        recordId: `${offenceId}_${evidenceId}`,
        fieldName: "evidence_id",
        value: evidenceId,
        actionType: "INSERT",
      },
    ];

    await logAuditTrail({
      batchId,
      changes: auditChanges,
      changedBy: linkedBy,
      connection,
    });

    await connection.commit();
    return { success: true };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.addVictimToOffence = async (victimData, createdBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { offence_id, name, nic, phone, address, dob } = victimData;

    // Insert victim record - only using existing columns
    await connection.query(
      `INSERT INTO crimeoffence_victim (offence_id, nic, name, phone, address, dob) 
             VALUES (?, ?, ?, ?, ?, ?)`,
      [offence_id, nic, name, phone || null, address || null, dob || null]
    );

    // Audit log
    const batchId = await generateBatchId();
    const auditChanges = [
      {
        tableName: "crimeoffence_victim",
        recordId: `${offence_id}_${nic}`,
        fieldName: "name",
        value: name,
        actionType: "INSERT",
      },
      {
        tableName: "crimeoffence_victim",
        recordId: `${offence_id}_${nic}`,
        fieldName: "nic",
        value: nic,
        actionType: "INSERT",
      },
      {
        tableName: "crimeoffence_victim",
        recordId: `${offence_id}_${nic}`,
        fieldName: "offence_id",
        value: offence_id,
        actionType: "INSERT",
      },
    ];

    if (phone)
      auditChanges.push({
        tableName: "crimeoffence_victim",
        recordId: `${offence_id}_${nic}`,
        fieldName: "phone",
        value: phone,
        actionType: "INSERT",
      });
    if (address)
      auditChanges.push({
        tableName: "crimeoffence_victim",
        recordId: `${offence_id}_${nic}`,
        fieldName: "address",
        value: address,
        actionType: "INSERT",
      });
    if (dob)
      auditChanges.push({
        tableName: "crimeoffence_victim",
        recordId: `${offence_id}_${nic}`,
        fieldName: "dob",
        value: dob,
        actionType: "INSERT",
      });

    await logAuditTrail({
      batchId,
      changes: auditChanges,
      changedBy: createdBy,
      connection,
    });

    await connection.commit();

    // Return created victim
    const [[createdVictim]] = await connection.query(
      "SELECT * FROM crimeoffence_victim WHERE offence_id = ? AND nic = ?",
      [offence_id, nic]
    );

    return createdVictim;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
