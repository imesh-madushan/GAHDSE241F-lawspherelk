const db = require("../config/db");
const { generateUniqueId, generateBatchId } = require("../utils/genarateIDs");
const { logAuditTrail } = require("./commonService");

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
                users.profile_pic AS officer_profile,

                cases.case_id,
                cases.case_type,
                cases.status AS case_status,

                evidance.type AS evidence_type,
                evidance.details AS evidence_details,

                evidance_witnesses.nic AS witness_nic,
                evidance_witnesses.name AS witness_name,
                evidance_witnesses.phone AS witness_phone,
                evidance_witnesses.email AS witness_email,
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
                            ew.email,
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
                email: witnessRows[0].email,
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

exports.searchComplaints = async (filters) => {
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
                users.profile_pic AS officer_profile,

                cases.case_id,
                cases.case_type,
                cases.status AS case_status,

                evidance.type AS evidence_type,
                evidance.details AS evidence_details,

                evidance_witnesses.nic AS witness_nic,
                evidance_witnesses.name AS witness_name,
                evidance_witnesses.phone AS witness_phone,
                evidance_witnesses.email AS witness_email,
                evidance_witnesses.address AS witness_address,
                evidance_witnesses.dob AS witness_dob

                FROM complaints
                INNER JOIN users ON complaints.officer_id = users.user_id
                INNER JOIN cases ON complaints.complain_id = cases.complain_id
                INNER JOIN evidance ON evidance.evidence_id = complaints.first_evidance_id
                INNER JOIN evidance_witnesses ON evidance.evidence_id = evidance_witnesses.evidence_id
                WHERE 1=1`;

    const params = [];

    // Description filter
    if (filters.description) {
        query += ` AND complaints.description LIKE ?`;
        params.push(`%${filters.description}%`);
    }
    // Complaint ID filter
    if (filters.complain_id) {
        query += ` AND complaints.complain_id LIKE ?`;
        params.push(`%${filters.complain_id}%`);
    }
    // Officer name filter
    if (filters.officer) {
        query += ` AND users.name LIKE ?`;
        params.push(`%${filters.officer}%`);
    }
    // Complainer name filter (witness)
    if (filters.complainer) {
        query += ` AND evidance_witnesses.name LIKE ?`;
        params.push(`%${filters.complainer}%`);
    }
    // Status filter
    if (filters.status && filters.status !== 'all') {
        query += ` AND complaints.status = ?`;
        params.push(filters.status);
    }
    // Time period filter
    if (filters.timePeriod && filters.timePeriod !== 'all') {
        if (filters.timePeriod === 'last_7_days') {
            query += ` AND complaints.complain_dt >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        } else if (filters.timePeriod === 'last_30_days') {
            query += ` AND complaints.complain_dt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
        } else if (filters.timePeriod === 'last_90_days') {
            query += ` AND complaints.complain_dt >= DATE_SUB(NOW(), INTERVAL 90 DAY)`;
        }
    }

    query += ` ORDER BY complaints.complain_dt DESC`;

    const [rows] = await db.query(query, params);
    return rows;
};

// this will also create a case and evidence
exports.createComplaint = async (description, complainer, evidence_details, complain_type, currentUser) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Generate batch ID for this operation to track all related changes
        const batchId = await generateBatchId();
    
        const complainId = await generateUniqueId("complaints");
        const evidenceId = await generateUniqueId("evidance");
        const caseId = await generateUniqueId("cases");

        // Insert evidence (voice statement)
        await connection.query(
            `INSERT INTO evidance (evidence_id, type, details, collected_dt, officer_id)
             VALUES (?, ?, ?, NOW(), ?)`,
            [
                evidenceId,
                "Voice Statement",
                evidence_details || "",
                currentUser.user_id
            ]
        );

        // Insert complaint
        await connection.query(
            `INSERT INTO complaints (complain_id, description, complain_dt, status, officer_id, first_evidance_id)
             VALUES (?, ?, NOW(), 'new', ?, ?)`,
            [
                complainId,
                description,
                currentUser.user_id,
                evidenceId
            ]
        );

        // Insert complainer as evidence witness
        if (complainer) {
            const { nic, name, phone, email, address, dob } = complainer;
            await connection.query(
                `INSERT INTO evidance_witnesses (evidence_id, nic, name, phone, email, address, dob)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    evidenceId,
                    nic,
                    name,
                    phone || null,
                    email || null,
                    address || null,
                    dob || null
                ]
            );
        }

        // Insert case if it doesn't exist
        await connection.query(
            `INSERT INTO cases (case_id, case_type, status, complain_id)
             VALUES (?, ?, 'oicnotreviewed', ?)`,
            [
                caseId,
                complain_type,
                complainId
            ]
        );

        // Insert to case_evidance
        await connection.query(
            `INSERT INTO case_evidance (case_id, evidence_id)
             VALUES (?, ?)`,
            [
                caseId,
                evidenceId
            ]
        );

        // Log all the insertions in audit trail
        const auditChanges = [
            // Evidence creation
            { tableName: 'evidance', recordId: evidenceId, fieldName: 'type', value: 'Voice Statement',  actionType: 'INSERT' },
            { tableName: 'evidance', recordId: evidenceId, fieldName: 'details', value: evidence_details || "", actionType: 'INSERT' },
            { tableName: 'evidance', recordId: evidenceId, fieldName: 'officer_id', value: currentUser.user_id, actionType: 'INSERT' },

            // Complaint creation
            { tableName: 'complaints', recordId: complainId, fieldName: 'description', value: description, actionType: 'INSERT' },
            { tableName: 'complaints', recordId: complainId, fieldName: 'status', value: 'new', actionType: 'INSERT' },
            { tableName: 'complaints', recordId: complainId, fieldName: 'officer_id', value: currentUser.user_id, actionType: 'INSERT' },
            { tableName: 'complaints', recordId: complainId, fieldName: 'first_evidance_id', value: evidenceId, actionType: 'INSERT' },

            // Evidence witness creation
            { tableName: 'evidance_witnesses', recordId: `${evidenceId}_${complainer.nic}`, fieldName: 'nic', value: complainer.nic, actionType: 'INSERT' },
            { tableName: 'evidance_witnesses', recordId: `${evidenceId}_${complainer.nic}`, fieldName: 'name', value: complainer.name, actionType: 'INSERT' },
            { tableName: 'evidance_witnesses', recordId: `${evidenceId}_${complainer.nic}`, fieldName: 'phone', value: complainer.phone || null, actionType: 'INSERT' },
            { tableName: 'evidance_witnesses', recordId: `${evidenceId}_${complainer.nic}`, fieldName: 'email', value: complainer.email || null, actionType: 'INSERT' },
            { tableName: 'evidance_witnesses', recordId: `${evidenceId}_${complainer.nic}`, fieldName: 'address', value: complainer.address || null, actionType: 'INSERT' },
            { tableName: 'evidance_witnesses', recordId: `${evidenceId}_${complainer.nic}`, fieldName: 'dob', value: complainer.dob || null, actionType: 'INSERT' },

            // Case creation
            { tableName: 'cases', recordId: caseId, fieldName: 'case_type', value: complain_type, actionType: 'INSERT' },
            { tableName: 'cases', recordId: caseId, fieldName: 'status', value: 'oicnotreviewed', actionType: 'INSERT' },
            { tableName: 'cases', recordId: caseId, fieldName: 'complain_id', value: complainId, actionType: 'INSERT' },

            // Case evidence relationship
            { tableName: 'case_evidance', recordId: `${caseId}_${evidenceId}`, fieldName: 'case_id', value: caseId, actionType: 'INSERT' },
            { tableName: 'case_evidance', recordId: `${caseId}_${evidenceId}`, fieldName: 'evidence_id', value: evidenceId, actionType: 'INSERT' }
        ];

        await logAuditTrail({
            batchId,
            changes: auditChanges,
            changedBy: currentUser.user_id,
            connection
        });

        await connection.commit();

        return {
            complain_id: complainId,
        };

    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

exports.closeComplaint = async (complaintId, caseId, closedBy) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Generate batch ID for this operation
        const batchId = await generateBatchId();
        if (!batchId) {
            throw new Error("Failed to generate batch ID for audit trail");
        }

        // Get current complaint data before closing for audit
        const [currentComplaint] = await connection.query(
            "SELECT status, complain_dt FROM complaints WHERE complain_id = ?",
            [complaintId]
        );
        
        if (currentComplaint.length === 0) {
            throw new Error("Complaint not found");
        }
        
        const oldStatus = currentComplaint[0].status;
        
        if (oldStatus === 'closed') {
            throw new Error("Complaint is already closed");
        }
        
        // Update complaint status to closed
        const [result] = await connection.query(
            "UPDATE complaints SET status = 'closed' WHERE complain_id = ?",
            [complaintId]
        );
        
        if (result.affectedRows === 0) {
            throw new Error("Failed to update complaint status");
        }
        
        
        
        // Update case status to rejected if case exists
        if (caseId) {
            // Get current case data before updating
            const [currentCase] = await connection.query(
                "SELECT status, started_dt FROM cases WHERE case_id = ?",
                [caseId]
            );
            
            if (currentCase.length > 0) {
                const oldCaseStatus = currentCase[0].status;
                
                const [caseResult] = await connection.query(
                    "UPDATE cases SET status = 'oicrejected', end_dt = NOW() WHERE case_id = ?",
                    [caseId]
                );
            }
        }


        // Log data in audit trail
        await logAuditTrail({
            batchId,
            changes: [
                {tableName: 'complaints', recordId: complaintId, fieldName: 'status', value: 'closed', actionType: 'UPDATE' },
                {tableName: 'cases', recordId: caseId, fieldName: 'status', value: 'oicrejected', actionType: 'UPDATE' }
            ],
            changedBy: closedBy,
            connection,
        });

        await connection.commit();
        return true;
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Update complaint and complainer details
exports.updateComplaint = async (complaintId, updateData, updatedBy) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const batchId = await generateBatchId();
       
        // Track audit changes
        const auditChanges = [];

        // Update complaint fields (description, status, etc.)
        if (updateData.description !== undefined) {
            await connection.query(
                "UPDATE complaints SET description = ? WHERE complain_id = ?",
                [updateData.description, complaintId]
            );
            auditChanges.push({
                tableName: 'complaints',
                recordId: complaintId,
                fieldName: 'description',
                value: updateData.description,
                actionType: 'UPDATE'
            });
        }
        if (updateData.status !== undefined) {
            await connection.query(
                "UPDATE complaints SET status = ? WHERE complain_id = ?",
                [updateData.status, complaintId]
            );
            auditChanges.push({
                tableName: 'complaints',
                recordId: complaintId,
                fieldName: 'status',
                value: updateData.status,
                actionType: 'UPDATE'
            });
        }

        // Update complainer (evidance_witnesses) fields
        if (updateData.complainer && updateData.complainer.nic) {
            // Get first_evidance_id for this complaint
            const [[complaintRow]] = await connection.query(
                "SELECT first_evidance_id FROM complaints WHERE complain_id = ?",
                [complaintId]
            );
            const evidenceId = complaintRow?.first_evidance_id;
            if (evidenceId) {
                const { nic, name, phone, email, address, dob } = updateData.complainer;
                // Only update if NIC is present (primary key)
                if (name !== undefined) {
                    await connection.query(
                        "UPDATE evidance_witnesses SET name = ? WHERE evidence_id = ? AND nic = ?",
                        [name, evidenceId, nic]
                    );
                    auditChanges.push({
                        tableName: 'evidance_witnesses',
                        recordId: `${evidenceId}_${nic}`,
                        fieldName: 'name',
                        value: name,
                        actionType: 'UPDATE'
                    });
                }
                if (phone !== undefined) {
                    await connection.query(
                        "UPDATE evidance_witnesses SET phone = ? WHERE evidence_id = ? AND nic = ?",
                        [phone, evidenceId, nic]
                    );
                    auditChanges.push({
                        tableName: 'evidance_witnesses',
                        recordId: `${evidenceId}_${nic}`,
                        fieldName: 'phone',
                        value: phone,
                        actionType: 'UPDATE'
                    });
                }
                if (email !== undefined) {
                    await connection.query(
                        "UPDATE evidance_witnesses SET email = ? WHERE evidence_id = ? AND nic = ?",
                        [email, evidenceId, nic]
                    );
                    auditChanges.push({
                        tableName: 'evidance_witnesses',
                        recordId: `${evidenceId}_${nic}`,
                        fieldName: 'email',
                        value: email,
                        actionType: 'UPDATE'
                    });
                }
                if (address !== undefined) {
                    await connection.query(
                        "UPDATE evidance_witnesses SET address = ? WHERE evidence_id = ? AND nic = ?",
                        [address, evidenceId, nic]
                    );
                    auditChanges.push({
                        tableName: 'evidance_witnesses',
                        recordId: `${evidenceId}_${nic}`,
                        fieldName: 'address',
                        value: address,
                        actionType: 'UPDATE'
                    });
                }
                if (dob !== undefined) {
                    // Ensure only the date part is used (YYYY-MM-DD)
                    const dobDate = dob ? String(dob).slice(0, 10) : null;
                    await connection.query(
                        "UPDATE evidance_witnesses SET dob = ? WHERE evidence_id = ? AND nic = ?",
                        [dobDate, evidenceId, nic]
                    );
                    auditChanges.push({
                        tableName: 'evidance_witnesses',
                        recordId: `${evidenceId}_${nic}`,
                        fieldName: 'dob',
                        value: dobDate,
                        actionType: 'UPDATE'
                    });
                }
            }
        }

        // Log audit
        if (auditChanges.length > 0) {
            await logAuditTrail({
                batchId,
                changes: auditChanges,
                changedBy: updatedBy,
                connection
            });
        }

        await connection.commit();
        return true;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};