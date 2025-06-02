const db = require("../config/db");
const { generateUniqueId, generateBatchId } = require("../utils/genarateIDs");
const { logAuditTrail } = require("./commonService");

// Helper: Only count Convicted offences for total_crimes and total_risk
const CRIME_JOIN = `
    LEFT JOIN CrimeOffence o 
        ON c.criminal_id = o.criminal_id 
        AND o.status = 'Convicted'
`;

exports.getAllCriminals = async (filters, userRole, userId) => {
    try {
        let query = `
            SELECT 
                c.*,
                COUNT(o.offence_id) as total_crimes,
                COALESCE(SUM(o.risk_score), 0) as total_risk
            FROM CriminalRecord c
            ${CRIME_JOIN}
            WHERE 1=1
        `;
        const params = [];

        // Add role-based filtering if needed
        if (userRole === "Sub Inspector") {
            query += ` AND EXISTS (
                SELECT 1 FROM CrimeOffence co
                JOIN Cases ca ON co.case_id = ca.case_id
                WHERE co.criminal_id = c.criminal_id
                AND ca.leader_id = ?
            )`;
            params.push(userId);
        }

        query += ` GROUP BY c.criminal_id ORDER BY c.name ASC`;

        if (filters.limit) {
            query += ` LIMIT ?`;
            params.push(filters.limit);
        }

        const [rows] = await db.query(query, params);
        return rows;
    } catch (error) {
        console.error('Error in getAllCriminals service:', error);
        throw error;
    }
};

exports.searchCriminals = async (filters, userRole, userId) => {
    try {
        // Build WHERE conditions and params for pre-aggregation filters
        let whereClauses = ['1=1'];
        const params = [];

        // Name filter (partial match)
        if (filters.name) {
            whereClauses.push(`c.name LIKE ?`);
            params.push(`%${filters.name}%`);
        }

        // NIC filter (partial match)
        if (filters.nic) {
            whereClauses.push(`c.nic LIKE ?`);
            params.push(`%${filters.nic}%`);
        }

        // Fingerprint filter (partial match)
        if (filters.fingerprint) {
            whereClauses.push(`c.fingerprint_hash LIKE ?`);
            params.push(`%${filters.fingerprint}%`);
        }

        // criminal_id filter (exact match)
        if (filters.id) {
            whereClauses.push(`c.criminal_id = ?`);
            params.push(filters.id);
        }

        // Role-based filtering for Sub Inspector
        if (userRole === "Sub Inspector") {
            whereClauses.push(`EXISTS (
                SELECT 1 FROM CrimeOffence co
                JOIN Cases ca ON co.case_id = ca.case_id
                WHERE co.criminal_id = c.criminal_id
                AND ca.leader_id = ?
            )`);
            params.push(userId);
        }

        let query = `
            SELECT 
                c.*,
                COUNT(o.offence_id) as total_crimes,
                COALESCE(SUM(o.risk_score), 0) as total_risk
            FROM CriminalRecord c
            ${CRIME_JOIN}
            WHERE ${whereClauses.join(' AND ')}
            GROUP BY c.criminal_id
        `;

        // Post-aggregation risk filter (must be in HAVING)
        if (filters.risk && filters.risk !== 'all') {
            if (filters.risk === 'high') {
                query += ` HAVING total_risk >= 70`;
            } else if (filters.risk === 'medium') {
                query += ` HAVING total_risk >= 40 AND total_risk < 70`;
            } else if (filters.risk === 'low') {
                query += ` HAVING total_risk < 40`;
            }
        }

        query += ` ORDER BY c.name ASC`;

        const [rows] = await db.query(query, params);
        return rows;
    } catch (error) {
        console.error('Error in searchCriminals service:', error);
        throw error;
    }
};

exports.getCriminalById = async (criminal_id, userRole, userId) => {
    try {
        // Get main criminal data
        let query = `
            SELECT 
                c.*,
                COUNT(o.offence_id) as total_crimes,
                COALESCE(AVG(o.risk_score), 0) as total_risk
            FROM CriminalRecord c
            LEFT JOIN CrimeOffence o ON c.criminal_id = o.criminal_id
            WHERE c.criminal_id = ?
            GROUP BY c.criminal_id
        `;
        const params = [criminal_id];

        // Add role-based filtering
        if (userRole === "Sub Inspector") {
            query += ` AND EXISTS (
                SELECT 1 FROM CrimeOffence co
                JOIN Cases ca ON co.case_id = ca.case_id
                WHERE co.criminal_id = c.criminal_id
                AND ca.leader_id = ?
            )`;
            params.push(userId);
        }

        const [criminalRows] = await db.query(query, params);

        if (criminalRows.length === 0) {
            return null;
        }

        const criminalData = criminalRows[0];

        // Get offences with their victims
        const [offences] = await db.query(`
            SELECT 
                o.*,
                c.case_id,
                c.topic as case_topic,
                c.case_type,
                c.status as case_status,
                v.nic as victim_nic,
                v.name as victim_name,
                v.phone as victim_phone,
                v.address as victim_address,
                v.dob as victim_dob
            FROM CrimeOffence o
            JOIN Cases c ON o.case_id = c.case_id
            LEFT JOIN CrimeOffence_Victim v ON o.offence_id = v.offence_id
            WHERE o.criminal_id = ?
        `, [criminal_id]);

        // Group victims by offence
        const offencesWithVictims = offences.reduce((acc, curr) => {
            const existingOffence = acc.find(o => o.offence_id === curr.offence_id);

            if (existingOffence) {
                if (curr.victim_nic) {
                    existingOffence.victims.push({
                        nic: curr.victim_nic,
                        name: curr.victim_name,
                        phone: curr.victim_phone,
                        address: curr.victim_address,
                        dob: curr.victim_dob
                    });
                }
            } else {
                acc.push({
                    offence_id: curr.offence_id,
                    crime_type: curr.crime_type,
                    status: curr.status,
                    risk_score: curr.risk_score,
                    reported_dt: curr.reported_dt,
                    happened_dt: curr.happened_dt,
                    case_id: curr.case_id,
                    case_topic: curr.case_topic,
                    case_type: curr.case_type,
                    case_status: curr.case_status,
                    victims: curr.victim_nic ? [{
                        nic: curr.victim_nic,
                        name: curr.victim_name,
                        phone: curr.victim_phone,
                        address: curr.victim_address,
                        dob: curr.victim_dob
                    }] : []
                });
            }
            return acc;
        }, []);

        // Get evidence
        const [evidence] = await db.query(`
            SELECT 
                e.*,
                u.name as collected_by,
                u.role as officer_role,
                u.profile_pic as officer_profile
            FROM Evidance e
            JOIN CrimeOffence_Evidance ce ON e.evidence_id = ce.evidence_id
            JOIN CrimeOffence o ON ce.offence_id = o.offence_id
            LEFT JOIN Users u ON e.officer_id = u.user_id
            WHERE o.criminal_id = ?
        `, [criminal_id]);

        return {
            ...criminalData,
            offences: offencesWithVictims,
            evidence
        };
    } catch (error) {
        console.error('Error in getCriminalById service:', error);
        throw error;
    }
};

exports.createCriminal = async (criminalData, currentUser) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Generate batch ID for this operation to track all related changes
        const batchId = await generateBatchId();
        const criminalId = await generateUniqueId("criminalrecord");

        const { name, nic, phone, address, dob, fingerprint_hash, photo } = criminalData;

        // Insert criminal record
        await connection.query(
            `INSERT INTO criminalrecord (criminal_id, name, nic, phone, address, dob${fingerprint_hash ? ', fingerprint_hash' : ''}${photo ? ', photo' : ''})
             VALUES (?, ?, ?, ?, ?, ?${fingerprint_hash ? ', ?' : ''}${photo ? ', ?' : ''})`,
            [
                criminalId,
                name,
                nic,
                phone,
                address,
                dob,
                ...(fingerprint_hash ? [fingerprint_hash] : []),
                ...(photo ? [photo] : [])
            ]
        );

        // Log all the insertions in audit trail
        const auditChanges = [
            { tableName: 'criminalrecord', recordId: criminalId, fieldName: 'name', value: name, actionType: 'INSERT' },
            { tableName: 'criminalrecord', recordId: criminalId, fieldName: 'nic', value: nic, actionType: 'INSERT' },
            { tableName: 'criminalrecord', recordId: criminalId, fieldName: 'phone', value: phone, actionType: 'INSERT' },
            { tableName: 'criminalrecord', recordId: criminalId, fieldName: 'address', value: address, actionType: 'INSERT' },
            { tableName: 'criminalrecord', recordId: criminalId, fieldName: 'dob', value: dob, actionType: 'INSERT' }
        ];
        if (fingerprint_hash) {
            auditChanges.push({ tableName: 'criminalrecord', recordId: criminalId, fieldName: 'fingerprint_hash', value: fingerprint_hash, actionType: 'INSERT' });
        }
        if (photo) {
            auditChanges.push({ tableName: 'criminalrecord', recordId: criminalId, fieldName: 'photo', value: photo, actionType: 'INSERT' });
        }

        await logAuditTrail({
            batchId,
            changes: auditChanges,
            changedBy: currentUser,
            connection
        });

        await connection.commit();

        // Return the created criminal
        const [newCriminal] = await connection.query(
            `SELECT criminal_id, name, nic, phone, address, dob, fingerprint_hash, photo 
             FROM criminalrecord WHERE criminal_id = ?`,
            [criminalId]
        );

        return newCriminal[0];

    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

exports.updateCriminal = async (criminal_id, updateData, userId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const batchId = await generateBatchId();
        // Get current data
        const [currentRows] = await connection.query("SELECT * FROM criminalrecord WHERE criminal_id = ?", [criminal_id]);
        if (!currentRows || currentRows.length === 0) {
            connection.release();
            return null;
        }
        const current = currentRows[0];
        // Only update changed fields
        const fields = [];
        const values = [];
        const changes = [];
        const updatable = ['name', 'nic', 'phone', 'address', 'dob', 'fingerprint_hash', 'photo'];
        updatable.forEach(field => {
            if (updateData[field] !== undefined && updateData[field] !== current[field]) {
                fields.push(`${field} = ?`);
                values.push(updateData[field]);
                changes.push({
                    tableName: 'criminalrecord',
                    recordId: criminal_id,
                    fieldName: field,
                    value: updateData[field],
                    actionType: 'UPDATE'
                });
            }
        });
        if (fields.length === 0) {
            connection.release();
            return current; // nothing to update
        }
        await connection.query(
            `UPDATE criminalrecord SET ${fields.join(', ')} WHERE criminal_id = ?`,
            [...values, criminal_id]
        );
        await logAuditTrail({
            batchId,
            changes,
            changedBy: userId,
            connection
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