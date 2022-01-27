const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: {
      type: String,
      required: true,
      index: { unique: true },
    },
    firstName: String,
    lastName: String,
    name : String,
    bio : String,
    usernameOrEmail: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: String,
    //0 user
    //1 admin
    // 2 superadmin
    role: { type: Number, required: true },
    avatar: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('user', UserSchema);
module.exports = User;
