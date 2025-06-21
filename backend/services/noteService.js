const db = require("../config/db");
const { generateBatchId } = require("../utils/genarateIDs");
const { logAuditTrail } = require("./commonService");

// Create a new note
exports.createNote = async (noteData, createdBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Generate batch ID for audit trail
    const batchId = await generateBatchId();

    // Insert the note
    const result = await connection.query(
      `INSERT INTO notes (note_id, reference_table, reference_id, description, created_by, receiver_id, read_status, created_dt) 
       VALUES (?, ?, ?, ?, ?, ?, DEFAULT, NOW())`,
      [
        noteData.note_id,
        noteData.reference_table,
        noteData.reference_id,
        noteData.description,
        createdBy,
        noteData.receiver_id,
      ]
    );

    // Log in audit trail
    const auditChanges = [
      {
        tableName: "notes",
        recordId: noteData.note_id,
        fieldName: "note_id",
        value: noteData.note_id,
        actionType: "INSERT",
      },
      {
        tableName: "notes",
        recordId: noteData.note_id,
        fieldName: "reference_table",
        value: noteData.reference_table,
        actionType: "INSERT",
      },
      {
        tableName: "notes",
        recordId: noteData.note_id,
        fieldName: "reference_id",
        value: noteData.reference_id,
        actionType: "INSERT",
      },
      {
        tableName: "notes",
        recordId: noteData.note_id,
        fieldName: "description",
        value: noteData.description,
        actionType: "INSERT",
      },
      {
        tableName: "notes",
        recordId: noteData.note_id,
        fieldName: "created_by",
        value: createdBy,
        actionType: "INSERT",
      },
      {
        tableName: "notes",
        recordId: noteData.note_id,
        fieldName: "receiver_id",
        value: noteData.receiver_id,
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
    return { success: true, note_id: noteData.note_id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Get notes by reference (table and ID)
exports.getNotesByReference = async (referenceTable, referenceId, userId) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        n.note_id,
        n.description,
        n.read_status,
        n.created_dt,
        u1.name AS created_by_name,
        u1.role AS created_by_role,
        u1.profile_pic AS created_by_profile,
        u2.name AS receiver_name,
        u2.role AS receiver_role,
        u2.profile_pic AS receiver_profile
      FROM notes n
      LEFT JOIN users u1 ON n.created_by = u1.user_id
      LEFT JOIN users u2 ON n.receiver_id = u2.user_id
      WHERE n.reference_table = ? AND n.reference_id = ?
      AND (n.created_by = ? OR n.receiver_id = ?)
      ORDER BY n.created_dt DESC`,
      [referenceTable, referenceId, userId, userId]
    );

    return rows;
  } catch (error) {
    throw error;
  }
};

// Get unread notes for a user
exports.getUnreadNotes = async (userId) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        n.note_id,
        n.reference_table,
        n.reference_id,
        n.description,
        n.created_dt,
        n.read_status,
        u.name AS created_by_name,
        u.role AS created_by_role,
        u.profile_pic AS created_by_profile
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.user_id
      WHERE n.receiver_id = ? AND n.read_status = FALSE
      ORDER BY n.created_dt DESC`,
      [userId]
    );

    return rows;
  } catch (error) {
    throw error;
  }
};

// Mark a note as read
exports.markNoteAsRead = async (noteId, userId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Generate batch ID for audit trail
    const batchId = await generateBatchId();

    // Check if user is the receiver
    const [noteRows] = await connection.query(
      `SELECT receiver_id FROM notes WHERE note_id = ?`,
      [noteId]
    );

    if (noteRows.length === 0) {
      throw new Error("Note not found");
    }

    if (noteRows[0].receiver_id !== userId) {
      throw new Error("Unauthorized to mark this note as read");
    }

    // Update the read status
    await connection.query(
      `UPDATE notes SET read_status = TRUE WHERE note_id = ?`,
      [noteId]
    );

    // Log in audit trail
    const auditChanges = [
      {
        tableName: "notes",
        recordId: noteId,
        fieldName: "read_status",
        value: true,
        actionType: "UPDATE",
      },
    ];

    await logAuditTrail({
      batchId,
      changes: auditChanges,
      changedBy: userId,
      connection,
    });

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Delete a note
exports.deleteNote = async (noteId, userId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Generate batch ID for audit trail
    const batchId = await generateBatchId();

    // Check if user is the creator
    const [noteRows] = await connection.query(
      `SELECT created_by FROM notes WHERE note_id = ?`,
      [noteId]
    );

    if (noteRows.length === 0) {
      throw new Error("Note not found");
    }

    if (noteRows[0].created_by !== userId) {
      throw new Error("Unauthorized to delete this note");
    }

    // Delete the note
    await connection.query(`DELETE FROM notes WHERE note_id = ?`, [noteId]);

    // Log in audit trail
    const auditChanges = [
      {
        tableName: "notes",
        recordId: noteId,
        fieldName: "note_id",
        value: null,
        actionType: "DELETE",
      },
    ];

    await logAuditTrail({
      batchId,
      changes: auditChanges,
      changedBy: userId,
      connection,
    });

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
