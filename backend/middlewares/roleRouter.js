const { getUserFromCookies } = require('../middlewares/authMiddleware');

const roleRouter = (controllers) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.authtoken;
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const user  = await getUserFromCookies(token);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userRole = user.role;
      if (!controllers[userRole]) {
        return res.status(403).json({ message: "Access denied for your role" });
      }
      
      // call the matching controller function with the uerRole
      return controllers[userRole](req, res, next);
    } 
    catch (error) {
      console.error("Role routing error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};

module.exports = roleRouter;
