const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const { generateUniqueId } = require("../utils/genarateIDs");

// Create directories if they don't exist
const createDirectoryIfNotExists = async (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create uploads directory structure
const uploadsDir = path.join(__dirname, "..", "uploads");
const onlineEvidencesDir = path.join(uploadsDir, "online_evidences");

// Create directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(onlineEvidencesDir)) {
  fs.mkdirSync(onlineEvidencesDir, { recursive: true });
}

// Get all online complaints (optionally with filters)
exports.getAllOnlineComplaints = async (filters) => {
  let query = `SELECT * FROM online_complaints`;
  const params = [];

  query += " ORDER BY complaint_date DESC";
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
    console.error("[ERROR] Failed to fetch online complaint by ID:", err);
    throw err;
  }
};

// Create a new online complaint and evidence
exports.createOnlineComplaint = async (complaintData, files) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // Generate complaint ID
    const complaint_id = await generateUniqueId("online_complaints");
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
        complaintData.address,
      ]
    );
    // Insert evidence files
    if (files && files.length > 0) {
      for (const file of files) {
        const evidence_id = await generateUniqueId("online_complaint_evidence");
        await connection.query(
          `INSERT INTO online_complaint_evidence (
            evidence_id, complaint_id, file_name, file_type, file_size, file_data
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            evidence_id,
            complaint_id,
            file.originalname,
            file.mimetype,
            file.size,
            file.buffer,
          ]
        );
      }
    }
    await connection.commit();
    return complaint_id;
  } catch (err) {
    await connection.rollback();
    console.error("[ERROR] DB transaction failed:", err);
    throw err;
  } finally {
    connection.release();
  }
};

// Create a new online complaint and evidence with file system storage
exports.createOnlineComplaintWithFiles = async (complaintData, files) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Generate complaint ID
    const complaint_id = await generateUniqueId("online_complaints");

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
        complaintData.address,
      ]
    );

    // Handle evidence files
    if (files && files.length > 0) {
      // Create directory for online evidences
      const baseDir = path.join(
        __dirname,
        "..",
        "uploads",
        "online_evidences",
        complaint_id
      );

      // Create directories if they don't exist
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }

      for (const file of files) {
        const evidence_id = await generateUniqueId("online_complaint_evidence");

        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const fileExtension = path.extname(file.originalname);
        const fileName = `${evidence_id}_${timestamp}${fileExtension}`;
        const filePath = path.join(baseDir, fileName);

        // Save file to disk
        fs.writeFileSync(filePath, file.buffer);

        // Store file metadata in database
        await connection.query(
          `INSERT INTO online_complaint_evidence (
            evidence_id, complaint_id, file_name, original_name, file_type, file_size, file_path
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            evidence_id,
            complaint_id,
            fileName,
            file.originalname,
            file.mimetype,
            file.size,
            filePath,
          ]
        );
      }
    }

    await connection.commit();
    return complaint_id;
  } catch (err) {
    await connection.rollback();
    console.error("[ERROR] DB transaction failed:", err);
    throw err;
  } finally {
    connection.release();
  }
};

// DELETE ALL OLD FUNCTIONS AND USE ONLY THIS ONE
exports.createOnlineComplaintFinal = async (complaintData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Insert complaint
    await connection.query(
      `INSERT INTO online_complaints (
        complaint_id, complaint_type, description, complainant_full_name, nic_no, dob, phone_no, email, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        complaintData.complaint_id,
        complaintData.complaint_type,
        complaintData.description,
        complaintData.complainant_full_name,
        complaintData.nic_no,
        complaintData.dob,
        complaintData.phone_no,
        complaintData.email,
        complaintData.address,
      ]
    );

    // Handle evidence files - ONLY using columns that exist in your database
    if (
      complaintData.evidenceFiles &&
      Array.isArray(complaintData.evidenceFiles) &&
      complaintData.evidenceFiles.length > 0
    ) {
      for (const evidenceFile of complaintData.evidenceFiles) {
        if (
          evidenceFile &&
          evidenceFile.file_name &&
          evidenceFile.file_type &&
          evidenceFile.file_size !== undefined
        ) {
          const evidence_id = await generateUniqueId(
            "online_complaint_evidence"
          );

          // Insert using ONLY the columns that exist in your table
          await connection.query(
            `INSERT INTO online_complaint_evidence (
              evidence_id, complaint_id, file_name, file_type, file_size, file_url
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              evidence_id,
              complaintData.complaint_id,
              evidenceFile.file_name,
              evidenceFile.file_type,
              evidenceFile.file_size,
              evidenceFile.file_path,
            ]
          );
        }
      }
    }

    await connection.commit();
    return complaintData.complaint_id;
  } catch (err) {
    await connection.rollback();
    console.error("[ERROR] DB transaction failed:", err);
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
    console.error("[ERROR] Failed to fetch online complaint status:", err);
    throw err;
  }
};

// Get online complaint by ID for viewing (public access)
exports.viewOnlineComplaint = async (complaint_id) => {
  try {
    const complaint = await this.getOnlineComplaintById(complaint_id);
    return complaint;
  } catch (err) {
    console.error("[ERROR] Failed to view online complaint:", err);
    throw err;
  }
};

// Get online complaint by ID with evidence files (enhanced version)
exports.viewOnlineComplaintWithFiles = async (complaint_id) => {
  try {
    const complaint = await this.getOnlineComplaintById(complaint_id);

    // Get evidence files for this complaint (same pattern as evidence system)
    if (complaint) {
      const [evidenceFiles] = await db.query(
        `SELECT 
          evidence_id,
          file_name,
          original_name,
          file_path,
          file_type,
          file_size,
          uploaded_dt
        FROM online_complaint_evidence 
        WHERE complaint_id = ?
        ORDER BY uploaded_dt DESC`,
        [complaint_id]
      );

      complaint.evidence_files = evidenceFiles;
    }

    return complaint;
  } catch (err) {
    console.error("[ERROR] Failed to view online complaint with files:", err);
    throw err;
  }
};

// Get online complaint by ID with evidence files (works with current database schema)
exports.getOnlineComplaintWithFiles = async (complaint_id) => {
  try {
    const complaint = await this.getOnlineComplaintById(complaint_id);    // Get evidence files for this complaint using ACTUAL database columns
    if (complaint) {
      const [evidenceFiles] = await db.query(
        `SELECT 
          evidence_id,
          file_name,
          file_type,
          file_size,
          file_url,
          uploaded_at
        FROM online_complaint_evidence 
        WHERE complaint_id = ?
        ORDER BY uploaded_at DESC`,
        [complaint_id]
      );
      
      complaint.evidence_files = evidenceFiles;
    }

    return complaint;
  } catch (err) {
    console.error("[ERROR] Failed to get online complaint with files:", err);
    throw err;
  }
};

// Get all online complaints with filtering
exports.getAllOnlineComplaints = async (filters = {}) => {
  try {
    let whereClause = "";
    const params = [];

    if (filters.status && filters.status !== "all") {
      whereClause = "WHERE status = ?";
      params.push(filters.status);
    }

    const [complaints] = await db.query(
      `SELECT 
        complaint_id,
        complaint_type,
        description,
        complainant_full_name,
        nic_no,
        dob,
        phone_no,
        email,
        address,
        complaint_date,
        status
      FROM online_complaints 
      ${whereClause}
      ORDER BY complaint_date DESC`,
      params
    );

    return complaints;
  } catch (err) {
    console.error("[ERROR] Failed to get online complaints:", err);
    throw err;
  }
};

// Search online complaints
exports.searchOnlineComplaints = async (searchParams) => {
  try {
    let whereConditions = [];
    const params = [];

    if (searchParams.description) {
      whereConditions.push("description LIKE ?");
      params.push(`%${searchParams.description}%`);
    }

    if (searchParams.complaint_id) {
      whereConditions.push("complaint_id LIKE ?");
      params.push(`%${searchParams.complaint_id}%`);
    }

    if (searchParams.complainant_name) {
      whereConditions.push("complainant_full_name LIKE ?");
      params.push(`%${searchParams.complainant_name}%`);
    }

    if (searchParams.email) {
      whereConditions.push("email LIKE ?");
      params.push(`%${searchParams.email}%`);
    }

    if (searchParams.phone) {
      whereConditions.push("phone_no LIKE ?");
      params.push(`%${searchParams.phone}%`);
    }

    if (searchParams.status && searchParams.status !== "all") {
      whereConditions.push("status = ?");
      params.push(searchParams.status);
    }

    if (searchParams.timePeriod && searchParams.timePeriod !== "all") {
      const days = {
        last_7_days: 7,
        last_30_days: 30,
        last_90_days: 90,
      };

      if (days[searchParams.timePeriod]) {
        whereConditions.push(
          "complaint_date >= DATE_SUB(NOW(), INTERVAL ? DAY)"
        );
        params.push(days[searchParams.timePeriod]);
      }
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const [complaints] = await db.query(
      `SELECT 
        complaint_id,
        complaint_type,
        description,
        complainant_full_name,
        nic_no,
        dob,
        phone_no,
        email,
        address,
        complaint_date,
        status
      FROM online_complaints 
      ${whereClause}
      ORDER BY complaint_date DESC`,
      params
    );

    return complaints;
  } catch (err) {
    console.error("[ERROR] Failed to search online complaints:", err);
    throw err;
  }
};

// Update online complaint
exports.updateOnlineComplaint = async (updateData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { complaint_id, description, status } = updateData;
    const updateFields = [];
    const params = [];

    if (description !== undefined) {
      updateFields.push("description = ?");
      params.push(description);
    }

    if (status !== undefined) {
      updateFields.push("status = ?");
      params.push(status);
    }

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    params.push(complaint_id);

    await connection.query(
      `UPDATE online_complaints 
       SET ${updateFields.join(", ")} 
       WHERE complaint_id = ?`,
      params
    );

    await connection.commit();
    return { complaint_id };
  } catch (err) {
    await connection.rollback();
    console.error("[ERROR] Failed to update online complaint:", err);
    throw err;
  } finally {
    connection.release();
  }
};

// Close online complaint
exports.closeOnlineComplaint = async (closeData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { complaint_id, case_id } = closeData;

    // Update complaint status to closed
    await connection.query(
      "UPDATE online_complaints SET status = ? WHERE complaint_id = ?",
      ["closed", complaint_id]
    );

    // If there's a related case, close it too
    if (case_id) {
      await connection.query("UPDATE cases SET status = ? WHERE case_id = ?", [
        "closed",
        case_id,
      ]);
    }

    await connection.commit();
    return { complaint_id, case_id };
  } catch (err) {
    await connection.rollback();
    console.error("[ERROR] Failed to close online complaint:", err);
    throw err;
  } finally {
    connection.release();
  }
};
