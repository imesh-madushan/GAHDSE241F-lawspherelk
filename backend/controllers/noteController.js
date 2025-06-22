const { getUserFromCookies } = require("../middlewares/authMiddleware");
const noteService = require("../services/noteService");
const { generateNoteID } = require("../utils/genarateIDs");

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { reference_table, reference_id, description, receiver_id } =
      req.body;

    // Validate required parameters
    if (!reference_table) {
      return res.status(400).json({ message: "Reference table is required" });
    }
    if (!reference_id) {
      return res.status(400).json({ message: "Reference ID is required" });
    }
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }
    if (!receiver_id) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    // Generate note ID
    const note_id = await generateNoteID();

    // Create note data object
    const noteData = {
      note_id,
      reference_table,
      reference_id,
      description,
      receiver_id,
    };
    // Create the note
    const result = await noteService.createNote(noteData, user.user_id);

    if (!result || !result.success) {
      return res.status(500).json({ message: "Failed to create note" });
    }

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note_id: result.note_id,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get notes by reference
exports.getNotesByReference = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { reference_table, reference_id } = req.params;

    // Validate required parameters
    if (!reference_table) {
      return res.status(400).json({ message: "Reference table is required" });
    }
    if (!reference_id) {
      return res.status(400).json({ message: "Reference ID is required" });
    }

    // Get notes
    const notes = await noteService.getNotesByReference(
      reference_table,
      reference_id,
      user.user_id
    );

    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      notes,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get unread notes for the logged-in user
exports.getUnreadNotes = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get unread notes
    const notes = await noteService.getUnreadNotes(user.user_id);

    res.status(200).json({
      success: true,
      message: "Unread notes fetched successfully",
      notes,
    });
  } catch (error) {
    console.error("Error fetching unread notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get received notes for the logged-in user
exports.getReceivedNotes = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get received notes
    const notes = await noteService.getReceivedNotes(user.user_id);

    res.status(200).json({
      success: true,
      message: "Received notes fetched successfully",
      notes,
    });
  } catch (error) {
    console.error("Error fetching received notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get sent notes for the logged-in user
exports.getSentNotes = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get sent notes
    const notes = await noteService.getSentNotes(user.user_id);

    res.status(200).json({
      success: true,
      message: "Sent notes fetched successfully",
      notes,
    });
  } catch (error) {
    console.error("Error fetching sent notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search notes
exports.searchNotes = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const searchParams = req.query;

    // Search notes
    const notes = await noteService.searchNotes(searchParams, user.user_id);

    res.status(200).json({
      success: true,
      message: "Notes search completed successfully",
      notes,
    });
  } catch (error) {
    console.error("Error searching notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark a note as read
exports.markNoteAsRead = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { note_id } = req.params;

    // Validate required parameters
    if (!note_id) {
      return res.status(400).json({ message: "Note ID is required" });
    }

    // Mark note as read
    const result = await noteService.markNoteAsRead(note_id, user.user_id);

    if (!result || !result.success) {
      return res.status(500).json({ message: "Failed to mark note as read" });
    }

    res.status(200).json({
      success: true,
      message: "Note marked as read successfully",
    });
  } catch (error) {
    console.error("Error marking note as read:", error);

    if (error.message === "Unauthorized to mark this note as read") {
      return res.status(403).json({ message: error.message });
    }

    if (error.message === "Note not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { note_id } = req.params;

    // Validate required parameters
    if (!note_id) {
      return res.status(400).json({ message: "Note ID is required" });
    }

    // Delete note
    const result = await noteService.deleteNote(note_id, user.user_id);

    if (!result || !result.success) {
      return res.status(500).json({ message: "Failed to delete note" });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);

    if (error.message === "Unauthorized to delete this note") {
      return res.status(403).json({ message: error.message });
    }

    if (error.message === "Note not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
