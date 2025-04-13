const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// get all complaints
exports.getAllComplaints = async (req, res) => {
    const query = `SELECT 
                complaints.complain_id,
                complaints.description,
                complaints.complain_dt,
                complaints.status AS complaint_status,
                complaints.officer_id,
                complaints.first_evidance_id,

                users.user_id AS officer_id,
                users.name AS officer_name,
                users.role AS officer_role,

                cases.case_id,
                cases.case_type,
                cases.status AS case_status,

                evidance.type AS evidence_type,
                evidance.details AS evidence_details,

                evidance_witnesses.nic AS witness_nic,
                evidance_witnesses.name AS witness_name,
                evidance_witnesses.phone AS witness_phone,
                evidance_witnesses.address AS witness_address,
                evidance_witnesses.dob AS witness_dob

                FROM complaints
                INNER JOIN users ON complaints.officer_id = users.user_id
                INNER JOIN cases ON complaints.complain_id = cases.complain_id
                INNER JOIN evidance ON evidance.evidence_id = complaints.first_evidance_id
                INNER JOIN evidance_witnesses ON evidance.evidence_id = evidance_witnesses.evidence_id`;
    try {
        const [rows] = await db.query(query);
        console.log()
        res.status(200).json({message: "Complaints fetched successfully", complaints: rows});
    } 
    catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};