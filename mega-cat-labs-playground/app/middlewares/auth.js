const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader)
        return res.status(401).json({ message: "JWT Token not provided" });
    token = bearerHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Auth Error" });

    try {
        const decoded = jwt.verify(token, "mega-cat-secret");
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(500).send({ message: "Invalid Token" });
    }
};
