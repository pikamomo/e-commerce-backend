const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;
        // const token = req.header("Authorization").split(" ")[1];
        if (!token) {
            return res.status(401).send("Unauthorized");
        }
        const verified = jwt.verify(token, JWT_SECRET);
        if (!verified) {
            return res.status(401).send("Unauthorized");
        }
        req.userId = verified.userId;
        req.role = verified.role;
        next();
    } catch (error) { }
}

module.exports = verifyToken;