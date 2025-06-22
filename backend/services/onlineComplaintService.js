const db = require('../config/db');
const { generateUniqueId } = require("../utils/genarateIDs");

// Get all online complaints (optionally with filters)
exports.getAllOnlineComplaints = async (filters) => {
  let query = `SELECT * FROM online_complaints`;
  const params = [];
  
  query += ' ORDER BY complaint_date DESC';
  const [rows] = await db.query(query, params);
  return rows;
};

// Get online complaint by ID (with evidence metadata)
exports.getOnlineComplaintById = async (complaint_id) => {
  try {
    // Fetch complaint main data
    const [complaintRows] = await db.query(
      `SELECT * FROM online_complaints WHERE complaint_id = ?`,
      [complaint_id]
    );
    if (!complaintRows.length) return null;
    const complaint = complaintRows[0];
    // Fetch evidence metadata (not file_data for performance)
    const [evidenceRows] = await db.query(
      `SELECT evidence_id, file_name, file_type, file_size, uploaded_at FROM online_complaint_evidence WHERE complaint_id = ?`,
      [complaint_id]
    );
    complaint.evidence = evidenceRows;
    return complaint;
  } catch (err) {
    console.error('[ERROR] Failed to fetch online complaint by ID:', err);
    throw err;
  }
};

// Create a new online complaint and evidence
exports.createOnlineComplaint = async (complaintData, files) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // Generate complaint ID
    const complaint_id = await generateUniqueId('online_complaints');
    // Insert complaint
    await connection.query(
      `INSERT INTO online_complaints (
        complaint_id, complaint_type, description, complainant_full_name, nic_no, dob, phone_no, email, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        complaint_id,
        complaintData.complaint_type,
        complaintData.description,
        complaintData.complainant_full_name,
        complaintData.nic_no,
        complaintData.dob,
        complaintData.phone_no,
        complaintData.email,
        complaintData.address
      ]
    );
    // Insert evidence files
    if (files && files.length > 0) {
      for (const file of files) {
        const evidence_id = await generateUniqueId('online_complaint_evidence');
        await connection.query(
          `INSERT INTO online_complaint_evidence (
            evidence_id, complaint_id, file_name, file_type, file_size, file_data
          ) VALUES (?, ?, ?, ?, ?, ?)` ,
          [
            evidence_id,
            complaint_id,
            file.originalname,
            file.mimetype,
            file.size,
            file.buffer
          ]
        );
      }
    }
    await connection.commit();
    return complaint_id;
  } catch (err) {
    await connection.rollback();
    console.error('[ERROR] DB transaction failed:', err);
    throw err;
  } finally {
    connection.release();
  }
};

// Get status/result of an online complaint by ID
exports.getOnlineComplaintStatusById = async (complaint_id) => {
  try {
    const [rows] = await db.query(
      `SELECT complaint_id, status, complaint_date FROM online_complaints WHERE complaint_id = ?`,
      [complaint_id]
    );
    if (!rows.length) return null;
    return rows[0];
  } catch (err) {
    console.error('[ERROR] Failed to fetch online complaint status:', err);
    throw err;
  }
};