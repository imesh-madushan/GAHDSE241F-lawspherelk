const db = require('../config/db');

exports.getAllCriminals = async (filters, userRole, userId) => {
    try {
        let query = `
            SELECT 
                c.*,
                COUNT(o.offence_id) as total_crimes,
                COALESCE(AVG(o.risk_score), 0) as total_risk
            FROM CriminalRecord c
            LEFT JOIN CrimeOffence o ON c.criminal_id = o.criminal_id
            WHERE 1=1
        `;
        const params = [];

        // Add role-based filtering if needed
        if (userRole === "Sub Inspector") {
            // Add any specific filtering for Sub Inspector role
            // For example, only show criminals related to their cases
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
        let query = `
            SELECT 
                c.*,
                COUNT(o.offence_id) as total_crimes,
                COALESCE(AVG(o.risk_score), 0) as total_risk
            FROM CriminalRecord c
            LEFT JOIN CrimeOffence o ON c.criminal_id = o.criminal_id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (filters.name) {
            query += ` AND c.name LIKE ?`;
            params.push(`%${filters.name}%`);
        }

        if (filters.nic) {
            query += ` AND c.nic LIKE ?`;
            params.push(`%${filters.nic}%`);
        }

        if (filters.fingerprint) {
            query += ` AND c.fingerprint_hash LIKE ?`;
            params.push(`%${filters.fingerprint}%`);
        }

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

        query += ` GROUP BY c.criminal_id ORDER BY c.name ASC`;

        const [rows] = await db.query(query, params);
        return rows;
    } catch (error) {
        console.error('Error in searchCriminals service:', error);
        throw error;
    }
};

exports.getCriminalById = async (id, userRole, userId) => {
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
        const params = [id];

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
        `, [id]);

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
        `, [id]);

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

exports.createCriminal = async (criminalData, userRole, userId) => {
    try {
        const {
            name,
            nic,
            phone,
            address,
            dob,
            fingerprint_hash,
            photo
        } = criminalData;

        const query = `
            INSERT INTO CriminalRecord (
                criminal_id,
                name,
                nic,
                phone,
                address,
                dob,
                fingerprint_hash,
                photo,
                total_crimes,
                total_risk
            ) VALUES (
                UUID(),
                ?, ?, ?, ?, ?, ?, ?,
                0,
                0.00
            )
            RETURNING *
        `;
        const values = [name, nic, phone, address, dob, fingerprint_hash, photo];
        const [result] = await db.query(query, values);
        return result[0];
    } catch (error) {
        console.error('Error in createCriminal service:', error);
        throw error;
    }
};

exports.updateCriminal = async (id, updateData, userRole, userId) => {
    try {
        const {
            name,
            nic,
            phone,
            address,
            dob,
            fingerprint_hash,
            photo
        } = updateData;

        const query = `
            UPDATE CriminalRecord
            SET 
                name = COALESCE(?, name),
                nic = COALESCE(?, nic),
                phone = COALESCE(?, phone),
                address = COALESCE(?, address),
                dob = COALESCE(?, dob),
                fingerprint_hash = COALESCE(?, fingerprint_hash),
                photo = COALESCE(?, photo)
            WHERE criminal_id = ?
            RETURNING *
        `;
        const values = [name, nic, phone, address, dob, fingerprint_hash, photo, id];
        const [result] = await db.query(query, values);
        return result[0];
    } catch (error) {
        console.error('Error in updateCriminal service:', error);
        throw error;
    }
};

exports.deleteCriminal = async (id, userRole, userId) => {
    try {
        const query = 'DELETE FROM CriminalRecord WHERE criminal_id = ? RETURNING *';
        const [result] = await db.query(query, [id]);
        return result[0];
    } catch (error) {
        console.error('Error in deleteCriminal service:', error);
        throw error;
    }
}; 