const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    try {
        console.log(req.user);
        
        if(req.user && req.user.user.role == 2){
            next();
        }else {
            res.status(400).send({ message: "Insufficient Permissions" });
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({ message: "Invalid Token" });
    }
};
