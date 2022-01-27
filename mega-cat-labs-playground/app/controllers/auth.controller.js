const db = require("../models");
const User = db.users;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const session = require("express-session");


exports.lookupEmail = async (req,res) => {
    try {
        let user = await User.findOne({username : req.body.userName});
        if (user) {
            res.status(200).json ({
                email : user.usernameOrEmail
            });
        }else {
            res.status(400).json({
                type: "Lookup failed",
                success: false,
                message: "No Matching email found",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({error : error});
    }
}

exports.loginUserFirebase = async (req,res) => {
    try {
        let user = await User.findOne({usernameOrEmail : req.body.email});
        if (user) {
            let token = await jwt.sign(
                {
                    user,
                },
                "mega-cat-secret",
                {
                    expiresIn: 3600,
                }
            );

            if (token) {
                res.status(200).json({
                    success: true,
                    token: token,
                    user: {
                        id: user.id,
                        name: user.firstName + " " + user.lastName,
                        usernameOrEmail: user.usernameOrEmail,
                        role: user.role,
                        avatar: user.avatar,
                    },
                });
            } else {
                res.status(400).json({
                    type: "Authentication Failed",
                    success: false,
                    message: "Incorrect login credentials, please try again.",
                });
            }

        }else {
            res.status(400).json({
                type: "Authentication Failed",
                success: false,
                message: "Incorrect login credentials, please try again.",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({error : error});
    }
}

exports.createUserFirebase = async (req, res) => {
    try {
        let user = await User.findOne({usernameOrEmail : req.body.email});
        if(user) {
            user.username = req.body.username;
            await user.save();
        }else {
            user = new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            usernameOrEmail: req.body.email,
            role: req.body.role ? req.body.role : 0,

            });
            await user.save();
        }


        let token = await jwt.sign(
            {
                user,
            },
            "mega-cat-secret",
            {
                expiresIn: 3600,
            }
        );

        if (token) {
            res.status(200).json({
                success: true,
                token: token,
                user: {
                    id: user.id,
                    name: user.firstName + " " + user.lastName,
                    usernameOrEmail: user.usernameOrEmail,
                    role: user.role,
                    avatar: user.avatar,
                },
            });
        } else {
            res.status(400).json({
                type: "Authentication Failed",
                success: false,
                message: "Incorrect login credentials, please try again.",
            });
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({error : error});
    }
}

exports.loginWithJwt = async (req,res) => {
    try {
        let decoded = jwt.decode(req.body.idToken);
        let user = await User.findOne({usernameOrEmail : decoded.email});
        console.log(decoded);
        if(!user){
            //create user
            user = new User({
                name : decoded.name,
                username: decoded.email,
                usernameOrEmail: decoded.email,
                role: 0,
                avatar : decoded.picture,
                googleId: decoded.user_id,
            });
            await user.save();
        }

        let token = await jwt.sign(
            {
                user,
            },
            "mega-cat-secret",
            {
                expiresIn: 3600,
            }
        );

        if (token) {
            res.status(200).json({
                success: true,
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    usernameOrEmail: user.usernameOrEmail,
                    role: user.role,
                    avatar: user.avatar,
                },
            });
        } else {
            res.status(400).json({
                type: "Authentication Failed",
                success: false,
                message: "Incorrect login credentials, please try again.",
            });
        }



    } catch (error) {
        console.log(error);
        return res.status(500).json({error : error});
    }
}

//Authenticate User
exports.login = async (req, res) => {
    const login = {
        username: req.body.userName,
        password: req.body.password,
    };

    try {
        let user;
        if(login.username.includes("@")){
             user = await User.findOne({
                email: login.username,
            });
        }else {
             user = await User.findOne({
                userName: login.username,
            });
        }


        if (!user) {
            console.log(`Failed authentication for user ${login.username}`);

            res.status(400).json({
                type: "Authentication Failed",
                message: "Incorrect login credentials, please try again.",
            });

            return;
        }

        let match = await bcrypt.compare(login.password, user.password);
        if (match) {
            let token = await jwt.sign(
                {
                    user,
                },
                "mega-cat-secret",
                {
                    expiresIn: 3600,
                }
            );

            if (token) {
                res.status(200).json({
                    success: true,
                    token: token,
                    user: {
                        id: user.id,
                        name: user.firstName + " " + user.lastName,
                        usernameOrEmail: user.usernameOrEmail,
                        role: user.role,
                        avatar: user.avatar,
                    },
                });
            } else {
                res.status(400).json({
                    type: "Authentication Failed",
                    success: false,
                    message: "Incorrect login credentials, please try again.",
                });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            type: "Authentication error",
            message: err,
        });
    }
};

exports.verify = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Verified",
    });
};
