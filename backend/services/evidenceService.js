const db = require("../config/db");
const { generateUniqueId, generateBatchId } = require("../utils/genarateIDs");
const { logAuditTrail } = require("./commonService");
const path = require("path");
const fs = require("fs");

exports.createEvidence = async (evidenceData, createdBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const evidenceId =
      evidenceData.evidence_id || (await generateUniqueId("evidance"));

    // Insert evidence record
    await connection.query(
      `INSERT INTO evidance (evidence_id, type, location, details, collected_dt, officer_id, investigation_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        evidenceId,
        evidenceData.type,
        evidenceData.location,
        evidenceData.details,
        evidenceData.collectedDateTime,
        createdBy,
        evidenceData.investigation_id,
      ]
    );

    const batchId = await generateBatchId();
    const auditChanges = [];

    // Audit log for evidence creation
    auditChanges.push({
      tableName: "evidance",
      recordId: evidenceId,
      fieldName: "type",
      value: evidenceData.type,
      actionType: "INSERT",
    });
    auditChanges.push({
      tableName: "evidance",
      recordId: evidenceId,
      fieldName: "details",
      value: evidenceData.details,
      actionType: "INSERT",
    });
    auditChanges.push({
      tableName: "evidance",
      recordId: evidenceId,
      fieldName: "collected_dt",
      value: evidenceData.collectedDateTime,
      actionType: "INSERT",
    });
    auditChanges.push({
      tableName: "evidance",
      recordId: evidenceId,
      fieldName: "officer_id",
      value: createdBy,
      actionType: "INSERT",
    });

    if (evidenceData.location) {
      auditChanges.push({
        tableName: "evidance",
        recordId: evidenceId,
        fieldName: "location",
        value: evidenceData.location,
        actionType: "INSERT",
      });
    }

    if (evidenceData.investigation_id) {
      auditChanges.push({
        tableName: "evidance",
        recordId: evidenceId,
        fieldName: "investigation_id",
        value: evidenceData.investigation_id,
        actionType: "INSERT",
      });
    }

    // Handle attachments - ensure all required fields are provided
    if (
      evidenceData.attachments &&
      Array.isArray(evidenceData.attachments) &&
      evidenceData.attachments.length > 0
    ) {
      console.log(
        "Processing attachments in service:",
        evidenceData.attachments.length
      );

      for (const attachment of evidenceData.attachments) {
        // Double check that all required fields are present
        if (
          attachment &&
          attachment.file_name &&
          attachment.file_path &&
          attachment.file_type &&
          attachment.file_size !== undefined
        ) {
          const attachmentId = await generateUniqueId("attachments");

          console.log("Inserting attachment:", attachment.file_name);

          // Insert attachment record with URL path
          await connection.query(
            `INSERT INTO attachments (attachment_id, evidence_id, file_name, file_path, file_type, file_size, uploaded_dt, uploaded_by) 
              VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [
              attachmentId,
              evidenceId,
              attachment.file_name,
              attachment.file_path, // This should be a proper URL now
              attachment.file_type,
              attachment.file_size,
              createdBy,
            ]
          );

          // Add audit logs for the attachment
          auditChanges.push({
            tableName: "attachments",
            recordId: attachmentId,
            fieldName: "file_name",
            value: attachment.file_name,
            actionType: "INSERT",
          });
          auditChanges.push({
            tableName: "attachments",
            recordId: attachmentId,
            fieldName: "file_path",
            value: attachment.file_path,
            actionType: "INSERT",
          });
          auditChanges.push({
            tableName: "attachments",
            recordId: attachmentId,
            fieldName: "file_type",
            value: attachment.file_type,
            actionType: "INSERT",
          });
          auditChanges.push({
            tableName: "attachments",
            recordId: attachmentId,
            fieldName: "file_size",
            value: attachment.file_size.toString(),
            actionType: "INSERT",
          });
          auditChanges.push({
            tableName: "attachments",
            recordId: attachmentId,
            fieldName: "evidence_id",
            value: evidenceId,
            actionType: "INSERT",
          });
          auditChanges.push({
            tableName: "attachments",
            recordId: attachmentId,
            fieldName: "uploaded_by",
            value: createdBy,
            actionType: "INSERT",
          });
        } else {
          console.warn(
            "Skipping attachment due to missing required fields:",
            attachment
          );
        }
      }
    }

    // Handle linking
    if (evidenceData.case_id) {
      // Link to case
      await connection.query(
        "INSERT INTO case_evidance (case_id, evidence_id) VALUES (?, ?)",
        [evidenceData.case_id, evidenceId]
      );

      auditChanges.push({
        tableName: "case_evidance",
        recordId: `${evidenceData.case_id}_${evidenceId}`,
        fieldName: "case_id",
        value: evidenceData.case_id,
        actionType: "INSERT",
      });
      auditChanges.push({
        tableName: "case_evidance",
        recordId: `${evidenceData.case_id}_${evidenceId}`,
        fieldName: "evidence_id",
        value: evidenceId,
        actionType: "INSERT",
      });
    }

    // Handle linking to offence
    if (evidenceData.offence_id) {
      // Link to crimeoffence_evidance table
      await connection.query(
        "INSERT INTO crimeoffence_evidance (offence_id, evidence_id) VALUES (?, ?)",
        [evidenceData.offence_id, evidenceId]
      );

      auditChanges.push({
        tableName: "crimeoffence_evidance",
        recordId: `${evidenceData.offence_id}_${evidenceId}`,
        fieldName: "offence_id",
        value: evidenceData.offence_id,
        actionType: "INSERT",
      });
      auditChanges.push({
        tableName: "crimeoffence_evidance",
        recordId: `${evidenceData.offence_id}_${evidenceId}`,
        fieldName: "evidence_id",
        value: evidenceId,
        actionType: "INSERT",
      });
    }

    // Handle witnesses
    if (evidenceData.witnesses && evidenceData.witnesses.length > 0) {
      for (const witness of evidenceData.witnesses) {
        // Only insert witnesses with at least NIC and name
        if (witness.nic && witness.name) {
          await connection.query(
            `INSERT INTO evidance_witnesses (evidence_id, nic, name, phone, email, address, dob) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              evidenceId,
              witness.nic,
              witness.name,
              witness.phone || null,
              witness.email || null,
              witness.address || null,
              witness.dob || null,
            ]
          );

          // Audit log for witnesses
          auditChanges.push({
            tableName: "evidance_witnesses",
            recordId: `${evidenceId}_${witness.nic}`,
            fieldName: "nic",
            value: witness.nic,
            actionType: "INSERT",
          });
          auditChanges.push({
            tableName: "evidance_witnesses",
            recordId: `${evidenceId}_${witness.nic}`,
            fieldName: "name",
            value: witness.name,
            actionType: "INSERT",
          });

          if (witness.phone) {
            auditChanges.push({
              tableName: "evidance_witnesses",
              recordId: `${evidenceId}_${witness.nic}`,
              fieldName: "phone",
              value: witness.phone,
              actionType: "INSERT",
            });
          }
          if (witness.email) {
            auditChanges.push({
              tableName: "evidance_witnesses",
              recordId: `${evidenceId}_${witness.nic}`,
              fieldName: "email",
              value: witness.email,
              actionType: "INSERT",
            });
          }
          if (witness.address) {
            auditChanges.push({
              tableName: "evidance_witnesses",
              recordId: `${evidenceId}_${witness.nic}`,
              fieldName: "address",
              value: witness.address,
              actionType: "INSERT",
            });
          }
          if (witness.dob) {
            auditChanges.push({
              tableName: "evidance_witnesses",
              recordId: `${evidenceId}_${witness.nic}`,
              fieldName: "dob",
              value: witness.dob,
              actionType: "INSERT",
            });
          }
        }
      }
    }

    // Log all audit changes
    await logAuditTrail({
      batchId,
      changes: auditChanges,
      changedBy: createdBy,
      connection,
    });

    await connection.commit();

    // Return created evidence with attachments
    const [[createdEvidence]] = await connection.query(
      "SELECT * FROM evidance WHERE evidence_id = ?",
      [evidenceId]
    );

    const [attachments] = await connection.query(
      "SELECT * FROM attachments WHERE evidence_id = ?",
      [evidenceId]
    );

    return { ...createdEvidence, attachments };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.getAllEvidence = async (userRole, userId, filters = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      sortBy = "collected_dt",
      sortOrder = "DESC",
    } = filters;

    // Subquery for total count
    const totalCountQuery = `
            SELECT COUNT(DISTINCT e.evidence_id) as total_count
            FROM evidance e
        `;

    // Main query
    let query = `
            SELECT 
                e.evidence_id,
                e.type,
                e.location,
                e.details,
                e.collected_dt,
                e.officer_id,
                e.investigation_id,
                u.name as collected_by,
                u.role as officer_role,
                i.topic as investigation_topic,
                i.status as investigation_status,
                -- Prefer investigation's case, else case_evidance
                COALESCE(i.case_id, ce.case_id) as case_id,
                c.topic as case_topic,
                c.status as case_status,
                COUNT(w.nic) as witness_count
            FROM evidance e
            LEFT JOIN users u ON e.officer_id = u.user_id
            LEFT JOIN investigation i ON e.investigation_id = i.investigation_id
            LEFT JOIN case_evidance ce ON ce.evidence_id = e.evidence_id
            LEFT JOIN cases c ON (i.case_id = c.case_id OR ce.case_id = c.case_id)
            LEFT JOIN evidance_witnesses w ON e.evidence_id = w.evidence_id
            GROUP BY e.evidence_id
            ORDER BY e.${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;

    // Get total count
    const [[{ total_count }]] = await db.query(totalCountQuery);

    const [evidences] = await db.query(query, [limit, offset]);
    // Attach total_count to each evidence for compatibility
    evidences.forEach((e) => (e.total_count = total_count));

    return evidences;
  } catch (error) {
    console.error("Error fetching evidence:", error);
    throw error;
  }
};

exports.searchEvidence = async (filters, userRole, userId) => {
  try {
    const {
      type,
      evidence_id,
      location,
      case_id,
      investigation_id,
      offence_id,
      officer_name,
      evidence_type,
      linking_type,
      start_date,
      end_date,
      limit = 50,
      offset = 0,
      sortBy = "collected_dt",
      sortOrder = "DESC",
    } = filters;

    // Subquery for total count
    let countQuery = `
            SELECT COUNT(DISTINCT e.evidence_id) as total_count
            FROM evidance e
            LEFT JOIN investigation i ON e.investigation_id = i.investigation_id
            LEFT JOIN case_evidance ce ON ce.evidence_id = e.evidence_id
            LEFT JOIN crimeoffence_evidance coe ON coe.evidence_id = e.evidence_id
            LEFT JOIN cases c ON (i.case_id = c.case_id OR ce.case_id = c.case_id)
            LEFT JOIN users u ON e.officer_id = u.user_id
            WHERE 1=1
        `;

    let query = `
            SELECT 
                e.evidence_id,
                e.type,
                e.location,
                e.details,
                e.collected_dt,
                e.officer_id,
                e.investigation_id,
                u.name as collected_by,
                u.role as officer_role,
                i.topic as investigation_topic,
                i.status as investigation_status,
                COALESCE(i.case_id, ce.case_id) as case_id,
                c.topic as case_topic,
                c.status as case_status,
                COUNT(DISTINCT w.nic) as witness_count
            FROM evidance e
            LEFT JOIN users u ON e.officer_id = u.user_id
            LEFT JOIN investigation i ON e.investigation_id = i.investigation_id
            LEFT JOIN case_evidance ce ON ce.evidence_id = e.evidence_id
            LEFT JOIN crimeoffence_evidance coe ON coe.evidence_id = e.evidence_id
            LEFT JOIN cases c ON (i.case_id = c.case_id OR ce.case_id = c.case_id)
            LEFT JOIN evidance_witnesses w ON e.evidence_id = w.evidence_id
            WHERE 1=1
        `;

    const params = [];
    const countParams = [];

    if (type) {
      query += " AND e.type LIKE ?";
      countQuery += " AND e.type LIKE ?";
      params.push(`%${type}%`);
      countParams.push(`%${type}%`);
    }
    if (evidence_id) {
      query += " AND e.evidence_id LIKE ?";
      countQuery += " AND e.evidence_id LIKE ?";
      params.push(`%${evidence_id}%`);
      countParams.push(`%${evidence_id}%`);
    }
    if (location) {
      query += " AND e.location LIKE ?";
      countQuery += " AND e.location LIKE ?";
      params.push(`%${location}%`);
      countParams.push(`%${location}%`);
    }
    if (case_id) {
      query += " AND (c.case_id = ? OR c.case_id LIKE ?)";
      countQuery += " AND (c.case_id = ? OR c.case_id LIKE ?)";
      params.push(case_id, `%${case_id}%`);
      countParams.push(case_id, `%${case_id}%`);
    }
    if (investigation_id) {
      query += " AND (e.investigation_id = ? OR e.investigation_id LIKE ?)";
      countQuery +=
        " AND (e.investigation_id = ? OR e.investigation_id LIKE ?)";
      params.push(investigation_id, `%${investigation_id}%`);
      countParams.push(investigation_id, `%${investigation_id}%`);
    }
    if (offence_id) {
      query += " AND (coe.offence_id = ? OR coe.offence_id LIKE ?)";
      countQuery += " AND (coe.offence_id = ? OR coe.offence_id LIKE ?)";
      params.push(offence_id, `%${offence_id}%`);
      countParams.push(offence_id, `%${offence_id}%`);
    }
    if (officer_name) {
      query += " AND u.name LIKE ?";
      countQuery += " AND u.name LIKE ?";
      params.push(`%${officer_name}%`);
      countParams.push(`%${officer_name}%`);
    }
    if (evidence_type) {
      query += " AND e.type = ?";
      countQuery += " AND e.type = ?";
      params.push(evidence_type);
      countParams.push(evidence_type);
    }
    if (linking_type === "case") {
      query += " AND ce.case_id IS NOT NULL";
      countQuery += " AND ce.case_id IS NOT NULL";
    } else if (linking_type === "investigation") {
      query += " AND e.investigation_id IS NOT NULL";
      countQuery += " AND e.investigation_id IS NOT NULL";
    } else if (linking_type === "offence") {
      query += " AND coe.offence_id IS NOT NULL";
      countQuery += " AND coe.offence_id IS NOT NULL";
    }
    if (start_date) {
      query += " AND DATE(e.collected_dt) >= ?";
      countQuery += " AND DATE(e.collected_dt) >= ?";
      params.push(start_date);
      countParams.push(start_date);
    }
    if (end_date) {
      query += " AND DATE(e.collected_dt) <= ?";
      countQuery += " AND DATE(e.collected_dt) <= ?";
      params.push(end_date);
      countParams.push(end_date);
    }

    query += ` GROUP BY e.evidence_id ORDER BY e.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Get total count
    const [[{ total_count }]] = await db.query(countQuery, countParams);

    const [evidences] = await db.query(query, params);
    evidences.forEach((e) => (e.total_count = total_count));
    return evidences;
  } catch (error) {
    console.error("Error searching evidence:", error);
    throw error;
  }
};

exports.getEvidenceById = async (evidenceId) => {
  try {
    // Main evidence query
    let query = `
            SELECT 
                e.evidence_id,
                e.type,
                e.location,
                e.details,
                e.collected_dt,
                e.officer_id,
                e.investigation_id,
                u.name as collected_by,
                u.role as officer_role,
                u.profile_pic as officer_profile,
                i.topic as investigation_topic,
                i.status as investigation_status,
                i.start_dt as investigation_start,
                i.end_dt as investigation_end,
                i.location as investigation_location
            FROM evidance e
            LEFT JOIN users u ON e.officer_id = u.user_id
            LEFT JOIN investigation i ON e.investigation_id = i.investigation_id
            WHERE e.evidence_id = ?
        `;

    const [evidenceRows] = await db.query(query, [evidenceId]);

    if (evidenceRows.length === 0) {
      return null;
    }

    const evidence = evidenceRows[0];

    // Get all linked cases
    const [linkedCases] = await db.query(
      `
            SELECT DISTINCT
                c.case_id,
                c.topic as case_topic,
                c.case_type,
                c.status as case_status,
                c.started_dt,
                c.end_dt,
                c.leader_id,
                leader.name as leader_name,
                leader.role as leader_role
            FROM cases c
            LEFT JOIN case_evidance ce ON c.case_id = ce.case_id
            LEFT JOIN investigation i ON c.case_id = i.case_id
            LEFT JOIN users leader ON c.leader_id = leader.user_id
            WHERE ce.evidence_id = ? OR i.investigation_id = ?
        `,
      [evidenceId, evidence.investigation_id]
    );

    // Get witnesses
    const [witnesses] = await db.query(
      `
            SELECT nic, name, phone, email, address, dob
            FROM evidance_witnesses
            WHERE evidence_id = ?
        `,
      [evidenceId]
    );

    // Get investigation officers if linked to investigation
    let investigationOfficers = [];
    if (evidence.investigation_id) {
      const [officers] = await db.query(
        `
                SELECT 
                    u.user_id,
                    u.name,
                    u.role,
                    u.profile_pic
                FROM investigation_officer io
                LEFT JOIN users u ON io.officer_id = u.user_id
                WHERE io.investigation_id = ?
            `,
        [evidence.investigation_id]
      );
      investigationOfficers = officers;
    }

    // Get related evidence from same case(s)
    const [relatedEvidence] = await db.query(
      `
            SELECT DISTINCT
                e2.evidence_id,
                e2.type,
                e2.collected_dt,
                u2.name as collected_by
            FROM evidance e2
            LEFT JOIN users u2 ON e2.officer_id = u2.user_id
            LEFT JOIN case_evidance ce ON e2.evidence_id = ce.evidence_id
            WHERE ce.case_id IN (
                SELECT DISTINCT ce2.case_id 
                FROM case_evidance ce2
                WHERE ce2.evidence_id = ?
            ) AND e2.evidence_id != ?
            ORDER BY e2.collected_dt DESC
            LIMIT 10
        `,
      [evidenceId, evidenceId]
    );

    evidence.linked_cases = linkedCases;
    evidence.witnesses = witnesses;
    evidence.investigation_officers = investigationOfficers;
    evidence.related_evidence = relatedEvidence;

    // Add attachments to the query
    const [attachments] = await db.query(
      `
            SELECT 
                attachment_id,
                file_name,
                file_path,
                file_type,
                file_size,
                uploaded_dt,
                uploaded_by
            FROM attachments 
            WHERE evidence_id = ?
            ORDER BY uploaded_dt DESC
        `,
      [evidenceId]
    );

    return {
      ...evidence,
      attachments,
    };
  } catch (error) {
    console.error("Error fetching evidence by ID:", error);
    throw error;
  }
};

exports.updateEvidence = async (evidenceId, updateFields, updatedBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get current evidence data for comparison
    const [[currentEvidence]] = await connection.query(
      "SELECT type, location, details, collected_dt FROM evidance WHERE evidence_id = ?",
      [evidenceId]
    );

    if (!currentEvidence) {
      await connection.rollback();
      return null;
    }

    // Handle datetime formatting for collected_dt
    if (updateFields.collected_dt) {
      let collectedDateTime = updateFields.collected_dt;
      if (collectedDateTime.includes("T")) {
        collectedDateTime = collectedDateTime
          .replace("T", " ")
          .replace("Z", "");
        collectedDateTime = collectedDateTime.split(".")[0];
      }
      updateFields.collected_dt = collectedDateTime;
    }

    // Only update changed fields
    const fieldsToUpdate = {};
    const auditChanges = [];
    for (const key of Object.keys(updateFields)) {
      if (
        updateFields[key] !== undefined &&
        updateFields[key] !== currentEvidence[key]
      ) {
        fieldsToUpdate[key] = updateFields[key];
        auditChanges.push({
          tableName: "evidance",
          recordId: evidenceId,
          fieldName: key,
          value: updateFields[key],
          actionType: "UPDATE",
        });
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      await connection.rollback();
      return currentEvidence;
    }

    // Build update query dynamically
    const setClause = Object.keys(fieldsToUpdate)
      .map((f) => `${f} = ?`)
      .join(", ");
    const values = Object.values(fieldsToUpdate);
    values.push(evidenceId);

    await connection.query(
      `UPDATE evidance SET ${setClause} WHERE evidence_id = ?`,
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

    // Return updated evidence data
    const [[updatedEvidence]] = await connection.query(
      "SELECT evidence_id, type, location, details, collected_dt, officer_id FROM evidance WHERE evidence_id = ?",
      [evidenceId]
    );
    return updatedEvidence;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.getEvidenceCollectedBy = async (evidence_id) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      `
      SELECT u.name as collected_by
      FROM evidance e
      LEFT JOIN users u ON e.officer_id = u.user_id
      WHERE e.evidence_id = ?
    `,
      [evidence_id]
    );
    return rows[0];
  } catch (error) {
    console.error("Error fetching evidence collected by:", error);
    throw error;
  } finally {
    connection.release();
  }
};

//get collected officer id
exports.getCollectedBy = async (evidence_id) => {
  try {
    const [rows] = await db.query(
      `SELECT officer_id FROM evidance WHERE evidence_id = ?`,
      [evidence_id]
    );
    return rows[0].officer_id || null;
  } catch (error) {
    console.error("Error fetching collected officer ID:", error);
    throw error;
  }
};

// Add new method for creating attachments
exports.createAttachment = async (attachmentData, uploadedBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const attachmentId = await generateUniqueId("attachments");

    // Insert attachment record
    await connection.query(
      `INSERT INTO attachments (attachment_id, evidence_id, file_name, file_path, file_type, file_size, uploaded_dt, uploaded_by) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        attachmentId,
        attachmentData.evidence_id,
        attachmentData.file_name,
        attachmentData.file_path,
        attachmentData.file_type,
        attachmentData.file_size,
        uploadedBy,
      ]
    );

    // Create audit log
    const batchId = await generateBatchId();
    const auditChanges = [
      {
        tableName: "attachments",
        recordId: attachmentId,
        fieldName: "file_name",
        value: attachmentData.file_name,
        actionType: "INSERT",
      },
      {
        tableName: "attachments",
        recordId: attachmentId,
        fieldName: "file_path",
        value: attachmentData.file_path,
        actionType: "INSERT",
      },
      {
        tableName: "attachments",
        recordId: attachmentId,
        fieldName: "file_type",
        value: attachmentData.file_type,
        actionType: "INSERT",
      },
      {
        tableName: "attachments",
        recordId: attachmentId,
        fieldName: "file_size",
        value: attachmentData.file_size.toString(),
        actionType: "INSERT",
      },
      {
        tableName: "attachments",
        recordId: attachmentId,
        fieldName: "evidence_id",
        value: attachmentData.evidence_id,
        actionType: "INSERT",
      },
      {
        tableName: "attachments",
        recordId: attachmentId,
        fieldName: "uploaded_by",
        value: uploadedBy,
        actionType: "INSERT",
      },
    ];

    await logAuditTrail({
      batchId,
      changes: auditChanges,
      changedBy: uploadedBy,
      connection,
    });

    await connection.commit();

    // Return the created attachment
    const [[createdAttachment]] = await connection.query(
      "SELECT * FROM attachments WHERE attachment_id = ?",
      [attachmentId]
    );

    return createdAttachment;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// Add method to get attachment by ID
exports.getAttachmentById = async (attachmentId) => {
  try {
    const [attachments] = await db.query(
      `SELECT 
        a.attachment_id,
        a.evidence_id,
        a.file_name,
        a.file_path,
        a.file_type,
        a.file_size,
        a.uploaded_dt,
        a.uploaded_by,
        u.name as uploaded_by_name
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.user_id
      WHERE a.attachment_id = ?`,
      [attachmentId]
    );

    return attachments.length > 0 ? attachments[0] : null;
  } catch (error) {
    console.error("Error fetching attachment by ID:", error);
    throw error;
  }
};

// Add method to get all attachments for an evidence
exports.getAttachmentsByEvidenceId = async (evidenceId) => {
  try {
    const [attachments] = await db.query(
      `SELECT 
        a.attachment_id,
        a.evidence_id,
        a.file_name,
        a.file_path,
        a.file_type,
        a.file_size,
        a.uploaded_dt,
        a.uploaded_by,
        u.name as uploaded_by_name
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.user_id
      WHERE a.evidence_id = ?
      ORDER BY a.uploaded_dt DESC`,
      [evidenceId]
    );

    return attachments;
  } catch (error) {
    console.error("Error fetching attachments for evidence:", error);
    throw error;
  }
};

// Add method to delete attachment
exports.deleteAttachment = async (attachmentId, deletedBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get attachment details before deletion for audit
    const [[attachment]] = await connection.query(
      "SELECT * FROM attachments WHERE attachment_id = ?",
      [attachmentId]
    );

    if (!attachment) {
      await connection.rollback();
      return false;
    }

    // Delete attachment record
    await connection.query("DELETE FROM attachments WHERE attachment_id = ?", [
      attachmentId,
    ]);

    // Create audit log
    const batchId = await generateBatchId();
    const auditChanges = [
      {
        tableName: "attachments",
        recordId: attachmentId,
        fieldName: "file_name",
        value: attachment.file_name,
        actionType: "DELETE",
      },
      {
        tableName: "attachments",
        recordId: attachmentId,
        fieldName: "evidence_id",
        value: attachment.evidence_id,
        actionType: "DELETE",
      },
    ];

    await logAuditTrail({
      batchId,
      changes: auditChanges,
      changedBy: deletedBy,
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

// Update the getEvidenceById method to include investigation_officers
exports.getEvidenceById = async (evidenceId) => {
  try {
    // Main evidence query
    let query = `
            SELECT 
                e.evidence_id,
                e.type,
                e.location,
                e.details,
                e.collected_dt,
                e.officer_id,
                e.investigation_id,
                u.name as collected_by,
                u.role as officer_role,
                u.profile_pic as officer_profile,
                i.topic as investigation_topic,
                i.status as investigation_status,
                i.start_dt as investigation_start,
                i.end_dt as investigation_end,
                i.location as investigation_location
            FROM evidance e
            LEFT JOIN users u ON e.officer_id = u.user_id
            LEFT JOIN investigation i ON e.investigation_id = i.investigation_id
            WHERE e.evidence_id = ?
        `;

    const [evidenceRows] = await db.query(query, [evidenceId]);

    if (evidenceRows.length === 0) {
      return null;
    }

    const evidence = evidenceRows[0];

    // Get all linked cases
    const [linkedCases] = await db.query(
      `
            SELECT DISTINCT
                c.case_id,
                c.topic as case_topic,
                c.case_type,
                c.status as case_status,
                c.started_dt,
                c.end_dt,
                c.leader_id,
                leader.name as leader_name,
                leader.role as leader_role
            FROM cases c
            LEFT JOIN case_evidance ce ON c.case_id = ce.case_id
            LEFT JOIN investigation i ON c.case_id = i.case_id
            LEFT JOIN users leader ON c.leader_id = leader.user_id
            WHERE ce.evidence_id = ? OR i.investigation_id = ?
        `,
      [evidenceId, evidence.investigation_id]
    );

    // Get witnesses
    const [witnesses] = await db.query(
      `
            SELECT nic, name, phone, email, address, dob
            FROM evidance_witnesses
            WHERE evidence_id = ?
        `,
      [evidenceId]
    );

    // Get investigation officers if linked to investigation
    let investigationOfficers = [];
    if (evidence.investigation_id) {
      const [officers] = await db.query(
        `
                SELECT 
                    u.user_id,
                    u.name,
                    u.role,
                    u.profile_pic
                FROM investigation_officer io
                LEFT JOIN users u ON io.officer_id = u.user_id
                WHERE io.investigation_id = ?
            `,
        [evidence.investigation_id]
      );
      investigationOfficers = officers;
    }

    // Get related evidence from same case(s)
    const [relatedEvidence] = await db.query(
      `
            SELECT DISTINCT
                e2.evidence_id,
                e2.type,
                e2.collected_dt,
                u2.name as collected_by
            FROM evidance e2
            LEFT JOIN users u2 ON e2.officer_id = u2.user_id
            LEFT JOIN case_evidance ce ON e2.evidence_id = ce.evidence_id
            WHERE ce.case_id IN (
                SELECT DISTINCT ce2.case_id 
                FROM case_evidance ce2
                WHERE ce2.evidence_id = ?
            ) AND e2.evidence_id != ?
            ORDER BY e2.collected_dt DESC
            LIMIT 10
        `,
      [evidenceId, evidenceId]
    );

    // Get attachments using the new service method
    const attachments = await this.getAttachmentsByEvidenceId(evidenceId);

    evidence.linked_cases = linkedCases;
    evidence.witnesses = witnesses;
    evidence.investigation_officers = investigationOfficers;
    evidence.related_evidence = relatedEvidence;
    evidence.attachments = attachments;

    return evidence;
  } catch (error) {
    console.error("Error fetching evidence by ID:", error);
    throw error;
  }
};
