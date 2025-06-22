const db = require("../config/db");

// Map table names to their ID prefixes and ID column names
const idPatterns = {
    cases:           { prefix: "C",    column: "case_id" },
    complaints:      { prefix: "CMP",  column: "complain_id" },
    evidance:        { prefix: "EVD",  column: "evidence_id" },
    users:           { prefix: "U",    column: "user_id" },
    criminalrecord:  { prefix: "CRIM", column: "criminal_id" },
    crimeoffence:    { prefix: "OFF",  column: "offence_id" },
    investigation:   { prefix: "INV",  column: "investigation_id" },
    forensicreport:  { prefix: "FR",   column: "report_id" },
    reports:         { prefix: "R",    column: "report_id" },
    usersessions:    { prefix: "S",    column: "session_id" },
    audit_log:       { prefix: "AUD",  column: "audit_id" },
    attachments:     { prefix: "ATT",  column: "attachment_id" },
    notes:           { prefix: "NOTE",    column: "note_id" },
    online_complaints: { prefix: "OCMP", column: "complaint_id" },
    online_complaint_evidence: { prefix: "OEVD", column: "evidence_id" },

};

// Helper to generate a random ID with a prefix and N digits
function randomId(prefix, digits = 10) {
  const num = Math.floor(Math.random() * Math.pow(10, digits));
  return `${prefix}${num.toString().padStart(digits, "0")}`;
}

// Generate a unique ID for a given table
const generateUniqueId = async (table) => {
  const pattern = idPatterns[table];
  if (!pattern) throw new Error(`Unknown table for ID generation: ${table}`);

  let unique = false;
  let maxAttempts = 10;
  let newId = "";
  while (!unique && maxAttempts > 0) {
    newId = randomId(pattern.prefix);
    const query = `SELECT 1 FROM \`${table}\` WHERE \`${pattern.column}\` = ? LIMIT 1`;
    const [rows] = await db.query(query, [newId]);
    if (rows.length === 0) unique = true;
    maxAttempts--;
  }
  return newId;
};

const generateBatchId = async () => {
  const prefix = "B";
  let unique = false;
  let maxAttempts = 10;
  let newId = "";
  while (!unique && maxAttempts > 0) {
    newId = randomId(prefix);
    const query = `SELECT 1 FROM \`audit_log\` WHERE \`batch_id\` = ? LIMIT 1`;
    const [rows] = await db.query(query, [newId]);
    if (rows.length === 0) unique = true;
    maxAttempts--;
  }
  return newId;
};

module.exports = {
  generateUniqueId,
  generateBatchId,
  generateNoteID: async () => await generateUniqueId("notes"),
};
