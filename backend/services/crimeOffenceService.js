const db = require('../config/db');

const buildSortClause = (sortBy, sortOrder) => {
    const validColumns = ['reported_dt', 'happened_dt', 'risk_score', 'crime_type', 'status'];
    const validOrders = ['ASC', 'DESC'];

    const column = validColumns.includes(sortBy) ? sortBy : 'reported_dt';
    const order = validOrders.includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    return ` ORDER BY co.${column} ${order}`;
};

const buildPaginationClause = (limit, offset) => {
    const parsedLimit = parseInt(limit) || 10;
    const parsedOffset = parseInt(offset) || 0;
    return ` LIMIT ${parsedLimit} OFFSET ${parsedOffset}`;
};

exports.getAllOffences = async (userRole, userId, options = {}) => {
    try {
        const { limit, offset, sortBy, sortOrder, search } = options;

        // First get the total count
        let countQuery = `
            SELECT COUNT(*) as total_count
            FROM CrimeOffence co
            JOIN CriminalRecord cr ON co.criminal_id = cr.criminal_id
            JOIN Cases c ON co.case_id = c.case_id
            WHERE 1=1
        `;

        // Main query for getting the data
        let query = `
            SELECT 
                co.offence_id,
                co.status,
                co.crime_type,
                co.risk_score,
                co.reported_dt,
                co.happened_dt,
                cr.criminal_id,
                cr.name as criminal_name,
                cr.fingerprint_hash as criminal_fingerprint_hash,
                cr.nic as criminal_nic,
                cr.phone as criminal_phone,
                cr.address as criminal_address,
                cr.dob as criminal_dob,
                cr.total_crimes as criminal_total_crimes,
                cr.total_risk as criminal_total_risk,
                c.case_id,
                c.topic as case_topic
            FROM CrimeOffence co
            JOIN CriminalRecord cr ON co.criminal_id = cr.criminal_id
            JOIN Cases c ON co.case_id = c.case_id
            WHERE 1=1
        `;

        const params = [];

        // Add role-based filtering
        if (userRole === 'Sub Inspector') {
            query += ` AND c.leader_id = ?`;
            countQuery += ` AND c.leader_id = ?`;
            params.push(userId);
        }

        // Add search if provided
        if (search) {
            const searchCondition = ` AND (
                co.crime_type LIKE ? OR
                cr.name LIKE ? OR
                cr.criminal_id LIKE ? OR
                cr.nic LIKE ? OR
                c.case_id LIKE ?
            )`;
            query += searchCondition;
            countQuery += searchCondition;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
        }

        // Add sorting
        query += buildSortClause(sortBy, sortOrder);

        // Add pagination
        query += buildPaginationClause(limit, offset);

        // Execute both queries
        const [offences] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, params);
        const totalCount = countResult[0].total_count;

        // Add total count to each offence
        return offences.map(offence => ({
            ...offence,
            total_count: totalCount
        }));
    } catch (error) {
        console.error('Error in getAllOffences:', error);
        throw new Error('Failed to fetch offences');
    }
};

exports.searchOffences = async (filters, userRole, userId, options = {}) => {
    try {
        const { limit, offset, sortBy, sortOrder } = options;

        // First get the total count
        let countQuery = `
            SELECT COUNT(*) as total_count
            FROM CrimeOffence co
            JOIN CriminalRecord cr ON co.criminal_id = cr.criminal_id
            JOIN Cases c ON co.case_id = c.case_id
            WHERE 1=1
        `;

        // Main query for getting the data
        let query = `
            SELECT 
                co.offence_id,
                co.status,
                co.crime_type,
                co.risk_score,
                co.reported_dt,
                co.happened_dt,
                cr.criminal_id,
                cr.name as criminal_name,
                cr.fingerprint_hash as criminal_fingerprint_hash,
                cr.nic as criminal_nic,
                cr.phone as criminal_phone,
                cr.address as criminal_address,
                cr.dob as criminal_dob,
                cr.total_crimes as criminal_total_crimes,
                cr.total_risk as criminal_total_risk,
                c.case_id,
                c.topic as case_topic
            FROM CrimeOffence co
            JOIN CriminalRecord cr ON co.criminal_id = cr.criminal_id
            JOIN Cases c ON co.case_id = c.case_id
            WHERE 1=1
        `;

        const params = [];

        // Add search filters
        if (filters.crime_type) {
            query += ` AND co.crime_type LIKE ?`;
            countQuery += ` AND co.crime_type LIKE ?`;
            params.push(`%${filters.crime_type}%`);
        }

        if (filters.criminal_name) {
            query += ` AND cr.name LIKE ?`;
            countQuery += ` AND cr.name LIKE ?`;
            params.push(`%${filters.criminal_name}%`);
        }

        if (filters.criminal_id) {
            query += ` AND cr.criminal_id = ?`;
            countQuery += ` AND cr.criminal_id = ?`;
            params.push(filters.criminal_id);
        }

        if (filters.fingerprint) {
            query += ` AND cr.fingerprint_hash = ?`;
            countQuery += ` AND cr.fingerprint_hash = ?`;
            params.push(filters.fingerprint);
        }

        if (filters.nic) {
            query += ` AND cr.nic = ?`;
            countQuery += ` AND cr.nic = ?`;
            params.push(filters.nic);
        }

        if (filters.case_id) {
            query += ` AND c.case_id = ?`;
            countQuery += ` AND c.case_id = ?`;
            params.push(filters.case_id);
        }

        if (filters.status) {
            query += ` AND co.status = ?`;
            countQuery += ` AND co.status = ?`;
            params.push(filters.status);
        }

        // Risk level filter
        if (filters.risk_level) {
            const riskCondition = filters.risk_level === 'high'
                ? ' AND co.risk_score >= 70'
                : filters.risk_level === 'medium'
                    ? ' AND co.risk_score >= 40 AND co.risk_score < 70'
                    : ' AND co.risk_score < 40';
            query += riskCondition;
            countQuery += riskCondition;
        }

        // Date range filter
        if (filters.start_date) {
            query += ` AND co.reported_dt >= ?`;
            countQuery += ` AND co.reported_dt >= ?`;
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ` AND co.reported_dt <= ?`;
            countQuery += ` AND co.reported_dt <= ?`;
            params.push(filters.end_date);
        }

        // Add role-based filtering
        if (userRole === 'Sub Inspector') {
            query += ` AND c.leader_id = ?`;
            countQuery += ` AND c.leader_id = ?`;
            params.push(userId);
        }

        // Add sorting
        query += buildSortClause(sortBy, sortOrder);

        // Add pagination
        query += buildPaginationClause(limit, offset);

        // Execute both queries
        const [offences] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, params);
        const totalCount = countResult[0].total_count;

        // Add total count to each offence
        return offences.map(offence => ({
            ...offence,
            total_count: totalCount
        }));
    } catch (error) {
        console.error('Error in searchOffences:', error);
        throw new Error('Search failed');
    }
};

