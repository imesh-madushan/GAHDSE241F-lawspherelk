const express = require("express");
const router = express.Router();
const {
  createNote,
  getNotesByReference,
  getUnreadNotes,
  markNoteAsRead,
  deleteNote,
} = require("../controllers/noteController");

// Create a new note
router.post("/create", createNote);

// Get notes by reference table and id
router.get("/reference/:reference_table/:reference_id", getNotesByReference);

// Get unread notes for the logged-in user
router.get("/unread", getUnreadNotes);

// Mark a note as read
router.put("/read/:note_id", markNoteAsRead);

// Delete a note
router.delete("/:note_id", deleteNote);

module.exports = router;
