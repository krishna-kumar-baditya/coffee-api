function authorizedRole(...allowedRoles) {
    return (req, res, next) => {
        try {
            // Assume req.user is set by auth middleware
        const user = req.user;
        if (!user || !user.role) {
            return res.status(401).send({
                status: 400,
                data: {},
                message: "Unauthorized : User not authenticated",
            });
        }
        const userRole = user.role
        if(!allowedRoles.includes(userRole)){
            return res.status(403).send({
                status : 401,
                data : {},
                message : "Forbidden : You don't have permission to access this resource"
            })
        }
        // Role is authorized
        next()
        } catch (error) {
            console.error("Role authorization error : ",error);
            return res.status(500).send({
                status : 500,
                message : "Internal server error during authorizaion"
            })
            
        }
        
    };
}
module.exports = authorizedRole