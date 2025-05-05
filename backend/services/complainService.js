const db = require("../config/db");

exports.getAllComplaints = async (filters) => {
    let query = `SELECT 
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
    
    const params = [];
    
    //if status filter is provided
    if (filters.status) {
        query += ` WHERE complaints.status = ?`;
        params.push(filters.status);
    }
    
    query += ` ORDER BY complaints.complain_dt DESC`;
    
    // if limit filter is provided
    if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(filters.limit);
    }
    
    const [rows] = await db.query(query, params);
    return rows;
};

// get complaint by id
exports.getComplaintById = async (complaintId) => {
    // Get main complaint data with related information
    const query = `SELECT 
                complaints.complain_id,
                complaints.description,
                complaints.complain_dt,
                complaints.status,
                complaints.officer_id,
                complaints.first_evidance_id,
                
                users.name AS officer_name,
                users.role AS officer_role,
                users.profile_pic AS officer_profile,
                
                cases.case_id,
                cases.topic AS case_topic,
                cases.case_type,
                cases.status AS case_status,
                cases.leader_id AS case_leader_id,
                
                leader.name AS case_leader_name,
                leader.role AS case_leader_role,
                leader.profile_pic AS case_leader_profile
                
                FROM complaints
                LEFT JOIN users ON complaints.officer_id = users.user_id
                LEFT JOIN cases ON complaints.complain_id = cases.complain_id
                LEFT JOIN users AS leader ON cases.leader_id = leader.user_id
                WHERE complaints.complain_id = ?`;
    
    const [complaintRows] = await db.query(query, [complaintId]);
    
    if (complaintRows.length === 0) {
        return null;
    }
    
    const complaintData = complaintRows[0];
    
    // Create separate case object (if case exists)
    const caseData = complaintData.case_id ? {
        case_id: complaintData.case_id,
        topic: complaintData.case_topic,
        case_type: complaintData.case_type,
        status: complaintData.case_status,
        leader_id: complaintData.case_leader_id,
        leader_name: complaintData.case_leader_name,
        leader_role: complaintData.case_leader_role,
        leader_profile: complaintData.case_leader_profile
    } : null;
    
    // Remove case fields from complaint object
    delete complaintData.case_id;
    delete complaintData.case_topic;
    delete complaintData.case_type;
    delete complaintData.case_status;
    delete complaintData.case_leader_id;
    delete complaintData.case_leader_name;
    delete complaintData.case_leader_role;
    delete complaintData.case_leader_profile;
    
    // Get complainant details from evidance_witnesses table
    let complainer = null;
    let firstEvidence = null;
    
    if (complaintData.first_evidance_id) {
        const witnessQuery = `SELECT 
                            ew.nic,
                            ew.name,
                            ew.phone,
                            ew.address,
                            ew.dob,
                            e.type AS evidence_type,
                            e.details AS evidence_details,
                            e.collected_dt
                            FROM evidance_witnesses AS ew
                            JOIN evidance AS e ON ew.evidence_id = e.evidence_id
                            WHERE e.evidence_id = ?`;
                            
        const [witnessRows] = await db.query(witnessQuery, [complaintData.first_evidance_id]);
        
        if (witnessRows.length > 0) {
            // Create complainant object
            complainer = {
                nic: witnessRows[0].nic,
                name: witnessRows[0].name,
                phone: witnessRows[0].phone,
                address: witnessRows[0].address,
                dob: witnessRows[0].dob,
            };
            
            // Create first evidence object
            firstEvidence = {
                evidence_id: complaintData.first_evidance_id,
                type: witnessRows[0].evidence_type,
                details: witnessRows[0].evidence_details,
                collected_dt: witnessRows[0].collected_dt
            };
        }
    }
    
    // Remove first_evidance_id from complaint object
    delete complaintData.first_evidance_id;
    
    // Get all evidence related to this complaint
    const evidenceQuery = `SELECT 
                        e.evidence_id,
                        e.type,
                        e.location,
                        e.details,
                        e.collected_dt,
                        u.name AS collected_by,
                        u.user_id AS officer_id,
                        u.role AS officer_role,
                        u.profile_pic AS officer_profile
                        FROM evidance e
                        JOIN case_evidance ce ON e.evidence_id = ce.evidence_id
                        JOIN cases c ON ce.case_id = c.case_id
                        LEFT JOIN users u ON e.officer_id = u.user_id
                        WHERE c.complain_id = ?`;
                        
    const [evidenceRows] = await db.query(evidenceQuery, [complaintId]);
    
    // If there's a case, get any reports related to the complaint
    let reports = [];
    if (caseData?.case_id) {
        const reportsQuery = `
            SELECT 
                r.report_id,
                r.report_type,
                r.content,
                r.remarks,
                r.status,
                r.created_dt,
                u.name as created_by,
                u.user_id as officer_id,
                u.role as officer_role,
                u.profile_pic as officer_profile
            FROM reports r
            JOIN report_refrences rr ON r.report_id = rr.report_id
            LEFT JOIN users u ON r.officer_id = u.user_id
            WHERE (rr.ref_id = ? AND rr.ref_type = 'complaint')
               OR (rr.ref_id = ? AND rr.ref_type = 'case')
        `;
        
        const [reportsRows] = await db.query(reportsQuery, [complaintId, caseData.case_id]);
        reports = reportsRows;
    }
    
    // Return structured data similar to caseService
    return {
        ...complaintData,
        case: caseData,
        complainer: complainer,
        firstEvidence: firstEvidence,
        evidence: evidenceRows,
        reports: reports
    };
};