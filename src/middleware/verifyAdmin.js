const verifyAdmin = (req, res, next) => {
    if (req.role !== "admin") {
        return res.status(403).send({success: false, message: "You are not authorized to access this resource"});
    }
    next();
}

module.exports = verifyAdmin;