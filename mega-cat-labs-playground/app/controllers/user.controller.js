const db = require("../models");
const User = db.users;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uploadFile, getUrl } = require("./../utils/fileUpload");

// Create and Save a new User
exports.create = async (req, res) => {
    try {
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        let user = new User({
            username: req.body.userName,
            password: hash,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            usernameOrEmail: req.body.email,
            role: req.body.role ? req.body.role : 0,
            googleId: "",
        });

        if (req.body.googleId) {
            let newUser = await User.findOne({ googleId: req.body.googleId });
            if (newUser) {
                //If user present in our database.
                res.status(200).json({
                    message: "Already registered!",
                    data: newUser,
                });
            } else {
                // if user is not preset in our database save user data to database.
                user.googleId = req.body.googleId;
            }
        }

        let registeredUser = await user.save();
        res.status(200).json({
            message: "User " + req.body.userName + " was successfully created!",
            data: registeredUser,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err,
        });
    }
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {};
// Find a single User with an id
exports.findOne = async (req, res) => {
    try {
        let user = await User.findById(req.body.id);
        res.status(200).json({
            data: user,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err,
        });
    }
};
// Update a User by the id in the request
exports.update = (req, res) => {};
// Delete a User with the specified id in the request
exports.delete = (req, res) => {};
// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {};

//Update user avatar
exports.updateAvatar = async (req, res) => {
    try {
        console.log("heerrrrrrrr: ", req.user);
        const result = await uploadFile(req.files.avatar);
        const url = await getUrl(req.files.avatar);

        let updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                avatar: url,
            },
            { new: true }
        );
        let token = await jwt.sign(
            {
                user: updatedUser,
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
                    id: updatedUser.id,
                    name: updatedUser.firstName + " " + updatedUser.lastName,
                    usernameOrEmail: updatedUser.email,
                    role: updatedUser.role,
                    avatar: result.Location,
                },
            });
        } else {
            res.status(400).json({
                type: "Authentication Failed",
                success: false,
                message: " please login first",
            });
        }
    } catch (error) {}
};
//Remove Avatar
exports.removeAvatar = async (req, res) => {
    try {
        let updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                avatar: "",
            },
            { new: true }
        );
        let token = await jwt.sign(
            {
                user: updatedUser,
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
                    id: updatedUser.id,
                    name: updatedUser.firstName + " " + updatedUser.lastName,
                    usernameOrEmail: updatedUser.email,
                    role: updatedUser.role,
                    avatar: updatedUser.avatar,
                },
            });
        } else {
            res.status(400).json({
                type: "Authentication Failed",
                success: false,
                message: " please login first",
            });
        }
    } catch (error) {}
};

//Update Email
exports.updateEmail = async (req, res) => {
    try {
        const email = await req.body.email;

        let updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                email: email,
            },
            { new: true }
        );
        let token = await jwt.sign(
            {
                user: updatedUser,
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
                    id: updatedUser.id,
                    name: updatedUser.firstName + " " + updatedUser.lastName,
                    usernameOrEmail: updatedUser.email,
                    role: updatedUser.role,
                    avatar: updatedUser.avatar,
                },
            });
        } else {
            res.status(400).json({
                type: "Authentication Failed",
                success: false,
                message: " please login first",
            });
        }
    } catch (error) {}
};

//Update Password
exports.updatePassword = async (req, res) => {
    try {
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);

        let updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                password: hash,
            },
            { new: true }
        );
        let token = await jwt.sign(
            {
                user: updatedUser,
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
                    id: updatedUser.id,
                    name: updatedUser.firstName + " " + updatedUser.lastName,
                    usernameOrEmail: updatedUser.email,
                    role: updatedUser.role,
                    avatar: updatedUser.avatar,
                },
            });
        } else {
            res.status(400).json({
                type: "Authentication Failed",
                success: false,
                message: " please login first",
            });
        }
    } catch (error) {}
};


//Update Profile
exports.updateProfile = async (req, res) => {
    try {

        let updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                usernameOrEmail: req.body.userName,
                bio: req.body.bio,
            },
            { new: true }
        );
        let token = await jwt.sign(
            {
                user: updatedUser,
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
                    id: updatedUser.id,
                    name: updatedUser.firstName + " " + updatedUser.lastName,
                    username: updatedUser.username,
                    usernameOrEmail: updatedUser.usernameOrEmail,
                    bio: updatedUser.bio,
                    role: updatedUser.role,
                    avatar: updatedUser.avatar,
                },
            });
        } else {
            res.status(400).json({
                type: "Authentication Failed",
                success: false,
                message: " please login first",
            });
        }
    } catch (error) {}
};