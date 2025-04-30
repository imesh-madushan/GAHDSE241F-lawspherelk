const { getUserFromCookies } = require('../middlewares/authMiddleware');
const caseService = require('../services/caseService');

// get all cases for OIC and Crime OIC
exports.getAllCases = async (req, res) => {
    const filters = {};

    const token = req.cookies.authtoken;
    if (!token) {
    return res.status(401).json({ message: "No token provided" });
    }

    const user  = await getUserFromCookies(token);
    if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.query.status) {
        filters.status = req.query.status;
    }
    if (req.query.limit) {
        filters.limit = parseInt(req.query.limit, 10);
    }
            
    try {
        const cases = await caseService.getAllCases(filters, user.role, user.id);
        
        if (cases.length === 0) {
            console.log("No cases found");
            return res.status(404).json({ message: "No cases found" });
        }
               
        res.status(200).json({message: "Cases fetched successfully", cases});
    } 
    catch (error) {
        console.error("Error fetching cases:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};